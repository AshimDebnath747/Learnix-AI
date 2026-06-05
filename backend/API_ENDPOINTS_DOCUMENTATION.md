# Learnix AI Backend - Complete API Documentation

## Base URL
`http://localhost:8000` (or deployed server)

## Authentication
- Most endpoints require authentication via JWT token stored in `uid` cookie
- Authentication middleware (`checkAuthMiddleware`) verifies the token and extracts `req.user.id`
- Endpoints marked as **[Auth Required]** require valid JWT token

---

## Authentication Endpoints (`/api/auth`)

### 1. Register User
**Endpoint:** `POST /api/auth/register`  
**Authentication:** Not Required  
**Status Code:** 201 (Created)

**Request Body:**
```json
{
  "email": "user@example.com",
  "username": "john_doe",
  "password": "securePass123"
}
```

**Validation Rules:**
- `email`: Must be a valid email format (required)
- `username`: String, 3-30 characters (required)
- `password`: String, minimum 6 characters (required)

**Response (Success):**
```json
{
  "success": true,
  "message": "User created successfully",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "username": "john_doe"
  }
}
```

**Error Responses:**
- `409 Conflict`: Email already registered
- `400 Bad Request`: Validation errors (invalid email, short password, etc.)

---

### 2. Login User
**Endpoint:** `POST /api/auth/login`  
**Authentication:** Not Required  
**Status Code:** 200 (OK)

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePass123"
}
```

**Validation Rules:**
- `email`: Must be a valid email format (required)
- `password`: String, minimum 6 characters (required)

**Response (Success):**
```json
{
  "success": true,
  "message": "Login successful"
}
```

**Set-Cookie Header:**
```
uid=<JWT_TOKEN>; HttpOnly; Path=/; SameSite=Strict; Max-Age=604800000
```

**Error Responses:**
- `404 Not Found`: Email doesn't exist
- `401 Unauthorized`: Invalid password
- `400 Bad Request`: Validation errors

---

### 3. Google OAuth Login
**Endpoint:** `POST /api/auth/google`  
**Authentication:** Not Required  
**Status Code:** 200 (OK)

**Request Body:**
```json
{
  "idToken": "eyJhbGciOiJSUzI1NiIsImtpZCI6IjEifQ.eyJhdWQiOiI1NTAuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJlbWFpbCI6InVzZXJAZ21haWwuY29tIiwibmFtZSI6IkpvaG4gRG9lIn0.signature"
}
```

**Validation Rules:**
- `idToken`: Valid Google OAuth token string (required)

**Response for Web (Success):**
```json
{
  "success": true,
  "message": "Login successful for web"
}
```

**Response for Mobile (Success):**
```json
{
  "success": true,
  "message": "Login successful for app",
  "token": "<JWT_TOKEN>"
}
```

**Set-Cookie Header (Web only):**
```
uid=<JWT_TOKEN>; HttpOnly; Path=/; SameSite=Strict; Max-Age=604800000
```

**Error Responses:**
- `401 Unauthorized`: Invalid Google token
- `400 Bad Request`: Google account email not found or validation errors

---

### 4. Logout
**Endpoint:** `POST /api/auth/logout`  
**Authentication:** Not Required  
**Status Code:** 200 (OK)

**Request Body:**
None (empty POST)

**Response (Success):**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

**Clears Cookie:**
- `uid` cookie is cleared (HttpOnly, SameSite=Strict)

---

## Progress Endpoints (`/api/progress`) - [Auth Required]

### 1. Mark Question Complete
**Endpoint:** `POST /api/progress/complete`  
**Authentication:** Required  
**Status Code:** 200 (OK)

**Request Body:**
```json
{
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "questionId": "CSE-1-001"
}
```

**Validation Rules:**
- `userId`: Valid UUID format (required)
- `questionId`: Non-empty string, max 255 characters (required)

**Response (Success):**
```json
{
  "success": true,
  "message": "Progress recorded successfully",
  "data": {
    "progressId": 1,
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "questionId": "CSE-1-001",
    "completed": true,
    "completedAt": "2026-06-02T10:30:00.000Z"
  }
}
```

**Database Behavior:**
- Uses UPSERT logic: updates if record exists, inserts if new
- Automatically sets `completedAt` timestamp to current time

**Error Responses:**
- `400 Bad Request`: Missing userId or questionId, invalid UUID format
- `500 Internal Server Error`: Database error

---

### 2. Get Progress for Specific Question
**Endpoint:** `GET /api/progress/question/:userId/:questionId`  
**Authentication:** Required  
**Status Code:** 200 (OK)

**Path Parameters:**
- `userId`: UUID of the user
- `questionId`: ID of the question

**Response (Success - Question Completed):**
```json
{
  "success": true,
  "message": "Progress retrieved successfully",
  "data": {
    "id": 1,
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "questionId": "CSE-1-001",
    "completed": true,
    "completedAt": "2026-06-02T10:30:00.000Z"
  }
}
```

**Response (Success - No Progress Found):**
```json
{
  "success": true,
  "message": "No progress found for this question",
  "data": null
}
```

**Error Responses:**
- `400 Bad Request`: Missing required parameters
- `500 Internal Server Error`: Database error

---

### 3. Get All Progress for User
**Endpoint:** `GET /api/progress/user/:userId`  
**Authentication:** Required  
**Status Code:** 200 (OK)

**Path Parameters:**
- `userId`: UUID of the user

**Response (Success):**
```json
{
  "success": true,
  "message": "User progress retrieved successfully",
  "data": [
    {
      "id": 1,
      "userId": "550e8400-e29b-41d4-a716-446655440000",
      "questionId": "CSE-1-001",
      "completed": true,
      "completedAt": "2026-06-02T10:30:00.000Z"
    },
    {
      "id": 2,
      "userId": "550e8400-e29b-41d4-a716-446655440000",
      "questionId": "CSE-1-002",
      "completed": true,
      "completedAt": "2026-06-02T11:15:00.000Z"
    }
  ],
  "count": 2
}
```

**Error Responses:**
- `400 Bad Request`: Missing userId
- `500 Internal Server Error`: Database error

---

## Routine Endpoints (`/api/routine`) - [Auth Required]

### 1. Generate Study Routine
**Endpoint:** `POST /api/routine/generate`  
**Authentication:** Required  
**Status Code:** 201 (Created)

**Request Body:**
```json
{
  "semester": 3,
  "daysLeft": 45
}
```

**Validation Rules:**
- `semester`: Integer, 1-8 (required)
- `daysLeft`: Integer, 1-365 days (required)

**Algorithm:**
1. Fetches all questions for the given semester
2. Assigns weights based on marks (12→4, 6→3, 4→2, 2→1)
3. Sorts questions by weight (highest first)
4. Distributes questions across days based on daily target (totalWeight / daysLeft)
5. Adds revision days every 7th day
6. Saves plan as JSON and inserts routine questions into database

**Response (Success):**
```json
{
  "success": true,
  "message": "Routine generated successfully!",
  "routine": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "semester": 3,
    "plan": [
      {
        "day": 1,
        "type": "study",
        "tasks": [
          {
            "question_id": "CSE-3-001",
            "module_id": "Module-1",
            "marks": 12,
            "subject_code": "CS101"
          }
        ]
      },
      {
        "day": 7,
        "type": "revision",
        "tasks": [
          {
            "question_id": "CSE-3-001",
            "module_id": "Module-1",
            "marks": 12,
            "subject_code": "CS101"
          }
        ]
      }
    ],
    "createdAt": "2026-06-02T10:30:00.000Z"
  },
  "questionsInserted": 125
}
```

**Plan Structure:**
- **day**: Day number in the routine
- **type**: "study" or "revision"
- **tasks**: Array of questions with question_id, module_id, marks, subject_code

**Error Responses:**
- `400 Bad Request`: Invalid semester (not 1-8) or daysLeft (not 1-365)
- `500 Internal Server Error`: No questions found for semester or database error

---

## Test Endpoints (`/api/test`) - [Auth Required]

### 1. Create Practice Test
**Endpoint:** `POST /api/test/create`  
**Authentication:** Required  
**Status Code:** 200 (OK)

**Request Body:**
None (empty POST)

**Logic:**
1. Fetches all completed questions from user progress
2. Extracts unique topics
3. Fetches 25 random MCQs based on those topics
4. Creates test record with type "practice"
5. Maps MCQs to test (testMcqs)
6. Returns MCQs excluding correct answers

**Response (Success):**
```json
{
  "testId": "550e8400-e29b-41d4-a716-446655440002",
  "totalQuestions": 25,
  "safeMcqs": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440010",
      "question": "What is the output of this code?",
      "optionA": "10",
      "optionB": "20",
      "optionC": "30",
      "optionD": "40",
      "topic": "Functions",
      "createdAt": "2026-06-01T12:00:00.000Z"
    }
  ]
}
```

**Error Responses:**
- `500 Internal Server Error`: No completed topics found or no MCQs available

---

### 2. Get Current Test
**Endpoint:** `GET /api/test/:userId`  
**Authentication:** Required  
**Status Code:** 200 (OK)

**Path Parameters:**
- `userId`: UUID of the user

**Response (Success):**
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440002",
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "planId": null,
    "type": "practice",
    "createdAt": "2026-06-02T10:30:00.000Z"
  }
]
```

