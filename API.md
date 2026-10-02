# Backend API Documentation

This document describes the API currently implemented in this repository. The same contract is available in machine-readable formats:

- [Swagger/OpenAPI specification](./swagger.json)
- [Postman collection](./postman_collection.json)

## Overview

The service is an Express 5 API with authentication, authorization, validation, rate limiting, CORS, logging, and multipart file uploads. It does not use a URL prefix such as `/api`.

The server listens on the value of `PORT`. Set the base URL in the Swagger document or Postman collection to the host and port where the service is running. The local examples below use `http://localhost:3000`.

## Authentication

### Obtain a token

Send `POST /user/login` with a valid email address and a password of at least six characters. A successful response contains a JWT that expires after one hour.

```http
POST /user/login HTTP/1.1
Host: localhost:3000
Content-Type: application/json

{
  "email": "newuser@example.com",
  "password": "ExamplePass1!"
}
```

```json
{
  "status": "success",
  "message": "Login successful",
  "role": "user",
  "token": "<JWT>"
}
```

Send the token with protected requests:

```http
Authorization: Bearer <JWT>
```

The current middleware reads the second space-delimited value in the `Authorization` header. Use the standard `Bearer <JWT>` form shown above.

## Endpoints

### System

#### `GET /`

Public endpoint that checks whether the process is running.

```bash
curl http://localhost:3000/
```

Response: `200 OK`

```json
{
  "status": "success",
  "message": "Welcome, API is running"
}
```

### Authentication

#### `POST /user/register`

Creates a user in the in-memory store and assigns the `user` role. The current implementation returns `200 OK` rather than `201 Created`.

Request body:

| Field | Type | Required | Rules |
| --- | --- | --- | --- |
| `name` | string | Yes | Trimmed; at least 4 characters and includes at least one number |
| `email` | string | Yes | Trimmed valid email address |
| `phone` | string | Yes | Trimmed; exactly 11 characters; digit-only validation is not enforced |
| `password` | string | Yes | Trimmed; at least 6 characters |

Example:

```bash
curl -X POST http://localhost:3000/user/register \
  -H 'Content-Type: application/json' \
  -d '{
    "name": "Avery4",
    "email": "newuser@example.com",
    "phone": "01234567890",
    "password": "ExamplePass1!"
  }'
```

Successful response: `200 OK`

```json
{
  "status": "success",
  "message": "User registered successfully"
}
```

Possible errors: `400` validation failure, `429` rate limit exceeded, and `500` unhandled server error.

#### `POST /user/login`

Returns a one-hour JWT for an existing email address.

Request body:

| Field | Type | Required | Rules |
| --- | --- | --- | --- |
| `email` | string | Yes | Valid email address |
| `password` | string | Yes | At least 6 characters |

Example:

```bash
curl -X POST http://localhost:3000/user/login \
  -H 'Content-Type: application/json' \
  -d '{
    "email": "newuser@example.com",
    "password": "ExamplePass1!"
  }'
```

Successful response: `200 OK`

```json
{
  "status": "success",
  "message": "Login successful",
  "role": "user",
  "token": "<JWT>"
}
```

Possible errors: `400` validation failure, `401` unknown email, `429` rate limit exceeded, and `500` missing JWT configuration or another unhandled error.

### Users

Both user operations require `Authorization: Bearer <JWT>` and accept any valid role.

#### `GET /user/`

Searches users using the required `query` parameter. Name and email matching is case-insensitive; phone matching is a substring match. An empty query currently matches all users.

```bash
curl 'http://localhost:3000/user/?query=Avery' \
  -H 'Authorization: Bearer <JWT>'
```

Successful response: `200 OK`

```json
{
  "status": "success",
  "data": [
    {
      "id": 9,
      "name": "Avery4",
      "email": "newuser@example.com",
      "phone": "01234567890",
      "role": "user",
      "password": "[redacted]"
    }
  ]
}
```

Possible errors: `401` missing or invalid token, `404` no matching users, `429` rate limit exceeded, and `500` for an invalid or missing query.

#### `GET /user/{id}`

Returns the user whose ID matches the URL value.

```bash
curl http://localhost:3000/user/1 \
  -H 'Authorization: Bearer <JWT>'
```

Successful response: `200 OK`

```json
{
  "status": "success",
  "data": {
    "id": 1,
    "name": "devv",
    "email": "devv@example.com",
    "phone": "09047676746",
    "role": "user",
    "password": "[redacted]"
  }
}
```

Possible errors: `401` missing or invalid token, `404` user not found, `429` rate limit exceeded, and `500` for an unexpected server error.

### Roles

#### `GET /role/user`

Requires any valid JWT. Both `user` and `admin` tokens are accepted.

```bash
curl http://localhost:3000/role/user \
  -H 'Authorization: Bearer <JWT>'
```

```json
{
  "status": "success",
  "message": "Welcome, User"
}
```

#### `GET /role/admin`

