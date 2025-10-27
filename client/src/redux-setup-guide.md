# Redux Toolkit Setup Guide

This project now includes a complete Redux Toolkit setup for state management.

## 📁 File Structure

```
src/
├── app/
│   └── store.js                 # Redux store configuration
├── features/
│   ├── auth/
│   │   └── authSlice.js        # Authentication state management
│   └── ui/
│       └── uiSlice.js          # UI state management
├── hooks/
│   └── redux.js                # Custom Redux hooks
├── services/
│   └── api.js                  # Axios instance with Redux integration
├── components/
│   ├── auth/
│   │   └── LoginForm.jsx       # Example login component
│   └── ui/
│       ├── ThemeToggle.jsx     # Theme toggle component
│       └── Notification.jsx    # Notification system
└── examples/
    └── ReduxUsageExamples.jsx  # Usage examples
```

## 🚀 Quick Start

### 1. Using Redux in Components

```jsx
import { useAppDispatch, useAppSelector } from "../hooks/redux";
import { loginUser } from "../features/auth/authSlice";

const MyComponent = () => {
  const dispatch = useAppDispatch();
  const { user, isLoading } = useAppSelector((state) => state.auth);

  const handleLogin = () => {
    dispatch(loginUser({ email, password }));
  };

  return <div>{isLoading ? "Loading..." : `Welcome ${user?.name}`}</div>;
};
```

### 2. Available State Slices

#### Auth Slice (`state.auth`)

- `user` - Current user object
- `token` - JWT token
- `isAuthenticated` - Boolean authentication status
- `isLoading` - Loading state for auth operations
- `error` - Error messages

#### UI Slice (`state.ui`)

- `theme` - Current theme ('light' or 'dark')
- `sidebarOpen` - Sidebar visibility
- `loading` - Global loading state
- `notifications` - Array of notifications
- `modal` - Modal state and data

### 3. Available Actions

#### Auth Actions

```jsx
import {
  loginUser,
  registerUser,
  logoutUser,
  clearError,
} from "../features/auth/authSlice";

// Async actions
dispatch(loginUser({ email, password }));
dispatch(registerUser({ name, email, password }));
dispatch(logoutUser());

// Sync actions
dispatch(clearError());
```

#### UI Actions

```jsx
import {
  toggleTheme,
  addNotification,
  openModal,
  toggleSidebar,
} from "../features/ui/uiSlice";

// Theme
dispatch(toggleTheme());

// Notifications
dispatch(
  addNotification({
    type: "success",
    title: "Success!",
    message: "Operation completed",
    duration: 3000,
  })
);

// Modal
dispatch(
  openModal({
    type: "confirmation",
    data: { message: "Are you sure?" },
  })
);

// Sidebar
dispatch(toggleSidebar());
```

## 🔧 API Integration

The `api.js` service automatically:

- Adds JWT tokens to requests
- Handles 401 errors (auto-logout)
- Shows error notifications for server errors

```jsx
import api from "../services/api";

// Use this instead of axios directly
const response = await api.get("/users");
const user = await api.post("/users", userData);
```

## 📝 Adding New Slices

1. Create a new slice file in `src/features/[feature-name]/[feature-name]Slice.js`
2. Add the reducer to `src/app/store.js`
3. Export actions and use in components

Example:

```jsx
// src/features/products/productsSlice.js
import { createSlice } from "@reduxjs/toolkit";

const productsSlice = createSlice({
  name: "products",
  initialState: { items: [], loading: false },
  reducers: {
    setProducts: (state, action) => {
      state.items = action.payload;
    },
  },
});

export const { setProducts } = productsSlice.actions;
export default productsSlice.reducer;
```

```jsx
// Add to store.js
import productsReducer from "../features/products/productsSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    ui: uiReducer,
    products: productsReducer, // Add here
  },
});
```

## 🎯 Best Practices

1. **Use TypeScript types** - The store exports `RootState` and `AppDispatch` types
2. **Keep slices focused** - Each slice should handle one domain of state
3. **Use async thunks** - For API calls and side effects
4. **Normalize state** - For complex nested data structures
5. **Use selectors** - Create reusable selectors for complex state derivations

## 🔍 Debugging

Install Redux DevTools Extension for better debugging:

- Chrome: Redux DevTools
- Firefox: Redux DevTools

The store is already configured to work with the extension.

## 📚 Resources

- [Redux Toolkit Documentation](https://redux-toolkit.js.org/)
- [React Redux Documentation](https://react-redux.js.org/)
- [Redux DevTools](https://github.com/reduxjs/redux-devtools)