**Error Responses:**
- `500 Internal Server Error`: Database error

---

### 3. Submit Answer
**Endpoint:** `POST /api/test/answer`  
**Authentication:** Required  
**Status Code:** 200 (OK)

**Request Body:**
```json
{
  "testId": "550e8400-e29b-41d4-a716-446655440002",
  "mcqId": "550e8400-e29b-41d4-a716-446655440010",
  "selectedOption": "A"
}
```

**Response (Success):**
```json
{
  "isCorrect": true
}
```

**Error Responses:**
- `500 Internal Server Error`: Database error or invalid MCQ

---

### 4. Get Test Result
**Endpoint:** `GET /api/test/result/:testId`  
**Authentication:** Required  
**Status Code:** 200 (OK)

**Path Parameters:**
- `testId`: UUID of the test

**Response (Success):**
```json
{
  "total": 25,
  "correct": 18,
  "score": 72
}
```

**Score Calculation:** (correct / total) * 100

**Error Responses:**
- `500 Internal Server Error`: Test not found or database error

---

### 5. Create Final Test
**Endpoint:** `POST /api/test/create/final`  
**Authentication:** Required  
**Status Code:** 200 (OK)

**Request Body:**
```json
{
  "planId": "550e8400-e29b-41d4-a716-446655440001"
}
```

