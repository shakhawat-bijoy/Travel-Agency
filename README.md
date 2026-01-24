# Dream Holidays – Full Stack Travel Platform

<div align="center">

![Dream Holidays](https://img.shields.io/badge/Travel-Platform-blue)
![React](https://img.shields.io/badge/React-19.1.1-61DAFB?logo=react)
![Node.js](https://img.shields.io/badge/Node.js-Express-339933?logo=node.js)
![MongoDB](https://img.shields.io/badge/MongoDB-Database-47A248?logo=mongodb)
![Vite](https://img.shields.io/badge/Vite-Build-646CFF?logo=vite)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-Styling-06B6D4?logo=tailwindcss)

**A comprehensive full-stack travel booking platform with flights, hotels, and package management**

[Features](#features) • [Tech Stack](#tech-stack) • [Installation](#installation) • [API Reference](#api-reference) • [Deployment](#deployment)

</div>

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Installation & Setup](#installation--setup)
- [Environment Variables](#environment-variables)
- [API Documentation](#api-documentation)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

---

## 🌟 Overview

**Dream Holidays** is a modern, full-stack travel booking platform designed to provide seamless travel planning and booking experiences. Built with cutting-edge web technologies, it offers flight booking, hotel reservations, and complete travel packages with an intuitive user interface.

### Key Highlights

- 🛫 **Flight Booking** - Search domestic and international flights with real-time pricing
- 🏨 **Hotel Reservations** - Browse and book hotels with detailed amenities
- 📦 **Travel Packages** - Curated and custom package creation
- 👤 **User Profiles** - Personalized dashboards with booking history
- 💳 **Payment Integration** - Secure payment processing with saved cards
- 📱 **Responsive Design** - Seamless experience across all devices
- 🔒 **Secure** - JWT authentication and industry-standard security practices

---

## ✨ Features

### Flight Management
- Advanced flight search (multi-city, round-trip, one-way)
- Real-time price comparison and discount detection
- Filter by airline, stops, departure time, price range
- Bangladesh airport support with popular routes
- Email booking confirmations and management

### Hotel Services
- Location-based hotel discovery with advanced filters
- Comprehensive hotel information with photos and reviews
- Room selection with occupancy options
- Real-time availability check
- Recent search history

### Package System
- Pre-designed travel packages (Honeymoon, Family, Adventure, Luxury)
- Custom package builder
- Detailed itineraries and inclusions
- Complete booking and cancellation flow

### User Account
- Profile management with avatar and cover images
- Complete booking history
- Saved payment methods
- Reward points loyalty program
- Travel preferences and favorites

### Additional Features
- Shareable itineraries with html2canvas
- Responsive design for all devices
- Real-time form validation
- Secure JWT authentication
- Email notifications

---

## 🛠️ Tech Stack

### Frontend
- **React 19.1.1** - UI library with concurrent features
- **Vite 6.0+** - Fast build tool and dev server
- **React Router 7.9.4** - Client-side routing
- **Redux Toolkit 2.9.0** - State management
- **Tailwind CSS 4.1.14** - Utility-first CSS framework
- **Axios 1.12.2** - HTTP client
- **html2canvas 1.4.1** - Screenshot generation
- **Leaflet 1.9.4** - Interactive maps
- **Lucide React** - Icon library

### Backend
- **Node.js & Express 5.1.0** - Server framework
- **MongoDB & Mongoose** - Database and ODM
- **JWT** - Authentication tokens
- **bcryptjs 3.0.2** - Password hashing
- **Amadeus 11.0.0** - Flight API integration
- **Cloudinary 2.7.0** - Image management
- **Nodemailer** - Email service
- **express-rate-limit** - API protection

### Development Tools
- **ESLint & Prettier** - Code quality
- **Vercel** - Deployment platform

---

## 📁 Project Structure

```
dream-holidays/
├── client/                    # Frontend React application
│   ├── src/
│   │   ├── api/              # API services
│   │   ├── assets/           # Images and icons
│   │   ├── components/       # React components
│   │   │   ├── common/       # Shared components
│   │   │   ├── flights/      # Flight components
│   │   │   ├── hotels/       # Hotel components
│   │   │   └── home/         # Home components
│   │   ├── data/             # Static data
│   │   ├── pages/            # Page components
│   │   ├── store/            # Redux store
│   │   ├── utils/            # Utility functions
│   │   ├── App.jsx           # Root component
│   │   └── main.jsx          # Entry point
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
│
└── server/                    # Backend Node.js application
    ├── config/               # Configuration files
    ├── controllers/          # Request handlers
    ├── middleware/           # Express middleware
    ├── models/               # Mongoose models
    ├── routes/               # API routes
    ├── services/             # Business logic
    ├── utils/                # Utilities
    ├── package.json
    └── server.js             # Entry point
```

---

## 🚀 Installation & Setup

### Prerequisites

- Node.js (v18+)
- npm or yarn
- MongoDB (Local or Atlas)
- Git

### Quick Start

**1. Clone the repository**

```bash
git clone https://github.com/shakhawat-bijoy/dream-holidays.git
cd dream-holidays
```

**2. Frontend Setup**

```bash
cd client
npm install
cp .env.example .env.production
```

Edit `.env.production`:
```env
VITE_API_URL=http://localhost:5000
```

```bash
npm run dev  # Starts at http://localhost:5173
```

**3. Backend Setup**

```bash
cd server
npm install
cp .env.example .env
```

Edit `.env` with your credentials (see [Environment Variables](#environment-variables))

```bash
npm run dev  # Starts at http://localhost:5000
```

**4. Initialize Data (Optional)**

```bash
npm run init-airports  # Load Bangladesh airports
```

---

## ⚙️ Environment Variables

### Frontend (`.env.production`)

```env
VITE_API_URL=https://your-backend-url.com
```

### Backend (`.env`)

```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/dream-holidays
# or MongoDB Atlas:
# MONGODB_URI=

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRE=7d

# CORS
CLIENT_URL=http://localhost:5173

# Email (Gmail)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=noreply@dreamholidays.com

# Amadeus API
AMADEUS_CLIENT_ID=your-client-id
AMADEUS_CLIENT_SECRET=your-client-secret
AMADEUS_HOSTNAME=test.api.amadeus.com

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

**Get API Keys:**
- Amadeus: [developers.amadeus.com](https://developers.amadeus.com/)
- Cloudinary: [cloudinary.com](https://cloudinary.com/)
- MongoDB Atlas: [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)

---

## 📚 API Documentation

### Base URL
- Development: `http://localhost:5000`
- Production: `https://your-backend.vercel.app`

### Authentication
Include JWT token in requests:
```http
Authorization: Bearer <token>
```

### Response Format
```json
{
  "success": true,
  "data": { /* response data */ },
  "message": "Success message"
}
```

### Authentication Endpoints

**Register User**
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

**Login**
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Get Profile**
```http
GET /api/auth/profile
Authorization: Bearer <token>
```

**Update Profile**
```http
PUT /api/auth/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "John Updated",
  "phone": "+1234567890",
  "address": "123 Main St",
  "city": "New York",
  "country": "USA"
}
```

### Flight Endpoints

**Search Flights**
```http
GET /api/flights/search?departure_id=DAC&arrival_id=DXB&outbound_date=2024-12-15&adults=1
```

Query Parameters:
- `departure_id` (required) - IATA code
- `arrival_id` (required) - IATA code
- `outbound_date` (required) - YYYY-MM-DD
- `return_date` (optional) - YYYY-MM-DD
- `adults` (optional) - Number (default: 1)
- `travel_class` (optional) - ECONOMY, BUSINESS, FIRST

**Get Bangladesh Airports**
```http
GET /api/flights/airports/bangladesh
```

**Book Flight**
```http
POST /api/flights/book
Authorization: Bearer <token>
Content-Type: application/json

{
  "flightId": "flight-1",
  "passengers": [{
    "firstName": "John",
    "lastName": "Doe",
    "dateOfBirth": "1990-01-01",
    "passportNumber": "AB123456"
  }],
  "contactInfo": {
    "email": "john@example.com",
    "phone": "+1234567890"
  }
}
```

### Package Endpoints

**List Packages**
```http
GET /api/packages?category=honeymoon&page=1&limit=10
```

**Get Package Details**
```http
GET /api/packages/:packageId
```

**Book Package**
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

### Payment Endpoints

**Process Payment**
```http
POST /api/payment
Authorization: Bearer <token>
Content-Type: application/json

{
  "bookingId": "booking-123",
  "amount": 450.00,
  "currency": "USD",
  "paymentMethod": "card"
}
```

**Save Card**
```http
POST /api/saved-cards
Authorization: Bearer <token>
```

**Get Saved Cards**
```http
GET /api/saved-cards
Authorization: Bearer <token>
```

For detailed API examples, see [API_EXAMPLES.md](server/API_EXAMPLES.md)

---

## 🚀 Deployment

### Frontend Deployment (Vercel)

1. **Connect Repository**
   - Go to [Vercel](https://vercel.com)
   - Import GitHub repository
   - Set root directory: `client`

2. **Build Configuration**
   - Framework: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`

3. **Environment Variables**
   ```
   VITE_API_URL=https://your-backend.vercel.app
   ```

4. Click Deploy

### Backend Deployment (Vercel)

1. **Create `vercel.json` in server directory**
   ```json
   {
     "version": 2,
     "builds": [{ "src": "server.js", "use": "@vercel/node" }],
     "routes": [{ "src": "/(.*)", "dest": "server.js" }]
   }
   ```

2. **Set Environment Variables**
   - Add all backend .env variables in Vercel dashboard
   - Set `NODE_ENV=production`

3. **Deploy**
   - Root directory: `server`
   - Click Deploy

### MongoDB Atlas Setup

1. Create cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Configure network access (allow 0.0.0.0/0 for Vercel)
3. Create database user
4. Get connection string and update `MONGODB_URI`

---

## 🔒 Security Best Practices

- JWT tokens with 7-day expiration
- Passwords hashed with bcrypt (10 rounds)
- HTTPS enforced in production
- CORS configured for allowed origins
- Rate limiting on all endpoints
- Input validation and sanitization
- NoSQL injection protection
- Environment variables for secrets
- Never commit `.env` files

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/YourFeature`)
3. Commit changes (`git commit -m 'Add YourFeature'`)
4. Push to branch (`git push origin feature/YourFeature`)
5. Open a Pull Request

### Code Style Guidelines

- Follow existing patterns
- Use meaningful variable names
- Add comments for complex logic
- Keep functions small and focused
- Format code with Prettier

---

## 📝 License

This project is licensed under the MIT License.

---

## 👤 Author

<div align="center">

<img src="https://github.com/shakhawat-bijoy.png" width="100" style="border-radius: 50%;" alt="Shakhawat Bijoy"/>

### Shakhawat Bijoy

*Frontend Developer*

[![Portfolio](https://img.shields.io/badge/Portfolio-FF5722?style=for-the-badge&logo=google-chrome&logoColor=white)](https://shakhawat-bijoy.vercel.app)
[![GitHub](https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/shakhawat-bijoy)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/shakhawat-bijoy/)

</div>

## 🌟 Show Your Support

If this project helped you or you found it interesting, please consider:

- ⭐ **Starring the repository**
- 🔄 **Sharing with others**
- 🐛 **Reporting issues**
- 💡 **Suggesting improvements**

<div align="center">
  <h3>⭐️ Star this repo if you like it! ⭐️</h3>
</div>

---

<div align="center">
  <p><strong>Shakhawat Bijoy</strong></p>
  <p>
    <a href="https://github.com/shakhawat-bijoy/Portfolio/stargazers">
      <img src="https://img.shields.io/github/stars/shakhawat-bijoy/Portfolio?style=social" alt="GitHub Stars"/>
    </a>
    <a href="https://github.com/shakhawat-bijoy/Portfolio/network/members">
      <img src="https://img.shields.io/github/forks/shakhawat-bijoy/Portfolio?style=social" alt="GitHub Forks"/>
    </a>
  </p>
  <p><em>© 2025 Shakhawat Bijoy. All rights reserved.</em></p>
</div>
