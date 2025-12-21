# Dream Holidays – Full Stack Travel Platform

<div align="center">

![Dream Holidays](https://img.shields.io/badge/Travel-Platform-blue)
![React](https://img.shields.io/badge/React-19.1.1-61DAFB?logo=react)
![Node.js](https://img.shields.io/badge/Node.js-Express-339933?logo=node.js)
![MongoDB](https://img.shields.io/badge/MongoDB-Database-47A248?logo=mongodb)
![Vite](https://img.shields.io/badge/Vite-Build-646CFF?logo=vite)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-Styling-06B6D4?logo=tailwindcss)

**A comprehensive full-stack travel booking platform with flights, hotels, and package management**

[Features](#features) • [Tech Stack](#tech-stack) • [Installation](#installation) • [Documentation](#documentation) • [API Reference](#api-reference)

</div>

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture & Tech Stack](#architecture--tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation & Setup](#installation--setup)
  - [Frontend Setup](#frontend-setup)
  - [Backend Setup](#backend-setup)
- [Environment Variables](#environment-variables)
- [Database Configuration](#database-configuration)
- [Authentication System](#authentication-system)
- [API Documentation](#api-documentation)
  - [Authentication Endpoints](#authentication-endpoints)
  - [Flight Endpoints](#flight-endpoints)
  - [Hotel Endpoints](#hotel-endpoints)
  - [Package Endpoints](#package-endpoints)
  - [Payment Endpoints](#payment-endpoints)
- [Frontend Architecture](#frontend-architecture)
- [Backend Architecture](#backend-architecture)
- [Database Schema](#database-schema)
- [Development Workflow](#development-workflow)
- [Testing](#testing)
- [Deployment](#deployment)
- [Features Deep Dive](#features-deep-dive)
- [Security Considerations](#security-considerations)
- [Performance Optimization](#performance-optimization)
- [Troubleshooting](#troubleshooting)
- [Best Practices](#best-practices)
- [Contributing](#contributing)
- [FAQ](#faq)
- [License](#license)
- [Credits & Acknowledgments](#credits--acknowledgments)

---

## Overview

**Dream Holidays** is a modern, full-stack travel booking platform designed to provide seamless travel planning and booking experiences. The application allows users to search and book flights, hotels, and complete travel packages with an intuitive user interface and robust backend infrastructure.

Built with cutting-edge web technologies, Dream Holidays delivers:
- **Fast Performance**: Built on Vite and optimized React components
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Secure Authentication**: JWT-based auth system with protected routes
- **Real-time Updates**: Live flight and hotel availability
- **Scalable Architecture**: Microservices-ready backend design
- **Cloud-Ready**: Vercel deployment optimized

### Key Highlights

- 🛫 **Flight Booking**: Search domestic and international flights with real-time pricing
- 🏨 **Hotel Reservations**: Browse and book hotels with detailed amenities
- 📦 **Travel Packages**: Curated and custom package creation
- 👤 **User Profiles**: Personalized dashboards with booking history
- 💳 **Payment Integration**: Secure payment processing with saved cards
- 📱 **Responsive UI**: Seamless experience across all devices
- 🔒 **Secure**: Industry-standard security practices
- 🚀 **Modern Stack**: Latest React, Node.js, and MongoDB technologies

---

## Features

### Core Functionality

#### Flight Management
- **Advanced Flight Search**: Multi-city, round-trip, and one-way flight searches
- **Price Comparison**: Real-time price analysis and best deal recommendations
- **Flight Filters**: Filter by airline, stops, departure time, price range
- **Enhanced Pricing**: Detailed price breakdown with taxes and fees
- **Discount Detection**: Automatic identification of promotional pricing
- **Bangladesh Airport Support**: Complete database of Bangladesh airports
- **Popular Routes**: Pre-configured popular international and domestic routes
- **Booking Confirmation**: Email confirmations with itinerary details
- **Booking Management**: View, modify, and cancel flight bookings

#### Hotel Services
- **Hotel Search**: Location-based hotel discovery
- **Advanced Filters**: Price, rating, amenities, distance filters
- **Hotel Details**: Comprehensive information with photos and reviews
- **Room Selection**: Multiple room types and occupancy options
- **Amenities Display**: Full list of hotel facilities and services
- **Recent Searches**: Quick access to previous hotel searches
- **Availability Check**: Real-time room availability
- **Booking Flow**: Streamlined reservation process

#### Package System
- **Curated Packages**: Pre-designed travel packages
- **Custom Packages**: Build your own package combining flights and hotels
- **Package Categories**: Honeymoon, family, adventure, luxury packages
- **Package Details**: Detailed itineraries and inclusions
- **Package Booking**: Complete package reservation system
- **Cancellation Flow**: Manage package cancellations and refunds
- **Package Recommendations**: AI-driven package suggestions

#### User Account Features
- **Profile Management**: Editable user profiles with avatar and cover images
- **Image Upload**: Base64-encoded profile and cover image uploads (< 2MB)
- **Booking History**: Complete history of flights, hotels, and packages
- **Saved Cards**: Securely store payment methods
- **Reward Points**: Loyalty program with point accumulation
- **Preferences**: Save travel preferences and favorites
- **Account Settings**: Privacy and notification settings

#### Sharing & Visuals
- **Shareable Itineraries**: Generate beautiful itinerary images using html2canvas
- **Profile Cards**: Create shareable profile cards
- **Booking Canvases**: Visual representation of bookings
- **Social Sharing**: One-click sharing to social media platforms

#### UI/UX Features
- **Responsive Design**: Mobile, tablet, and desktop optimized
- **Dark Mode Ready**: Theme support architecture
- **Loading States**: Skeleton loaders and progress indicators
- **Error Handling**: User-friendly error messages
- **Modals & Dialogs**: Clean modal system for interactions
- **Pagination**: Efficient data pagination for large datasets
- **Sticky Navigation**: Always-accessible navigation bar
- **Form Validation**: Real-time form validation with helpful messages
- **Accessibility**: ARIA labels and keyboard navigation support

---

## Architecture & Tech Stack

### Frontend Technologies

#### Core Framework
- **React 19.1.1**: Latest React with concurrent features
- **Vite 6.0+**: Lightning-fast build tool and dev server
- **React Router DOM 7.9.4**: Client-side routing
- **React Router 7.9.4**: Core routing library

#### State Management & Data Fetching
- **Redux Toolkit 2.9.0**: Efficient state management
- **React Redux 9.2.0**: React bindings for Redux
- **Axios 1.12.2**: Promise-based HTTP client
- **Custom API Client**: Fetch-based API abstraction with interceptors

#### Styling & UI
- **Tailwind CSS 4.1.14**: Utility-first CSS framework
- **PostCSS 8.5.6**: CSS transformations
- **Autoprefixer 10.4.21**: Vendor prefix automation
- **Lucide React 0.545.0**: Beautiful icon library
- **React Icons 5.5.0**: Additional icon sets

#### Specialized Libraries
- **html2canvas 1.4.1**: Screenshot and image generation
- **jsPDF 3.0.3**: PDF generation
- **jsPDF-AutoTable 5.0.2**: Table generation for PDFs
- **Leaflet 1.9.4**: Interactive maps
- **React Leaflet 5.0.0**: React wrapper for Leaflet
- **Auth0 React 2.8.0**: Authentication SDK

### Backend Technologies

#### Core Framework
- **Node.js**: JavaScript runtime
- **Express 5.1.0**: Web application framework
- **ES Modules**: Modern JavaScript module system

#### Database & ODM
- **MongoDB**: NoSQL database
- **Mongoose**: MongoDB object modeling

#### Authentication & Security
- **JWT (jsonwebtoken)**: Token-based authentication
- **bcryptjs 3.0.2**: Password hashing
- **cookie-parser 1.4.7**: Cookie handling
- **express-mongo-sanitize 2.2.0**: NoSQL injection protection
- **express-rate-limit 8.1.0**: Rate limiting middleware
- **express-validator 7.2.1**: Request validation

#### Third-Party Integrations
- **Amadeus 11.0.0**: Flight booking API integration
- **Cloudinary 2.7.0**: Image upload and management
- **Nodemailer**: Email sending
- **Axios 1.13.0**: HTTP client for external APIs

#### Utilities
- **dotenv 17.2.3**: Environment variable management
- **cors 2.8.5**: Cross-Origin Resource Sharing
- **multer**: File upload handling
- **nodemon**: Development auto-restart

### Development Tools
- **ESLint**: Code linting
- **Prettier**: Code formatting
- **Vercel**: Deployment platform

---

## Project Structure

\`\`\`
Travel-Agency/
├── client/                          # Frontend React application
│   ├── public/                      # Static public assets
│   ├── src/
│   │   ├── api/                     # API client and services
│   │   ├── assets/                  # Images, fonts, static files
│   │   ├── components/              # React components
│   │   │   ├── common/              # Shared components
│   │   │   ├── flights/             # Flight-related components
│   │   │   ├── hotels/              # Hotel-related components
│   │   │   ├── home/                # Homepage components
│   │   │   └── test/                # Test components
│   │   ├── data/                    # Static data and configurations
│   │   ├── pages/                   # Page components (routes)
│   │   ├── store/                   # Redux store configuration
│   │   ├── utils/                   # Utility functions
│   │   ├── App.jsx                  # Root App component
│   │   ├── main.jsx                 # Application entry point
│   │   └── index.css                # Global styles
│   ├── .env.example                 # Example environment variables
│   ├── .env.production              # Production environment variables
│   ├── package.json                 # Frontend dependencies
│   ├── tailwind.config.js           # Tailwind CSS configuration
│   ├── vercel.json                  # Vercel deployment config
│   └── vite.config.js               # Vite configuration
│
├── server/                          # Backend Node.js application
│   ├── config/                      # Configuration files
│   │   └── db.js                    # MongoDB connection
│   ├── controllers/                 # Request handlers
│   ├── middleware/                  # Express middleware
│   ├── models/                      # Mongoose models
│   ├── routes/                      # API routes
│   ├── scripts/                     # Utility scripts
│   ├── services/                    # Business logic services
│   ├── utils/                       # Utility functions
│   ├── .env.example                 # Example environment variables
│   ├── API_EXAMPLES.md              # API usage examples
│   ├── package.json                 # Backend dependencies
│   ├── server.js                    # Express server entry
│   └── vercel.json                  # Vercel deployment config
│
├── .gitignore                       # Git ignore rules
└── README.md                        # This file
\`\`\`

---

## Prerequisites

Before you begin, ensure you have the following installed on your system:

### Required Software
- **Node.js** (v18.0.0 or higher) - [Download](https://nodejs.org/)
- **npm** (v9.0.0 or higher) or **yarn** (v1.22.0 or higher)
- **MongoDB** (v6.0 or higher) - [Download](https://www.mongodb.com/try/download/community) or use [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- **Git** - [Download](https://git-scm.com/)

### Optional Tools
- **MongoDB Compass** - GUI for MongoDB
- **Postman** - API testing
- **VS Code** - Recommended IDE

### External Service Accounts
- **MongoDB Atlas** account (for cloud database)
- **Amadeus API** credentials (for flight data)
- **Cloudinary** account (for image uploads)
- **Email Service** (Gmail, SendGrid, etc. for email notifications)
- **Vercel** account (for deployment)

---

## Installation & Setup

### Clone the Repository

\`\`\`bash
git clone https://github.com/shakhawat-bijoy/Travel-Agency.git
cd Travel-Agency
\`\`\`

### Frontend Setup

1. **Navigate to the client directory**:
   \`\`\`bash
   cd client
   \`\`\`

2. **Install dependencies**:
   \`\`\`bash
   npm install
   # or
   yarn install
   \`\`\`

3. **Create environment file**:
   \`\`\`bash
   cp .env.example .env.production
   \`\`\`

4. **Configure environment variables**:
   Edit \`.env.production\`:
   \`\`\`env
   VITE_API_URL=http://localhost:5000
   \`\`\`

5. **Start development server**:
   \`\`\`bash
   npm run dev
   \`\`\`

   The application will be available at \`http://localhost:5173\`

6. **Build for production**:
   \`\`\`bash
   npm run build
   \`\`\`

7. **Preview production build**:
   \`\`\`bash
   npm run preview
   \`\`\`

### Backend Setup

1. **Navigate to the server directory**:
   \`\`\`bash
   cd server
   \`\`\`

2. **Install dependencies**:
   \`\`\`bash
   npm install
   \`\`\`

3. **Create environment file**:
   \`\`\`bash
   cp .env.example .env
   \`\`\`

4. **Configure environment variables**:
   Edit \`.env\`:
   \`\`\`env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/travel-agency
   JWT_SECRET=your-secret-key-change-this
   CLIENT_URL=http://localhost:5173
   NODE_ENV=development
   
   # Email Configuration
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   
   # Amadeus API
   AMADEUS_CLIENT_ID=your-amadeus-client-id
   AMADEUS_CLIENT_SECRET=your-amadeus-client-secret
   
   # Cloudinary
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret
   \`\`\`

5. **Start development server**:
   \`\`\`bash
   npm run dev
   \`\`\`

   The server will be available at \`http://localhost:5000\`

6. **Initialize Bangladesh airports** (optional):
   \`\`\`bash
   npm run init-airports
   \`\`\`

---

## Environment Variables

### Frontend Environment Variables

Create a \`.env.production\` file in the \`client/\` directory:

\`\`\`env
# Backend API URL (no trailing slash, no /api)
VITE_API_URL=https://your-backend-url.com

# Optional: Enable debug mode
VITE_DEBUG_MODE=false

# Optional: Google Maps API Key
VITE_GOOGLE_MAPS_KEY=your-google-maps-key

# Optional: Analytics
VITE_ANALYTICS_ID=your-analytics-id
\`\`\`

**Important Notes**:
- \`VITE_API_URL\` should point to your backend root URL, NOT the frontend URL
- Do NOT include \`/api\` at the end of \`VITE_API_URL\`
- All Vite environment variables must be prefixed with \`VITE_\`
- Changes to \`.env\` files require rebuilding the application

### Backend Environment Variables

Create a \`.env\` file in the \`server/\` directory:

\`\`\`env
# Server Configuration
PORT=5000
NODE_ENV=development
API_VERSION=v1

# Database
MONGODB_URI=mongodb://localhost:27017/travel-agency
# For MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/travel-agency?retryWrites=true&w=majority

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d
JWT_COOKIE_EXPIRE=7

# CORS Configuration
CLIENT_URL=http://localhost:5173
# For production:
# CLIENT_URL=https://your-frontend-domain.com

# Email Configuration (Gmail example)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-specific-password
EMAIL_FROM=noreply@dreamholidays.com
EMAIL_FROM_NAME=Dream Holidays

# Amadeus API Credentials
AMADEUS_CLIENT_ID=your-amadeus-client-id
AMADEUS_CLIENT_SECRET=your-amadeus-client-secret
AMADEUS_HOSTNAME=test.api.amadeus.com
# For production:
# AMADEUS_HOSTNAME=api.amadeus.com

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# File Upload
MAX_FILE_SIZE=2097152

# Session
SESSION_SECRET=your-session-secret-key

# Optional: Stripe Payment
STRIPE_PUBLIC_KEY=pk_test_xxxxx
STRIPE_SECRET_KEY=sk_test_xxxxx

# Optional: Redis (for caching)
REDIS_URL=redis://localhost:6379

# Optional: Sentry (for error tracking)
SENTRY_DSN=your-sentry-dsn
\`\`\`

**Security Notes**:
- Never commit \`.env\` files to version control
- Use strong, random values for secrets
- Rotate secrets regularly in production
- Use environment-specific values for different deployment stages
- For Gmail: Use app-specific passwords, not your regular password

---

## Database Configuration

### Local MongoDB Setup

1. **Install MongoDB**:
   - Download from [MongoDB Download Center](https://www.mongodb.com/try/download/community)
   - Follow installation instructions for your OS

2. **Start MongoDB**:
   \`\`\`bash
   # macOS (with Homebrew)
   brew services start mongodb-community

   # Linux
   sudo systemctl start mongod

   # Windows
   # MongoDB runs as a service after installation
   \`\`\`

3. **Verify connection**:
   \`\`\`bash
   mongosh
   \`\`\`

### MongoDB Atlas (Cloud) Setup

1. **Create an account**:
   - Visit [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Sign up for a free account

2. **Create a cluster**:
   - Click "Build a Database"
   - Choose the FREE tier
   - Select a cloud provider and region
   - Name your cluster

3. **Create a database user**:
   - Go to Database Access
   - Add a new database user
   - Save the username and password

4. **Configure network access**:
   - Go to Network Access
   - Add IP Address
   - Allow access from anywhere (0.0.0.0/0) for development
   - For production, whitelist specific IPs

5. **Get connection string**:
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string
   - Replace \`<password>\` with your database user password
   - Update \`MONGODB_URI\` in your \`.env\` file

### Database Initialization

The application will automatically create collections and indexes on first run. To manually initialize data:

\`\`\`bash
# Initialize Bangladesh airports
cd server
npm run init-airports

# Or use the sync script
npm run sync-airports
\`\`\`

---

## Authentication System

### Overview

Dream Holidays uses JWT (JSON Web Tokens) for stateless authentication. The system provides secure user registration, login, and protected routes.

### Authentication Flow

1. **Registration**:
   - User submits registration form with email, password, name
   - Backend validates input and checks for existing users
   - Password is hashed using bcrypt
   - User record is created in MongoDB
   - JWT token is generated and returned
   - Frontend stores token in localStorage

2. **Login**:
   - User submits login credentials
   - Backend verifies email and password
   - JWT token is generated and returned
   - Frontend stores token in localStorage
   - User is redirected to protected pages

3. **Authorization**:
   - Frontend attaches JWT to requests via Authorization header
   - Backend middleware verifies token
   - Protected routes are accessible only with valid tokens
   - Expired tokens return 401 Unauthorized

4. **Logout**:
   - Frontend removes token from localStorage
   - User is redirected to public pages

### Token Structure

\`\`\`javascript
{
  "id": "user-id",
  "email": "user@example.com",
  "role": "user",
  "iat": 1234567890,
  "exp": 1234654290
}
\`\`\`

### Protected Routes

Frontend protected routes use \`ProtectedRoute\` component:

\`\`\`jsx
<Route
  path="/account"
  element={
    <ProtectedRoute>
      <Account />
    </ProtectedRoute>
  }
/>
\`\`\`

Backend protected routes use \`auth\` middleware:

\`\`\`javascript
router.get('/profile', auth, getUserProfile);
\`\`\`

### Password Security

- Passwords are hashed using bcrypt with salt rounds of 10
- Original passwords are never stored
- Password reset via email with temporary tokens

### Security Best Practices

- Tokens expire after 7 days (configurable)
- HTTPS enforced in production
- CORS configured to allow only trusted origins
- Rate limiting on auth endpoints
- Input validation on all auth operations
- NoSQL injection protection

---

## API Documentation

### Base URL

- **Development**: \`http://localhost:5000\`
- **Production**: \`https://your-backend-domain.com\`

All API endpoints are prefixed with \`/api\` unless otherwise specified.

### Authentication Headers

Protected endpoints require JWT authentication:

\`\`\`http
Authorization: Bearer <jwt-token>
\`\`\`

### Response Format

All API responses follow this structure:

\`\`\`json
{
  "success": true,
  "data": { /* response data */ },
  "message": "Operation successful"
}
\`\`\`

Error responses:

\`\`\`json
{
  "success": false,
  "error": "Error message",
  "message": "Detailed error description"
}
\`\`\`


---

### Authentication Endpoints

#### Register User

Create a new user account.

```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123",
  "confirmPassword": "securePassword123"
}
```

**Response**:
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "data": {
    "user": {
      "id": "60d5ec49f1b2c8b1f8e4e1a1",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user"
    }
  }
}
```

#### Login

Authenticate an existing user.

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response**:
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "data": {
    "user": {
      "id": "60d5ec49f1b2c8b1f8e4e1a1",
      "name": "John Doe",
      "email": "john@example.com",
      "avatar": "base64-encoded-string",
      "role": "user",
      "rewardPoints": 0
    }
  }
}
```

#### Get User Profile

Retrieve authenticated user's profile.

```http
GET /api/auth/profile
Authorization: Bearer <token>
```

**Response**:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "60d5ec49f1b2c8b1f8e4e1a1",
      "name": "John Doe",
      "email": "john@example.com",
      "avatar": "base64-encoded-string",
      "coverImage": "base64-encoded-string",
      "phone": "+1234567890",
      "address": "123 Main St",
      "city": "New York",
      "country": "USA",
      "rewardPoints": 150,
      "role": "user",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

#### Update Profile

Update user profile information.

```http
PUT /api/auth/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "John Updated",
  "phone": "+1234567890",
  "address": "456 New St",
  "city": "Los Angeles",
  "country": "USA"
}
```

#### Upload Profile/Cover Image

Upload profile or cover image (Base64 encoded, max 2MB).

```http
POST /api/auth/upload-image
Authorization: Bearer <token>
Content-Type: multipart/form-data

image: <file>
type: "profile" | "cover"
```

**Response**:
```json
{
  "success": true,
  "message": "Image uploaded successfully",
  "data": {
    "imageUrl": "base64-encoded-string"
  }
}
```

---

### Flight Endpoints

#### Search Flights

Search for available flights based on criteria.

```http
GET /api/flights/search?departure_id=DAC&arrival_id=DXB&outbound_date=2024-12-15&adults=1&currency=USD
```

**Query Parameters**:
- `departure_id` (required): Departure airport IATA code
- `arrival_id` (required): Arrival airport IATA code
- `outbound_date` (required): Departure date (YYYY-MM-DD)
- `return_date` (optional): Return date for round trip
- `adults` (optional): Number of adults (default: 1)
- `children` (optional): Number of children (default: 0)
- `infants` (optional): Number of infants (default: 0)
- `travel_class` (optional): ECONOMY, BUSINESS, FIRST
- `currency` (optional): USD, EUR, GBP, etc. (default: USD)

**Response**:
```json
{
  "success": true,
  "data": {
    "searchId": "search-id-123",
    "flights": [
      {
        "id": "flight-1",
        "flightNumber": "EK582",
        "airline": "Emirates",
        "airlineCode": "EK",
        "departureAirport": "DAC",
        "arrivalAirport": "DXB",
        "departureTime": "2024-12-15T10:30:00Z",
        "arrivalTime": "2024-12-15T18:00:00Z",
        "duration": "PT7H30M",
        "stops": 0,
        "price": {
          "total": "450.00",
          "currency": "USD",
          "base": "380.00",
          "discount": {
            "hasDiscount": true,
            "amount": 30.0,
            "percentage": 6
          }
        }
      }
    ]
  }
}
```

#### Get Bangladesh Airports

Retrieve all Bangladesh airports.

```http
GET /api/flights/airports/bangladesh
```

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "DAC",
      "name": "Hazrat Shahjalal International Airport",
      "city": "Dhaka",
      "country": "Bangladesh",
      "iataCode": "DAC",
      "isInternational": true,
      "coordinates": {
        "latitude": 23.8433,
        "longitude": 90.3978
      }
    }
  ]
}
```

#### Get Popular Routes

Retrieve popular flight routes from Bangladesh.

```http
GET /api/flights/popular-routes/bangladesh
```

#### Book Flight

Book a selected flight.

```http
POST /api/flights/book
Authorization: Bearer <token>
Content-Type: application/json

{
  "flightId": "flight-1",
  "passengers": [
    {
      "firstName": "John",
      "lastName": "Doe",
      "dateOfBirth": "1990-01-01",
      "passportNumber": "AB123456",
      "nationality": "US"
    }
  ],
  "contactInfo": {
    "email": "john@example.com",
    "phone": "+1234567890"
  }
}
```

---

### Package Endpoints

#### List Packages

Get all available travel packages.

```http
GET /api/packages
```

**Query Parameters**:
- `category` (optional): Filter by category
- `minPrice` (optional): Minimum price filter
- `maxPrice` (optional): Maximum price filter
- `page` (optional): Page number (default: 1)
- `limit` (optional): Results per page (default: 10)

**Response**:
```json
{
  "success": true,
  "data": {
    "packages": [
      {
        "id": "package-1",
        "title": "Honeymoon in Maldives",
        "category": "honeymoon",
        "price": 2500,
        "currency": "USD",
        "duration": "7 days 6 nights",
        "description": "Luxury honeymoon package",
        "inclusions": ["Flights", "Hotel", "Meals", "Activities"],
        "images": ["image1.jpg", "image2.jpg"]
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalPackages": 50,
      "hasMore": true
    }
  }
}
```

#### Get Package Details

Get detailed information about a specific package.

```http
GET /api/packages/:packageId
```

#### Book Package

Book a travel package.

```http
POST /api/packages/:packageId/book
Authorization: Bearer <token>
Content-Type: application/json

{
  "travelers": 2,
  "startDate": "2024-06-01",
  "specialRequests": "Vegetarian meals"
}
```

#### Cancel Package Booking

Cancel a package booking.

```http
POST /api/packages/bookings/:bookingId/cancel
Authorization: Bearer <token>
```

---

### Payment Endpoints

#### Process Payment

Process a payment for a booking.

```http
POST /api/payment
Authorization: Bearer <token>
Content-Type: application/json

{
  "bookingId": "booking-123",
  "amount": 450.00,
  "currency": "USD",
  "paymentMethod": "card",
  "cardDetails": {
    "cardNumber": "4242424242424242",
    "expiryMonth": "12",
    "expiryYear": "2025",
    "cvv": "123"
  }
}
```

#### Save Payment Card

Save a payment card for future use.

```http
POST /api/saved-cards
Authorization: Bearer <token>
Content-Type: application/json

{
  "cardNumber": "4242424242424242",
  "cardholderName": "John Doe",
  "expiryMonth": "12",
  "expiryYear": "2025",
  "cardType": "visa"
}
```

#### Get Saved Cards

Retrieve user's saved payment cards.

```http
GET /api/saved-cards
Authorization: Bearer <token>
```

#### Delete Saved Card

Remove a saved payment card.

```http
DELETE /api/saved-cards/:cardId
Authorization: Bearer <token>
```

---

## Frontend Architecture

### Component Structure

The frontend follows a modular component structure:

**Common Components** (`components/common/`):
- `Navbar.jsx`: Application navigation bar
- `Footer.jsx`: Footer with links and information
- `ProtectedRoute.jsx`: Route guard for authenticated pages
- `Pagination.jsx`: Reusable pagination component
- `Container.jsx`: Layout wrapper component
- `LoadingSpinner.jsx`: Loading indicator

**Feature Components**:
- **Flights** (`components/flights/`): Flight search, results, booking
- **Hotels** (`components/hotels/`): Hotel listings, filters, details
- **Home** (`components/home/`): Homepage sections and search

### State Management

The application uses Redux Toolkit for state management:

```javascript
// Store structure
{
  auth: {
    user: null,
    token: null,
    isAuthenticated: false
  },
  flights: {
    searchResults: [],
    selectedFlight: null,
    loading: false
  },
  hotels: {
    hotels: [],
    filters: {},
    loading: false
  },
  packages: {
    packages: [],
    selectedPackage: null
  }
}
```

### Routing

Application routes are defined in `App.jsx`:

```javascript
// Public routes
/ - Home page
/login - User login
/register - User registration
/flights - Flight search
/hotels - Hotel search
/packages - Travel packages

// Protected routes (require authentication)
/account - User profile
/bookings - Booking history
/confirm-booking - Booking confirmation
/add-payment-method - Payment methods
```

---

## Backend Architecture

### Controllers

Controllers handle business logic and request processing:

- **authController.js**: User authentication and profile management
- **bookingController.js**: Flight and hotel bookings
- **packageController.js**: Package operations
- **hotelController.js**: Hotel search and management
- **tourController.js**: Tour operations

### Models

Mongoose models define data schemas:

**User Model**:
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  avatar: String (Base64),
  coverImage: String (Base64),
  phone: String,
  address: String,
  city: String,
  country: String,
  role: String (enum: user, admin),
  rewardPoints: Number,
  createdAt: Date
}
```

**Booking Model**:
```javascript
{
  user: ObjectId (ref: User),
  flightId: String,
  bookingReference: String,
  status: String (enum: pending, confirmed, cancelled),
  passengers: Array,
  totalPrice: Number,
  currency: String,
  createdAt: Date
}
```

**Package Model**:
```javascript
{
  title: String,
  description: String,
  category: String,
  price: Number,
  currency: String,
  duration: String,
  inclusions: Array,
  exclusions: Array,
  images: Array,
  isActive: Boolean
}
```

### Middleware

Express middleware for request processing:

- **auth.js**: JWT verification and user authentication
- **upload.js**: File upload handling with Multer
- **errorHandler.js**: Global error handling
- **validator.js**: Request validation
- **rateLimiter.js**: Rate limiting to prevent abuse

### Services

Business logic separated from controllers:

- **flightService.js**: Amadeus API integration
- **hotelService.js**: Hotel search and booking logic
- **emailService.js**: Email notifications

---

## Database Schema

### Collections

The MongoDB database includes the following collections:

1. **users**: User accounts and profiles
2. **bookings**: Flight bookings
3. **packagebookings**: Package reservations
4. **hotels**: Hotel information
5. **tours**: Tour packages
6. **airports**: Airport data
7. **flightsearches**: Search history
8. **flightresults**: Cached search results
9. **payments**: Payment records
10. **reviews**: User reviews
11. **savedcards**: Saved payment methods
12. **custompackagerequests**: Custom package inquiries

### Indexes

Key indexes for performance:
- `users.email`: Unique index for fast user lookup
- `bookings.user`: Index for user booking queries
- `airports.iataCode`: Index for airport searches
- `packages.category`: Index for category filtering

---

## Development Workflow

### Getting Started

1. **Clone and setup**:
   ```bash
   git clone https://github.com/shakhawat-bijoy/Travel-Agency.git
   cd Travel-Agency
   ```

2. **Install dependencies**:
   ```bash
   # Install frontend dependencies
   cd client && npm install
   
   # Install backend dependencies
   cd ../server && npm install
   ```

3. **Configure environment**:
   - Copy `.env.example` to `.env` in both client and server directories
   - Update environment variables with your credentials

4. **Start development**:
   ```bash
   # Terminal 1: Start backend
   cd server && npm run dev
   
   # Terminal 2: Start frontend
   cd client && npm run dev
   ```

### Code Style

- **JavaScript**: ES6+ syntax with ES modules
- **React**: Functional components with hooks
- **Styling**: Tailwind utility classes
- **Naming**: camelCase for variables, PascalCase for components

### Git Workflow

1. Create feature branch: `git checkout -b feature/your-feature`
2. Make changes and commit: `git commit -m "Add feature"`
3. Push to remote: `git push origin feature/your-feature`
4. Create pull request

### Linting

Run ESLint to check code quality:

```bash
# Frontend
cd client && npm run lint

# Backend
cd server && npm run lint
```

---

## Testing

### Manual Testing

Test the application manually:

1. **User Registration & Login**:
   - Register a new user
   - Verify email validation
   - Login with credentials
   - Check token storage

2. **Flight Search**:
   - Search for flights
   - Apply filters
   - View flight details
   - Test booking flow

3. **Profile Management**:
   - Upload profile image
   - Update profile information
   - View booking history

4. **Payment Flow**:
   - Add payment method
   - Process booking payment
   - Save card for future use

### API Testing with Postman

Import the API collection and test endpoints:

1. Set environment variables
2. Test authentication endpoints
3. Test flight search and booking
4. Test package operations
5. Test payment processing

---

## Deployment

### Frontend Deployment (Vercel)

1. **Connect Repository**:
   - Go to [Vercel Dashboard](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository

2. **Configure Build**:
   - Framework Preset: Vite
   - Root Directory: `client`
   - Build Command: `npm run build`
   - Output Directory: `dist`

3. **Set Environment Variables**:
   ```
   VITE_API_URL=https://your-backend-url.vercel.app
   ```

4. **Deploy**:
   - Click "Deploy"
   - Wait for build to complete
   - Access your deployed frontend

### Backend Deployment (Vercel)

1. **Configure vercel.json** in server directory:
   ```json
   {
     "version": 2,
     "builds": [
       {
         "src": "server.js",
         "use": "@vercel/node"
       }
     ],
     "routes": [
       {
         "src": "/(.*)",
         "dest": "server.js"
       }
     ]
   }
   ```

2. **Set Environment Variables** in Vercel:
   - MONGODB_URI
   - JWT_SECRET
   - CLIENT_URL
   - AMADEUS_CLIENT_ID
   - AMADEUS_CLIENT_SECRET
   - EMAIL_USER
   - EMAIL_PASS
   - NODE_ENV=production

3. **Deploy**:
   - Connect repository
   - Set root directory to `server`
   - Deploy

### MongoDB Atlas Setup

1. Create cluster on MongoDB Atlas
2. Configure network access
3. Create database user
4. Get connection string
5. Update MONGODB_URI in environment variables

---

## Features Deep Dive

### Flight Booking System

The flight booking system integrates with Amadeus API:

1. **Search**: Users enter origin, destination, dates, passengers
2. **Results**: System queries Amadeus and displays available flights
3. **Filters**: Apply filters for price, stops, airline, time
4. **Selection**: User selects preferred flight
5. **Passenger Info**: Enter passenger details
6. **Payment**: Process payment securely
7. **Confirmation**: Email confirmation with booking reference

**Key Features**:
- Real-time flight availability
- Price breakdown with taxes and fees
- Discount detection
- Multi-passenger booking
- Seat selection (future enhancement)
- Booking management

### Hotel Search & Booking

Comprehensive hotel search functionality:

1. **Location Search**: Search by city or destination
2. **Filters**: Price range, ratings, amenities
3. **Results**: Display matching hotels with images
4. **Details**: View full hotel information
5. **Room Selection**: Choose room type and occupancy
6. **Booking**: Complete reservation
7. **Confirmation**: Booking confirmation email

**Features**:
- Location-based search
- Advanced filtering
- Photo galleries
- User reviews
- Amenities display
- Recent searches

### Package Management

Travel packages combine flights and hotels:

1. **Browse Packages**: View curated packages by category
2. **Custom Packages**: Build custom packages
3. **Details**: Detailed itineraries and inclusions
4. **Booking**: Book complete packages
5. **Management**: View and manage bookings
6. **Cancellation**: Cancel with refund policy

**Package Types**:
- Honeymoon packages
- Family vacations
- Adventure trips
- Luxury getaways
- Beach holidays
- Cultural tours

### User Profile & Account

Comprehensive account management:

1. **Profile**: Editable user information
2. **Images**: Upload profile and cover images
3. **Booking History**: View all past bookings
4. **Saved Cards**: Manage payment methods
5. **Rewards**: Track reward points
6. **Preferences**: Save travel preferences

### Payment Processing

Secure payment handling:

1. **Card Details**: Enter payment information
2. **Validation**: Real-time card validation
3. **Processing**: Secure payment processing
4. **Confirmation**: Payment confirmation
5. **Save Card**: Option to save for future use
6. **History**: View payment history

---

## Security Considerations

### Authentication Security

- JWT tokens with expiration
- Password hashing with bcrypt (10 rounds)
- Secure password reset flow
- Token stored in httpOnly cookies (optional)
- HTTPS enforced in production

### API Security

- CORS configured for allowed origins
- Rate limiting on all endpoints
- Input validation and sanitization
- NoSQL injection protection
- XSS prevention
- CSRF protection

### Data Security

- Passwords never stored in plain text
- Sensitive data encrypted
- Environment variables for secrets
- Database connection strings secured
- API keys never exposed to frontend

### Best Practices

- Regular security audits
- Dependency vulnerability scanning
- Secure headers with Helmet
- Content Security Policy
- Regular updates and patches

---

## Performance Optimization

### Frontend Optimization

- **Code Splitting**: Dynamic imports for routes
- **Lazy Loading**: Load components on demand
- **Image Optimization**: Compress and resize images
- **Caching**: Browser caching strategies
- **Minification**: Vite builds optimized bundles
- **CDN**: Serve static assets from CDN

### Backend Optimization

- **Database Indexing**: Indexes on frequently queried fields
- **Query Optimization**: Efficient MongoDB queries
- **Caching**: Redis caching for frequent requests
- **Connection Pooling**: MongoDB connection pool
- **Compression**: Gzip compression for responses
- **Rate Limiting**: Prevent API abuse

### Best Practices

- Pagination for large datasets
- Debouncing search inputs
- Optimistic UI updates
- Error boundaries
- Loading states
- Progressive enhancement

---

## Troubleshooting

### Common Issues

**Issue**: CORS errors
**Solution**: Ensure CLIENT_URL in backend .env matches frontend URL

**Issue**: Authentication not working
**Solution**: Check JWT_SECRET is set and token is being sent in headers

**Issue**: Images not uploading
**Solution**: Verify file size < 2MB and correct format

**Issue**: MongoDB connection failed
**Solution**: Check MONGODB_URI format and network access

**Issue**: Amadeus API errors
**Solution**: Verify API credentials and quota limits

**Issue**: Environment variables not loading
**Solution**: Restart dev server after .env changes

### Debug Mode

Enable debug logging:

```env
# Frontend
VITE_DEBUG_MODE=true

# Backend
NODE_ENV=development
DEBUG=app:*
```

### Getting Help

- Check existing documentation
- Review API examples
- Check console for errors
- Test with Postman
- Review server logs

---

## Best Practices

### Code Organization

- Keep components small and focused
- Separate business logic from UI
- Use custom hooks for reusable logic
- Follow consistent naming conventions
- Comment complex logic

### State Management

- Use Redux for global state
- Use local state for component-specific data
- Normalize complex state shapes
- Use selectors for derived data

### API Integration

- Centralize API calls
- Handle errors gracefully
- Show loading states
- Implement retry logic
- Cache responses when appropriate

### Testing

- Write unit tests for utilities
- Test critical user flows
- Test error scenarios
- Test edge cases
- Maintain test coverage

---

## Contributing

We welcome contributions! Please follow these guidelines:

### Getting Started

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Write/update tests
5. Submit a pull request

### Pull Request Process

1. Update documentation
2. Add tests for new features
3. Ensure all tests pass
4. Follow code style guidelines
5. Provide clear PR description

### Code Style

- Follow existing code patterns
- Use meaningful variable names
- Add comments for complex logic
- Keep functions small and focused
- Format code with Prettier

---

## FAQ

**Q: How do I get Amadeus API credentials?**
A: Register at [Amadeus for Developers](https://developers.amadeus.com/) and create an app to get credentials.

**Q: Can I use a different payment gateway?**
A: Yes, integrate your preferred payment service in the payment controller.

**Q: How do I add more airports?**
A: Run `npm run sync-airports` or add manually to the airports collection.

**Q: Can I customize the packages?**
A: Yes, modify the package model and add your custom packages in the database.

**Q: How do I change the email service?**
A: Update the email configuration in `.env` and adjust the email service utility.

**Q: Is there a mobile app?**
A: Currently web-only, but the responsive design works well on mobile browsers.

**Q: How do I add more languages?**
A: Implement i18n using libraries like react-i18next.

**Q: Can I use PostgreSQL instead of MongoDB?**
A: Yes, but you'll need to update models and queries for SQL.

---

## License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## Credits & Acknowledgments

### Technologies Used

- React team for the amazing framework
- Vite team for the blazing-fast build tool
- Tailwind CSS for the utility-first CSS framework
- MongoDB for the flexible NoSQL database
- Amadeus for flight data API

### Contributors

- Shakhawat Bijoy - Project Creator & Lead Developer

### Special Thanks

- Open source community for amazing libraries
- Stack Overflow community for problem-solving
- GitHub for hosting and version control

---

**Built with ❤️ by the Dream Holidays Team**

For questions or support, please open an issue on GitHub.

---

*Last Updated: December 2024*