**Validation Rules:**
- `planId`: Valid UUID format (required)

**Logic:**
1. Checks if final test already exists for this planId (prevents duplicates)
2. Fetches all topics from routine_questions for the plan
3. Fetches 25 random MCQs from those topics
4. Creates test record with type "final"
5. Maps MCQs to test (testMcqs)
6. Returns MCQs excluding correct answers

**Response (Success - New Test):**
```json
{
  "testId": "550e8400-e29b-41d4-a716-446655440003",
  "totalQuestions": 25,
  "safeMcqs": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440010",
      "question": "What is the output of this code?",
      "optionA": "10",
      "optionB": "20",
      "optionC": "30",
      "optionD": "40",
      "topic": "Functions",
      "createdAt": "2026-06-01T12:00:00.000Z"
    }
  ]
}
```

**Response (Success - Test Already Exists):**
```json
{
  "testId": "550e8400-e29b-41d4-a716-446655440003",
  "message": "Test already Exists"
}
```

**Error Responses:**
- `400 Bad Request`: Invalid planId format
- `500 Internal Server Error`: Plan not found or database error

---

## User Dashboard Endpoints (`/api/user`) - [Auth Required]

### 1. Get User Profile
**Endpoint:** `GET /api/user/profile`  
**Authentication:** Required  
**Status Code:** 200 (OK)

**Request:**
No body or parameters (userId extracted from JWT)

