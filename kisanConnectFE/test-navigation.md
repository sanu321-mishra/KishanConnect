# Navigation Test Guide

## Testing the Navigation Bar Behavior

### Expected Behavior:

1. **Before Login:**
   - Only "KisanConnect" brand name should be visible
   - No welcome message or logout button should appear

2. **After Login:**
   - "KisanConnect" brand name should be visible
   - "Welcome, [User Name]" should appear on the right
   - "Logout" button should appear next to the welcome message
   - Smooth fade-in animation should occur

3. **After Logout:**
   - Welcome message and logout button should disappear
   - Only "KisanConnect" brand name should remain

### Test Steps:

1. **Start the application:**
   ```bash
   cd kisanConnectFE
   ng serve
   ```

2. **Open browser to `http://localhost:4200`**

3. **Check initial state:**
   - Verify only "KisanConnect" is visible
   - No welcome message or logout button should be present

4. **Register/Login:**
   - Go to register page and create an account
   - Or login with existing credentials
   - After successful login, you should be redirected to crops page

5. **Check logged-in state:**
   - Verify "Welcome, [Your Name]" appears
   - Verify "Logout" button is visible
   - Check that the animation plays smoothly

6. **Test logout:**
   - Click the "Logout" button
   - Verify you're redirected to login page
   - Verify welcome message and logout button disappear

### Debug Information:

Open browser console (F12) to see debug logs:
- "Nav component initialized"
- "Current user updated: [user data]"
- "User data fetched from backend: [user data]"
- "isLoggedIn check: true/false"

### Common Issues:

1. **Welcome message not showing:**
   - Check if user data is being fetched from backend
   - Verify JWT token is valid
   - Check browser console for errors

2. **Navigation not hiding after logout:**
   - Verify localStorage token is cleared
   - Check if currentUser$ observable is updated

3. **User name not displaying:**
   - Check if backend `/me` endpoint is working
   - Verify user data structure in database 