Requires a valid JWT containing `role: "admin"`.

```bash
curl http://localhost:3000/role/admin \
  -H 'Authorization: Bearer <JWT>'
```

```json
{
  "status": "success",
  "message": "Welcome, Admin"
}
```

An authenticated token without the admin role receives `403 Forbidden`:

```json
{
  "message": "Access denied. Admins only."
}
```

### Files

#### `POST /file/upload`

Accepts one multipart field named `file`. The maximum file size is 5 MB. The MIME type is checked against the following client-declared values:

- `image/jpeg`
- `image/png`
- `image/gif`
- `image/webp`
- `application/pdf`
- `text/plain`

```bash
curl -X POST http://localhost:3000/file/upload \
  -F 'file=@/absolute/path/to/example.png'
```

Successful response: `200 OK`

```json
{
  "message": "File uploaded successfully",
  "file": {
    "originalname": "example.png",
    "filename": "example-1700000000000-123456789.png",
    "path": "/uploads/example-1700000000000-123456789.png",
    "size": 12345,
    "mimetype": "image/png"
  }
}
```

The endpoint returns `400` when the file is missing, the MIME type is not allowed, the file is larger than 5 MB, or another Multer error occurs. It returns `429` when rate limited and `500` for an unhandled storage or server error.

#### `GET /uploads/{filename}`

The uploads directory is served publicly by Express static middleware. Use the `path` returned by the upload response to construct the download URL:

```bash
curl http://localhost:3000/uploads/example-1700000000000-123456789.png
```

The file response has the detected static content type rather than a JSON API envelope. A missing file can produce an Express-generated `404` response.

## Status codes

| Status | Meaning |
| --- | --- |
| `200` | Successful response |
| `400` | Validation, missing-file, disallowed-file-type, or file-size error |
| `401` | Missing or invalid JWT |
| `403` | Authenticated user does not have the admin role |
| `404` | User or search result not found; static files may also return 404 |
| `429` | API rate limit exceeded |
| `500` | Unhandled server, configuration, or storage error |

## Error formats

Validation failures return a message and the raw Zod issue list:

```json
{
  "message": "Validation failed",
  "errors": [
    {
      "code": "too_small",
      "path": ["password"],
      "message": "Password must be at least 6 characters"
    }
  ]
}
```

Some errors include `status: "error"`:

```json
{
  "status": "error",
  "message": "User not found"
}
```

Authentication, authorization, validation, and missing-file errors may return only `message`, so clients should treat `message` as the stable field and accept the optional `status` field.

## Rate limits and request limits

- User, role, and file routes are protected by the configured API rate limiter.
- The limiter uses a 15-minute window and the `LIMIT` environment value.
- JSON and URL-encoded request bodies are limited to 10 KB.
- Uploaded files are limited to 5 MB.
- The root endpoint and successful static-file requests are not covered by the API limiter.

## Environment variables

| Variable | Purpose |
| --- | --- |
| `PORT` | Port passed to `app.listen` |
| `JWT_SECRET` | Secret used to sign and verify access tokens |
| `SALT_ROUNDS` | Bcrypt cost used when registering users |
| `FRONTEND_URL` | CORS origin |
| `LIMIT` | Maximum requests allowed by the rate limiter in its window |

Do not commit `.env` files or real credentials. The API stores users in memory, so registrations are lost when the process restarts.

## Security notes

The following behavior exists in the current implementation and should be addressed before production deployment:

1. User search and lookup responses include the `password` property. Remove it from all response objects before exposing user data to clients.
2. Password comparison is currently commented out in the login controller. A valid email currently receives a token regardless of whether the submitted password matches the stored value.
3. File upload and static file access are public in the current route configuration.
4. The upload filter checks the client-declared MIME type, not the file contents.
5. The application uses an in-memory array and does not enforce unique email addresses or phone numbers.
6. Any authenticated user can search for and retrieve any other user.
7. The API has no custom JSON handler for unknown routes, and some framework-generated errors may not use the documented JSON envelope.

These notes are included so the documentation matches the current code; they are not a recommendation to expose the current behavior publicly.

## Using the documentation

### Swagger

Import `swagger.json` into Swagger Editor or another OpenAPI 3 tool. The file defines request schemas, response schemas, bearer authentication, examples, and the documented error responses. When the API server is running, the built-in interactive UI is available at `http://localhost:<PORT>/api-docs/`. Set the server port to the actual `PORT` value before making requests.

### Postman

Import `postman_collection.json` into Postman. Set the `baseUrl` collection variable, then run `Register User` and `Login User`. The login request test script stores the returned JWT in the `accessToken` collection variable and applies it to protected requests. Set `uploadFilePath` to a local file before running `Upload File`; its test script stores the returned `uploadedFilename` for the download request.

### Markdown

This file is the human-readable reference. Keep it synchronized with `swagger.json` and `postman_collection.json` when routes or schemas change.