**Response (Success):**
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "username": "john_doe",
    "email": "user@example.com"
  }
]
```

**Error Responses:**
- `500 Internal Server Error`: User not found or database error

---

### 2. Get User Progress Summary
**Endpoint:** `GET /api/user/progress`  
**Authentication:** Required  
**Status Code:** 200 (OK)

**Request:**
No body or parameters (userId extracted from JWT)

**Logic:**
1. Fetches active plan for user
2. Counts total questions in routine for that plan
3. Counts completed questions from user_progress
4. Returns summary with total and completed counts

**Response (Success):**
```json
{
  "total": 150,
  "complete": 45
}
```

**Error Responses:**
- `500 Internal Server Error`: No active plan or database error

---

### 3. Get Recent Tests
**Endpoint:** `GET /api/user/test/recent`  
**Authentication:** Required  
**Status Code:** 200 (OK)

**Request:**
No body or parameters (userId extracted from JWT)

**Logic:**
1. Fetches all test IDs for user
2. For each test, counts total MCQs
3. For each test, counts correct answers
4. Returns test IDs and their respective scores

**Response (Success):**
```json
{
  "testIds": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440002"
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440003"
    }
  ],
  "results": [
    {
      "totalMcqs": 25,
      "correct": 18
    },
    {
      "totalMcqs": 25,
      "correct": 22
    }
  ]
}
```

**Error Responses:**
- `500 Internal Server Error`: No tests found or database error

---

## Data Models Summary

### Users Table
```
- id (UUID, primary key)
- email (string, unique)
- username (string)
- password (string, hashed)
```

### User Progress Table
```
- id (serial, primary key)
- userId (UUID, foreign key to users)
- questionId (string)
- completed (boolean, default: false)
- completedAt (timestamp with timezone)
- Unique constraint: (userId, questionId)
```

### Plans (Routines) Table
```
- id (UUID, primary key)
- userId (UUID, foreign key to users)
- semester (integer)
- plan (JSONB - contains array of day objects)
- createdAt (timestamp)
```

### Questions Table
```
- id (serial, primary key)
- questionId (string, unique)
- subjectCode (string)
- semester (integer)
- moduleId (string)
- topic (string)
- marks (integer)
- instruction (string)
- output (string)
```

### Routine Questions Table
```
- id (UUID, primary key)
- questionId (string)
- dayNo (integer)
- planId (UUID, foreign key to plans)
- Unique constraint: (planId, questionId)
```

### Tests Table
```
- id (UUID, primary key)
- userId (UUID, foreign key to users)
- planId (UUID, foreign key to plans, nullable)
- type (string: "practice" or "final")
- createdAt (timestamp)
```

### MCQ Questions Table
```
- id (UUID, primary key)
- question (string)
- optionA (string)
- optionB (string)
- optionC (string)
- optionD (string)
- correctOption (string)
- topic (string)
- createdAt (timestamp)
```

### Test MCQs Table
```
- id (UUID, primary key)
- testId (UUID, foreign key to tests)
- mcqId (UUID, foreign key to mcqQuestions)
- isCorrect (numeric)
- Unique constraint: (testId, mcqId)
```

---

## Error Handling

All endpoints return error responses with appropriate HTTP status codes:

- **400 Bad Request**: Validation errors, missing required fields
- **401 Unauthorized**: Invalid authentication token, invalid password
- **404 Not Found**: Resource not found (user, question, etc.)
- **409 Conflict**: Duplicate resource (email already registered)
- **500 Internal Server Error**: Server or database errors

Standard error response format:
```json
{
  "error": "Error message description"
}
```

---

## Authentication Details

### JWT Token Structure
- **Payload:**
  ```json
  {
    "id": "user-uuid",
    "email": "user@example.com"
  }
  ```
- **Storage:** `uid` cookie (HttpOnly, SameSite=Strict)
- **Expiration:** 7 days (604800000 ms)

### Middleware
- `checkAuthMiddleware`: Verifies JWT, extracts userId to `req.user.id`
- Applied to routes: `/api/user/*`, `/api/routine/*`, `/api/progress/*`, `/api/test/*`
- Not applied to: `/api/auth/*`

---

## Notes

- All timestamps are in UTC with timezone information
- UUIDs are used for resource IDs (except serial IDs for some tables)
- Database uses PostgreSQL with Drizzle ORM
- Request validation uses Zod schemas
- Questions are identified by questionId (string) not database id
- Tests can be type "practice" (from user progress) or "final" (from routine completion)
