# CloudMedia Server

CloudMedia Server is a Node.js and Express backend for user authentication and media management. It lets users sign up, log in with JWT-based authentication, upload image/video files to Amazon S3, store media metadata in MongoDB, list uploaded media with filters and pagination, and mark media items as favorites.

This repository contains the server/API layer only.

## Features

- User signup and login
- JWT-protected media routes
- Upload images and videos to Amazon S3
- Store media metadata in MongoDB
- Fetch user media with filtering and pagination
- Fetch favorite media only
- Update favorite status for a media item
- Health check endpoint for monitoring and deployment
- Docker support for containerized runs

## Tech Stack

- Node.js
- Express
- MongoDB with Mongoose
- JWT for authentication
- bcryptjs for password hashing
- Multer for multipart file handling
- Amazon S3 for media storage
- Docker

## How It Works

1. A user creates an account using `/api/auth/signup`.
2. The user logs in through `/api/auth/login` and receives a JWT token.
3. The token is sent in the `Authorization` header for protected routes.
4. Uploaded files are accepted in memory using Multer.
5. The server uploads the file buffer to S3.
6. File metadata is saved in MongoDB.
7. The user can list media, filter by type, and manage favorites.

## Project Structure

```text
src/
  app.js                    Express app setup
  server.js                 Server bootstrap and DB connection
  config/
    env.js                  Environment loading and helpers
    db.js                   MongoDB connection
    awsS3.js                S3 client configuration
  controllers/
    authController.js       Auth request handlers
    mediaController.js      Media request handlers
  middleware/
    auth.js                 JWT auth middleware
    logger.js               Request logging middleware
    upload.js               Multer upload configuration
    validate.js             Basic auth payload validation
  models/
    User.js                 User schema
    Media.js                Media schema
  routes/
    authRoutes.js           Auth route definitions
    mediaUpload.js          Media route definitions
  services/
    authService.js          Auth business logic
    mediaService.js         Upload and media business logic
Dockerfile                  Container build definition
package.json                Scripts and dependencies
```

## Prerequisites

Make sure you have the following installed and configured:

- Node.js 20 or later recommended
- npm
- MongoDB database or MongoDB Atlas connection string
- AWS account with an S3 bucket
- AWS credentials with permission to upload objects to the bucket

## Environment Variables

Create a `.env` file in the project root.

Required variables:

```env
MONGO_URI=your_mongodb_connection_string
PORT=3000
JWT_SECRET=your_jwt_secret
AWS_ACCESS_KEY_ID=your_aws_access_key_id
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
AWS_REGION=your_aws_region
AWS_BUCKET_NAME=your_s3_bucket_name
```

### Variable Details

- `MONGO_URI`: MongoDB connection string used by Mongoose
- `PORT`: Port used by the Express server. Defaults to `5000` if not set
- `JWT_SECRET`: Secret used to sign and verify JWT tokens
- `AWS_ACCESS_KEY_ID`: AWS access key for S3 access
- `AWS_SECRET_ACCESS_KEY`: AWS secret key for S3 access
- `AWS_REGION`: AWS region where the S3 bucket exists
- `AWS_BUCKET_NAME`: Target S3 bucket for uploaded media

## Installation

Install dependencies:

```bash
npm install
```

If you want the install to match the existing lockfile exactly, use:

```bash
npm ci
```

## Running Locally

Start the development server:

```bash
npm run dev
```

Start the production server:

```bash
npm start
```

By default, the server starts on:

```text
http://localhost:3000
```

or on the value provided by `PORT`.

## API Base URL

Local base URL:

```text
http://localhost:3000
```

If `PORT` is not set, the code falls back to:

```text
http://localhost:5000
```

## Authentication

Protected routes require a Bearer token:

```http
Authorization: Bearer <your_jwt_token>
```

## API Endpoints

### 1. Health Check

**GET** `/api/health`

Use this endpoint to confirm the service is running.

Example response:

```json
{
  "status": "OK"
}
```

### 2. Signup

**POST** `/api/auth/signup`

Request body:

