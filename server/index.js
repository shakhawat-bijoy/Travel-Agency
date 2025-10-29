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

// Health check endpoint
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

// Import and use routes - wrapped in try-catch for safety
try {
  const { default: flightRoutes } = await import("./routes/flights.js");
  app.use("/api/flights", flightRoutes);
} catch (error) {
  console.error("Failed to load flight routes:", error.message);
  app.use("/api/flights/*", (req, res) => {
    res.status(503).json({
      success: false,
      message: "Flight service temporarily unavailable",
      error: error.message,
    });
  });
}

// Database-dependent routes - loaded conditionally
if (process.env.MONGO_URI) {
  try {
    const { default: connectDB } = await import("./config/db.js");
    const { default: authRoutes } = await import("./routes/auth.js");
    const { default: paymentRoutes } = await import("./routes/payment.js");
    const { default: savedCardsRoutes } = await import(
      "./routes/savedCards.js"
    );
    const { default: User } = await import("./models/User.js");

    // Connect to database
    await connectDB();

    // Mount DB-dependent routes
    app.use("/api/auth", authRoutes);
    app.use("/api/payment", paymentRoutes);
    app.use("/api/saved-cards", savedCardsRoutes);

    // Test user creation endpoint
    app.post("/api/users", async (req, res) => {
      try {
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

    console.log("Database routes loaded successfully");
  } catch (error) {
    console.error("Failed to initialize database routes:", error.message);
  }
} else {
  console.warn("MONGO_URI not found - database routes disabled");
}

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
