import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";

const app = express();

// Middleware
app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? [
            "https://travel-agency-one-two.vercel.app",
            process.env.CLIENT_URL,
          ].filter(Boolean)
        : ["http://localhost:3000", "http://localhost:5173"],
    credentials: true,
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Health check endpoint (must be before DB initialization)
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Server is running",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
    env_check: {
      mongo_uri: !!process.env.MONGO_URI,
      jwt_secret: !!process.env.JWT_SECRET,
      amadeus_client_id: !!process.env.AMADEUS_CLIENT_ID,
      amadeus_client_secret: !!process.env.AMADEUS_CLIENT_SECRET,
      client_url: !!process.env.CLIENT_URL,
    },
  });
});

// Lazy load DB and routes to prevent crashes
let dbInitialized = false;
let connectDB, authRoutes, paymentRoutes, flightRoutes, savedCardsRoutes, User;

const initializeDB = async () => {
  if (!dbInitialized) {
    try {
      const dbModule = await import("./config/db.js");
      connectDB = dbModule.default;
      await connectDB();
      dbInitialized = true;
      console.log("Database connected successfully");
    } catch (error) {
      console.error("Database connection failed:", error.message);
      // Don't throw - let routes that don't need DB still work
    }
  }
};

const loadRoutes = async () => {
  try {
    const [auth, payment, flights, cards, userModel] = await Promise.all([
      import("./routes/auth.js").catch((e) => ({ default: null })),
      import("./routes/payment.js").catch((e) => ({ default: null })),
      import("./routes/flights.js").catch((e) => ({ default: null })),
      import("./routes/savedCards.js").catch((e) => ({ default: null })),
      import("./models/User.js").catch((e) => ({ default: null })),
    ]);

    authRoutes = auth.default;
    paymentRoutes = payment.default;
    flightRoutes = flights.default;
    savedCardsRoutes = cards.default;
    User = userModel.default;
  } catch (error) {
    console.error("Failed to load routes:", error.message);
  }
};

// Middleware to ensure DB connection for routes that need it
const requireDB = async (req, res, next) => {
  try {
    await initializeDB();
    if (!dbInitialized) {
      return res.status(503).json({
        success: false,
        message: "Database service unavailable",
      });
    }
    next();
  } catch (error) {
    res.status(503).json({
      success: false,
      message: "Database service unavailable",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Initialize routes asynchronously
loadRoutes().catch(console.error);

// Routes - with lazy loading
app.use("/api/auth", async (req, res, next) => {
  await requireDB(req, res, async () => {
    if (authRoutes) {
      authRoutes(req, res, next);
    } else {
      res
        .status(503)
        .json({ success: false, message: "Auth service unavailable" });
    }
  });
});

app.use("/api/payment", async (req, res, next) => {
  await requireDB(req, res, async () => {
    if (paymentRoutes) {
      paymentRoutes(req, res, next);
    } else {
      res
        .status(503)
        .json({ success: false, message: "Payment service unavailable" });
    }
  });
});

app.use("/api/flights", async (req, res, next) => {
  if (flightRoutes) {
    flightRoutes(req, res, next);
  } else {
    const flights = await import("./routes/flights.js");
    flights.default(req, res, next);
  }
});

app.use("/api/saved-cards", async (req, res, next) => {
  await requireDB(req, res, async () => {
    if (savedCardsRoutes) {
      savedCardsRoutes(req, res, next);
    } else {
      res
        .status(503)
        .json({ success: false, message: "Saved cards service unavailable" });
    }
  });
});

// Test user creation endpoint
app.post("/api/users", requireDB, async (req, res) => {
  try {
    if (!User) {
      throw new Error("User model not loaded");
    }
    const user = await User.create(req.body);
    res.status(201).json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Catch-all route for undefined endpoints
app.use("/api/*", (req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint ${req.originalUrl} not found`,
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error("Global error handler:", error);
  res.status(500).json({
    success: false,
    message: "Internal server error",
    error: process.env.NODE_ENV === "development" ? error.message : undefined,
  });
});

// For Vercel serverless deployment
export default app;
