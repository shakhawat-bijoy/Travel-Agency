# Dream Holidays - Flight Booking Platform

A modern flight booking platform built with React, Node.js, and MongoDB. Features include flight search, booking management, user accounts, and payment processing.

## 🚀 Features

- **Flight Search**: Search and compare flights using Amadeus API
- **User Authentication**: Secure login/register system with JWT
- **Booking Management**: Complete booking flow with confirmation
- **Payment Integration**: Secure payment method management
- **User Profiles**: Comprehensive account management
- **Responsive Design**: Mobile-first design with Tailwind CSS

## 🛠️ Tech Stack

### Frontend

- React 19.1.1
- Vite (Build tool)
- Tailwind CSS 4.1.14
- React Router 7.9.4
- Redux Toolkit 2.9.0
- Lucide React (Icons)

### Backend

- Node.js with Express 5.1.0
- MongoDB with Mongoose 8.19.1
- JWT Authentication
- Amadeus API Integration
- Cloudinary (Image uploads)
- Nodemailer (Email services)

## 📦 Installation

### Prerequisites

- Node.js 18+
- MongoDB database
- Amadeus API credentials
- Cloudinary account (for image uploads)

### Local Development

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd dream-holidays
   ```

2. **Install dependencies**

   ```bash
   # Install client dependencies
   cd client
   npm install

   # Install server dependencies
   cd ../server
   npm install
   ```

3. **Environment Setup**

   **Client (.env)**

   ```env
   VITE_API_BASE_URL=http://localhost:5001/api
   VITE_APP_NAME=Dream Holidays
   VITE_APP_URL=http://localhost:3000
   NODE_ENV=development
   ```

   **Server (.env)**

   ```env
   # Database
   MONGO_URI=mongodb://localhost:27017/dream-holidays

   # JWT
   JWT_SECRET=your-jwt-secret-key

   # Amadeus API
   AMADEUS_CLIENT_ID=your-amadeus-client-id
   AMADEUS_CLIENT_SECRET=your-amadeus-client-secret

   # Cloudinary
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret

   # Email
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password

   # Server
   PORT=5001
   ```

4. **Start development servers**

   ```bash
   # Start backend (from server directory)
   npm run dev

   # Start frontend (from client directory)
   npm run dev
   ```

## 🚀 Deployment on Vercel

### Automatic Deployment

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Manual Deployment

1. Install Vercel CLI: `npm i -g vercel`
2. Run `vercel` in project root
3. Follow the prompts

### Required Environment Variables for Production

```env
# Database
MONGO_URI=your-production-mongodb-uri

# JWT
JWT_SECRET=your-production-jwt-secret

# Amadeus API
AMADEUS_CLIENT_ID=your-amadeus-client-id
AMADEUS_CLIENT_SECRET=your-amadeus-client-secret

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Email
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Client Environment
VITE_API_BASE_URL=https://your-domain.vercel.app/api
VITE_APP_URL=https://your-domain.vercel.app
```

## 📁 Project Structure

```
dream-holidays/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── store/         # Redux store
│   │   ├── utils/         # Utility functions
│   │   └── assets/        # Static assets
│   ├── public/            # Public assets
│   └── package.json
├── server/                # Node.js backend
│   ├── config/           # Database configuration
│   ├── controllers/      # Route controllers
│   ├── middleware/       # Custom middleware
│   ├── models/          # MongoDB models
│   ├── routes/          # API routes
│   ├── services/        # Business logic
│   ├── utils/           # Utility functions
│   └── package.json
├── vercel.json          # Vercel configuration
└── README.md
```

## 🔧 Available Scripts

### Client

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Server

- `npm run dev` - Start development server with nodemon
- `npm start` - Start production server

## 🌟 Key Features Implementation

### Flight Search

- Integration with Amadeus API for real-time flight data
- Advanced search filters (dates, passengers, class)
- Airport autocomplete with IATA codes

### User Management

- JWT-based authentication
- Profile management with image uploads
- Password reset functionality

### Booking System

- Complete booking flow
- Payment method management
- Booking history and details

### Security

- Input validation and sanitization
- Rate limiting
- CORS configuration
- Helmet.js security headers

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License.

## 🆘 Support

For support, email support@dreamholidays.com or create an issue in the repository.
