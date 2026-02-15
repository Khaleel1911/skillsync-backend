# SkillSync Backend

## Project Overview
SkillSync is a coding mate and skill exchange platform that supports student profiles, project collaboration, and skill exchange requests with secure JWT-based authentication.

## Architecture Diagram (text)
```
Client (Web/Mobile)
        |
        v
   Express API
   /  |   |   \
Auth Users Projects Exchange
        |
        v
     MongoDB
```

## Folder Structure
```
skillsync-backend/
├── config/
│   ├── db.js
│   └── mailer.js
├── controllers/
│   ├── authController.js
│   ├── userController.js
│   ├── projectController.js
│   └── exchangeController.js
├── middlewares/
│   ├── authMiddleware.js
│   ├── errorHandler.js
│   └── validateRequest.js
├── models/
│   ├── User.js
│   ├── Project.js
│   └── SkillExchange.js
├── routes/
│   ├── authRoutes.js
│   ├── userRoutes.js
│   ├── projectRoutes.js
│   └── exchangeRoutes.js
├── utils/
│   ├── generateToken.js
│   └── responseHandler.js
├── server.js
├── .env.example
└── SkillSync.postman_collection.json
```

## Installation Steps
1. Install dependencies:
   ```bash
   npm install
   ```
2. Create `.env` from `.env.example`.
3. Start the server:
   ```bash
   npm run dev
   ```

## Environment Variables
See `.env.example` for required variables:
```
PORT
MONGO_URI
JWT_SECRET
NODE_ENV
SMTP_HOST
SMTP_PORT
SMTP_USER
SMTP_PASS
SMTP_FROM
FRONTEND_URL
RESET_PASSWORD_URL
```

## Authentication Flow
1. Register or login to receive a JWT.
2. Pass the JWT in `Authorization` header: `Bearer <token>`.
3. Tokens expire in 7 days.
4. Protected endpoints require a valid JWT.

## Endpoint Documentation

### Auth
- **POST** `/api/auth/register`
  - Headers: `Content-Type: application/json`
  - Body:
    ```json
    {
      "fullName": "Jane Doe",
      "rollNumber": "CS-001",
      "email": "jane@skillsync.com",
      "password": "password123"
    }
    ```
  - Response:
    ```json
    {
      "success": true,
      "message": "Registration successful",
      "data": { "token": "<jwt>", "user": {} }
    }
    ```

- **POST** `/api/auth/login`
  - Headers: `Content-Type: application/json`
  - Body:
    ```json
    { "email": "jane@skillsync.com", "password": "password123" }
    ```
  - Response:
    ```json
    { "success": true, "message": "Login successful", "data": { "token": "<jwt>" } }
    ```

- **POST** `/api/auth/forgot-password`
  - Headers: `Content-Type: application/json`
  - Body:
    ```json
    { "email": "jane@skillsync.com" }
    ```
  - Response:
    ```json
    { "success": true, "message": "Reset password email sent", "data": {} }
    ```

- **PUT** `/api/auth/reset-password/:token`
  - Headers: `Content-Type: application/json`
  - Body:
    ```json
    { "password": "newPassword123" }
    ```
  - Response:
    ```json
    { "success": true, "message": "Password reset successful", "data": { "token": "<jwt>" } }
    ```

- **GET** `/api/auth/me`
  - Headers: `Authorization: Bearer <token>`
  - Response:
    ```json
    { "success": true, "message": "Profile fetched", "data": { "user": {} } }
    ```

### Projects
- **POST** `/api/projects` (protected)
  - Headers: `Authorization: Bearer <token>`
  - Body:
    ```json
    {
      "title": "AI Tutor",
      "description": "Build an AI tutor",
      "requiredRoles": [
        { "roleName": "Backend", "requiredSkills": ["Node.js"], "numberOfOpenings": 1 }
      ]
    }
    ```

- **GET** `/api/projects`
- **GET** `/api/projects/match/:userId`
- **GET** `/api/projects/:id`
- **POST** `/api/projects/:id/join` (protected)
  - Body:
    ```json
    { "roleName": "Backend" }
    ```
- **PUT** `/api/projects/:id/respond` (protected)
  - Body:
    ```json
    { "requestId": "<requestId>", "action": "accept" }
    ```
- **PUT** `/api/projects/:id/complete` (protected)
- **PUT** `/api/projects/:id/archive` (protected)

### Skill Exchange
- **POST** `/api/exchange` (protected)
  - Body:
    ```json
    { "targetUser": "<userId>", "skillsOffered": ["React"], "skillsWanted": ["Node.js"] }
    ```
- **GET** `/api/exchange/browse`
- **GET** `/api/exchange/user/:id` (protected)
- **PUT** `/api/exchange/:id/respond` (protected)
  - Body:
    ```json
    { "action": "accept" }
    ```
- **PUT** `/api/exchange/:id/complete` (protected)

## Postman Testing Guide
1. Import `SkillSync.postman_collection.json`.
2. Set the `baseUrl` variable.
3. Use the Register/Login requests to obtain a token.
4. The token is automatically applied to protected routes via collection variables.

## Reset Password Flow (example)
1. Call `POST /api/auth/forgot-password` with user email.
2. User receives email with reset link: `.../reset-password/<token>`.
3. Call `PUT /api/auth/reset-password/<token>` with new password.

## Future Scalability Notes
- Move services to a microservice architecture as usage grows.
- Add caching (Redis) for hot project queries.
- Introduce background jobs for email and notifications.
- Add rate limiting, audit logs, and API versioning.

