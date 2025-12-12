Dream Holidays – Full Stack Travel App
======================================

Table of Contents
-----------------
- Overview
- Feature Set
- Architecture & Tech Stack
- Directory Layout
- Frontend Details
- Backend Details
- Data Models
- Authentication Flow
- API Endpoints (high-level)
- Environment Variables
- Local Development
- Deployment (Frontend & Backend)
- Image Upload Notes
- Troubleshooting & Debugging
- Useful Scripts
- Guides & References

Overview
--------
Dream Holidays is a full-stack travel platform to search flights and hotels, build and book packages, manage trips and profile, and generate shareable itinerary visuals. It ships with a React + Vite frontend, an Express + MongoDB backend, JWT auth, and ready-to-deploy configurations for Vercel.

Feature Set
-----------
- Flights: search, list results, detailed booking modal, booking confirmation
- Hotels: search, filters, list, detail pages, amenities, recent searches
- Packages: curated lists, custom package creation, booking, cancellation flow
- Account: profile and cover image upload (Base64), editable profile fields, saved cards
- Shareables: html2canvas-based profile and booking canvases for sharing
- Navigation: protected routes, auth-gated pages, sticky navbar
- UI/UX: Tailwind-based responsive design, consistent buttons, modals, pagination

Architecture & Tech Stack
-------------------------
- Frontend: React 18, Vite, Tailwind CSS, html2canvas, lucide-react
- State/API: Fetch-based API client, localStorage token handling, route protection
- Backend: Express, MongoDB (Mongoose), JWT auth, multer for uploads, nodemailer for emails
- Deployment: Vercel-ready frontend; backend deployable to Vercel or any Node host

Directory Layout (top-level)
-----------------------------
- client/ — React app (src/pages, components, store, utils, assets)
- server/ — Express API (routes, controllers, models, middleware, config)
- README.md — this document
- QUICK_FIX.md, VERCEL_DEPLOYMENT_GUIDE.md, DIAGNOSTIC_CHECKLIST.md, TROUBLESHOOTING_LOGIN_UPLOAD.md, DEPLOYMENT_FIXES.md — helper docs

Frontend Details
----------------
- Entry: client/src/main.jsx, client/src/App.jsx
- Routing: react-router; protected routes via components/common/ProtectedRoute.jsx
- State: localStorage token handling inside utils/api.js + auth helper
- Styles: Tailwind (tailwind.config.js, postcss.config.js), index.css
- Key UI modules:
	- Flights: components/flights/*, pages/Flights.jsx, pages/ConfirmBooking.jsx
	- Hotels: components/hotels/*, pages/Hotels.jsx
	- Packages: components/home/Packeges.jsx, pages/ConfirmPackageBooking.jsx
	- Account: pages/Account.jsx and supporting components (account layout, upload handlers)
	- Common: components/common/* (Navbar, Footer, Pagination, Container, etc.)
	- Home: components/home/* (Banner, FlightHotelSearch, TripPlan, etc.)
	- Canvas: components for shareable images using html2canvas

Backend Details
---------------
- Entry: server/server.js
- Routes: server/routes (auth, flights, packages, payment, savedCards)
- Controllers: server/controllers/* (authController, bookingController, etc.)
- Models: server/models/* (User, Booking, FlightSearch, FlightResult, Hotel, PackageBooking, Payment, Review, Airport, Tour, SavedCard)
- Middleware: auth (JWT protect), upload (multer), errorHandler
- Config: server/config/db.js (Mongo connection)
- Utils: server/utils/* (cloudinary, amadeusClient, sendEmail, generateToken, dbHealthCheck)

Data Models (high-level)
------------------------
- User: profile info, avatar/cover (Base64), password, role, rewardPoints, saved cards
- Booking/PackageBooking: booking metadata and user association
- FlightSearch/FlightResult: persisted search queries and results
- Hotel, Tour, Review, Payment, SavedCard: domain-specific records

Authentication Flow
-------------------
- Login/Register via /api/auth endpoints
- JWT issued by backend, stored in localStorage as `token`
- API client attaches Authorization: Bearer <token>
- ProtectedRoute guards frontend routes requiring auth

API Endpoints (high-level)
--------------------------
- Auth: /api/auth/register, /api/auth/login, /api/auth/profile, /api/auth/upload-image
- Flights: /api/flights/* (search/results)
- Packages: /api/packages/* (list/detail/book/cancel)
- Payment/Saved Cards: /api/payment, /api/saved-cards
- Root health: GET / (simple status JSON)

Environment Variables
---------------------
- Frontend (client/.env.production):
	- VITE_API_URL = https://your-backend-url (backend root, no trailing /api)
- Backend (server/.env on host):
	- MONGODB_URI = your MongoDB connection string
	- JWT_SECRET = auth token secret
	- CLIENT_URL = https://your-frontend-vercel-url
	- EMAIL_USER / EMAIL_PASS = SMTP creds (for emails)
	- NODE_ENV = production

Local Development
-----------------
- Frontend: from client/
	- npm install
	- npm run dev (Vite)
	- npm run build / npm run preview
- Backend: from server/
	- npm install
	- npm run dev (nodemon)
	- npm start

Deployment (Frontend & Backend)
--------------------------------
1) Deploy backend (Vercel or other); capture backend URL.
2) Set frontend VITE_API_URL to that backend URL; redeploy frontend.
3) Ensure backend CORS allows frontend origin (CLIENT_URL env).
4) For Vercel backend: configure vercel.json (builds/routes) and env vars.

Image Upload Notes
------------------
- Upload endpoint: POST /api/auth/upload-image (multer single file, protected)
- Stored as Base64 in MongoDB (avatar/coverImage)
- Frontend sends FormData with fields: image (file), type ("profile" | "cover")
- Size guard: client enforces < 2MB

Troubleshooting & Debugging
---------------------------
- See: QUICK_FIX.md for fastest path; VERCEL_DEPLOYMENT_GUIDE.md for end-to-end; DIAGNOSTIC_CHECKLIST.md for stepwise checks; TROUBLESHOOTING_LOGIN_UPLOAD.md for auth/uploads; DEPLOYMENT_FIXES.md for known fixes.
- Common pitfalls: VITE_API_URL pointing to frontend instead of backend; CORS missing CLIENT_URL; token not sent; oversized images.

Useful Scripts
--------------
- client: npm run dev | build | preview
- server: npm run dev | start
