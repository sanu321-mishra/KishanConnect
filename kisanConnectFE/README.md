# KisanConnect Frontend

This is the Angular frontend for the KisanConnect application with user authentication.

## Features

- **User Registration**: Create new user accounts
- **User Login**: Authenticate existing users
- **User Logout**: Secure logout functionality
- **Protected Routes**: Crop management requires authentication
- **Token Management**: JWT token storage and automatic inclusion in API requests
- **Responsive Design**: Modern, mobile-friendly UI

## Authentication Flow

1. **Registration**: Users can create new accounts with name, email, and password
2. **Login**: Users authenticate with email and password
3. **Token Storage**: JWT tokens are stored in localStorage
4. **Protected Access**: Crop management features require valid authentication
5. **Auto Logout**: Invalid/expired tokens automatically redirect to login

## Components

- `LoginComponent`: User login form
- `RegisterComponent`: User registration form
- `NavComponent`: Navigation bar with user info and logout
- `CropListComponent`: Protected crop management interface

## Services

- `AuthService`: Handles authentication, token management, and user state
- `CropService`: Manages crop data with authentication headers

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   ng serve
   ```

3. Open your browser to `http://localhost:4200`

4. Register a new account or login with existing credentials

## API Endpoints

The frontend expects these backend endpoints:
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/crops` - Get crop listings (requires auth)
- `POST /api/crops/add` - Add new crop (requires auth)

## Security Features

- Form validation with real-time feedback
- Password confirmation on registration
- JWT token authentication
- Automatic token inclusion in API requests
- Route protection for authenticated features
- Secure logout with token removal

## Styling

The application uses modern CSS with:
- Gradient backgrounds
- Card-based layouts
- Responsive design
- Hover effects and animations
- Consistent color scheme 