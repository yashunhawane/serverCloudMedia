# Fix Auth Signup Validation Error

## Steps

### 1. [✅] Fix src/services/authService.js
   - Replace `username` with `userName` in signupService destructuring and User.create().
   - Update loginService similarly for consistency.

### 2. [✅] Fix src/models/User.js
   - Add missing comma after email field.

### 3. [ ] Test
   - Restart server.
   - POST to /api/auth/signup with test payload.

### 4. [ ] Complete
   - Update TODO.md ✅
   - attempt_completion