```json
{
  "userName": "yash",
  "email": "yash@example.com",
  "password": "secret123"
}
```

Validation rules:

- `userName` is required
- `email` is required
- `password` is required
- `password` must be at least 6 characters

Success response:

```json
{
  "success": true,
  "data": {
    "_id": "USER_ID",
    "email": "yash@example.com",
    "userName": "yash",
    "password": "HASHED_PASSWORD",
    "createdAt": "2026-03-28T00:00:00.000Z",
    "updatedAt": "2026-03-28T00:00:00.000Z"
  }
}
```

Possible errors:

- `400 Bad Request` if required fields are missing
- `400 Bad Request` if password is too short
- `400 Bad Request` if the email already exists

### 3. Login

**POST** `/api/auth/login`

Request body:

```json
{
  "email": "yash@example.com",
  "password": "secret123"
}
```

Success response:

```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "USER_ID",
      "email": "yash@example.com",
      "userName": "yash",
      "password": "HASHED_PASSWORD",
      "createdAt": "2026-03-28T00:00:00.000Z",
      "updatedAt": "2026-03-28T00:00:00.000Z"
    },
    "token": "JWT_TOKEN"
  }
}
```

Possible errors:

- `400 Bad Request` if email or password is missing
- `400 Bad Request` if credentials are invalid

### 4. Upload Media

**POST** `/api/media/upload`

Authentication required.

Content type:

```text
multipart/form-data
```

Form field:

- `file`: image or video file

Allowed MIME types:

- `image/jpeg`
- `image/png`
- `image/gif`
- `image/webp`
- `video/mp4`
- `video/quicktime`
- `video/x-msvideo`
- `video/webm`

Maximum file size:

- `100 MB`

Success response:

```json
{
  "message": "Media uploaded successfully",
  "data": {
    "_id": "MEDIA_ID",
    "user_id": "USER_ID",
    "userName": "yash",
    "media_type": "image",
    "file_url": "https://your-bucket.s3.your-region.amazonaws.com/media/example.jpg",
    "is_favorite": false,
    "created_at": "2026-03-28T00:00:00.000Z"
  }
}
```

Possible errors:

- `400 Bad Request` if no file is provided
- `500 Internal Server Error` if upload to S3 fails
- error if the file type is unsupported

Example `curl`:

```bash
curl --request POST http://localhost:3000/api/media/upload \
  --header "Authorization: Bearer YOUR_JWT_TOKEN" \
  --form "file=@./sample.jpg"
```

### 5. Get User Media

**GET** `/api/media/getimages`

Authentication required.

Optional query parameters:

- `media_type=image|video`
- `is_favorite=true|false`
- `page=1`
- `limit=20`

Example request:

```text
GET /api/media/getimages?media_type=image&is_favorite=false&page=1&limit=10
```

Success response:

```json
{
  "message": "Media fetched successfully",
  "total": 12,
  "page": 1,
  "limit": 10,
  "totalPages": 2,
  "items": [
    {
      "_id": "MEDIA_ID",
      "user_id": "USER_ID",
      "userName": "yash",
      "media_type": "image",
      "file_url": "https://your-bucket.s3.your-region.amazonaws.com/media/example.jpg",
      "is_favorite": false,
      "created_at": "2026-03-28T00:00:00.000Z"
    }
  ]
}
```

### 6. Get Favorite Media

**GET** `/api/media/favorites`

Authentication required.

Optional query parameters:

- `media_type=image|video`
- `page=1`
- `limit=20`

Example request:

```text
GET /api/media/favorites?media_type=video&page=1&limit=5
```

Success response:

```json
{
  "message": "Favorite media fetched successfully",
  "total": 3,
  "page": 1,
  "limit": 5,
  "totalPages": 1,
  "items": [
    {
      "_id": "MEDIA_ID",
      "user_id": "USER_ID",
      "userName": "yash",
      "media_type": "video",
      "file_url": "https://your-bucket.s3.your-region.amazonaws.com/media/example.mp4",
      "is_favorite": true,
      "created_at": "2026-03-28T00:00:00.000Z"
    }
  ]
}
```

