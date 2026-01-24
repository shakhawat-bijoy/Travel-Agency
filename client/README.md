# Dream Holidays - Client

This is the frontend client for the **Dream Holidays** travel booking application. It provides a modern, responsive user interface for booking flights, hotels, and holiday packages.

## 🚀 Tech Stack

- **Framework:** [React 19](https://react.dev/) with [Vite](https://vitejs.dev/)
- **State Management:** [Redux Toolkit](https://redux-toolkit.js.org/)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
- **Routing:** [React Router v7](https://reactrouter.com/)
- **Authentication:** Auth0 React SDK
- **Icons:** Lucide React & React Icons
- **Maps:** Google Maps React & Leaflet
- **Animations:** Framer Motion (implied/planned), CSS transitions

## 🛠️ Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Navigate to the client directory:
   ```bash
   cd client
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root of the `client` directory (see Configuration below).

4. Start the development server:
   ```bash
   npm run dev
   ```

   The application will be available at `http://localhost:5173`.

## 📁 Project Structure

```
client/
├── public/             # Static assets
├── src/
│   ├── api/            # API service layers (Axios instances)
│   ├── assets/         # Images, fonts, and local assets
│   ├── components/     # Reusable UI components
│   │   ├── common/     # Buttons, Inputs, Modals, Navbar, Footer
│   │   ├── flights/    # Flight-specific components
│   │   └── ...
│   ├── data/           # Static data inputs (if any)
│   ├── pages/          # Application views (Home, Account, Booking)
│   ├── store/          # Redux store and slices
│   ├── utils/          # Helper functions and formatters
│   ├── App.jsx         # Main application component & Routing
│   └── main.jsx        # Entry point
└── package.json
```

## ✨ Key Features

- **Flight Search & Booking:** Real-time flight availability integration and booking interface.
- **Dynamic Packaging:** Book complete holiday packages with customizable options.
- **User Dashboard:** Manage profile, view booking history, and handle payments.
- **Responsive Design:** Fully optimized for mobile, tablet, and desktop devices.
- **Interactive Maps:** Visual exploration of destinations using Google Maps and Leaflet.
- **Project Documentation:** Built-in technical documentation page convertible to PDF.

## 📜 Scripts

- `npm run dev`: Starts the development server.
- `npm run build`: Builds the app for production to the `dist` folder.
- `npm run lint`: Runs ESLint to check for code quality issues.
- `npm run preview`: Locally preview the production build.

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/NewFeature`)
3. Commit changes (`git commit -m 'Add NewFeature'`)
4. Push to branch (`git push origin feature/NewFeature`)
5. Open a Pull Request