### 7. Update Favorite Status

**PUT** `/api/media/:mediaId/favorite`

Authentication required.

Request body:

```json
{
  "is_favorite": true
}
```

Success response:

```json
{
  "message": "Favorite status updated successfully",
  "data": {
    "_id": "MEDIA_ID",
    "user_id": "USER_ID",
    "userName": "yash",
    "media_type": "image",
    "file_url": "https://your-bucket.s3.your-region.amazonaws.com/media/example.jpg",
    "is_favorite": true,
    "created_at": "2026-03-28T00:00:00.000Z"
  }
}
```

Possible errors:

- `400 Bad Request` if `mediaId` is invalid
- `400 Bad Request` if `is_favorite` is not a boolean
- `404 Not Found` if the media item does not belong to the user or does not exist

Example `curl`:

```bash
curl --request PUT http://localhost:3000/api/media/MEDIA_ID/favorite \
  --header "Authorization: Bearer YOUR_JWT_TOKEN" \
  --header "Content-Type: application/json" \
  --data "{\"is_favorite\": true}"
```

## Request Logging

The app includes a custom logger middleware that logs:

- HTTP method
- original route
- response status code
- request duration in milliseconds

Example log:

```text
GET /api/health 200 - 4ms
```

## Data Models

### User

- `email`: unique string, required
- `userName`: unique string, required
- `password`: hashed string, required
- `createdAt`: auto-generated timestamp
- `updatedAt`: auto-generated timestamp

### Media

- `user_id`: reference to the user
- `userName`: username snapshot stored with the media record
- `media_type`: `image` or `video`
- `file_url`: public S3 URL for the uploaded file
- `is_favorite`: boolean flag
- `created_at`: auto-generated timestamp

## Docker

Build the image:

```bash
docker build -t cloudmedia-server .
```

Run the container:

```bash
docker run --env-file .env -p 3000:3000 cloudmedia-server
```

### Docker Notes

- The Dockerfile uses `node:20-alpine`
- Production dependencies are installed with `npm ci --only=production`
- Port `3000` is exposed in the container
- A non-root user is used for better container security
- The health check targets `http://localhost:3000/health`

Important: the application code exposes the health endpoint at `/api/health`, so if you rely on Docker health checks, update the Dockerfile health check path to match the server route.

## Example Workflow

1. Configure `.env`
2. Start the server
3. Create a user with `/api/auth/signup`
4. Log in with `/api/auth/login`
5. Copy the returned token
6. Upload a file to `/api/media/upload`
7. Fetch media from `/api/media/getimages`
8. Mark selected items as favorite
9. Fetch favorites from `/api/media/favorites`

## Validation and Constraints

- Signup requires `userName`, `email`, and `password`
- Login requires `email` and `password`
- Password length must be at least 6 characters
- Media uploads require authentication
- Only supported image and video MIME types are accepted
- Uploads larger than `100 MB` are rejected
- Favorite updates require a valid MongoDB ObjectId
- Favorite updates require `is_favorite` to be a boolean

## Scripts

Available npm scripts:

```json
{
  "start": "node src/server.js",
  "dev": "nodemon src/server.js",
  "test": "echo \"Error: no test specified\" && exit 1"
}
```

## Known Notes

- There is currently no automated test suite in this repository
- The API returns the stored user object in auth responses, which includes the hashed password field
- Uploaded file URLs are generated as public S3 object URLs
- This project currently uses in-memory upload buffering before sending files to S3

## Security Recommendations

- Never commit real `.env` secrets to version control
- Use a strong `JWT_SECRET`
- Use IAM credentials with the minimum required S3 permissions
- Consider adding rate limiting, request validation, and centralized error handling for production
- Consider removing hashed passwords from API responses before exposing the service publicly

## Future Improvements

- Add automated tests
- Add refresh token or logout flows
- Add delete media endpoint
- Add role-based access control if needed
- Add API documentation via Swagger or OpenAPI
- Add request schema validation with a library such as Joi or Zod
- Add image/video processing workflows if needed

## License

This project is currently marked as `ISC` in `package.json`.
