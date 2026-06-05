# Learnix-AI Backend API Endpoints

## Complete API Reference Table

| API Path | Request Body | Response |
|----------|--------------|----------|
| **POST** `/api/auth/register` | `{ email: string, password: string, name: string, university?: string }` | `{ success: boolean, message: string, userId: string, token: string }` |
| **POST** `/api/auth/login` | `{ email: string, password: string }` | `{ success: boolean, message: string, userId: string, token: string, user: { id, email, name, university } }` |
| **POST** `/api/auth/google` | `{ token: string (Google OAuth token) }` | `{ success: boolean, message: string, userId: string, token: string, user: { id, email, name } }` |
| **POST** `/api/auth/logout` | `{}` | `{ success: boolean, message: "Logged out successfully" }` |
| **POST** `/api/progress/complete` | `{ userId: string, questionId: string, testId?: string }` | `{ success: boolean, message: string, progressId: string, completedAt: timestamp }` |
| **GET** `/api/progress/question/:userId/:questionId` | Query Params: none | `{ success: boolean, progress: { userId, questionId, completedAt, attempts } }` |
| **GET** `/api/progress/user/:userId` | Query Params: none | `{ success: boolean, totalQuestions: number, completedQuestions: number, progress: [{ questionId, completedAt }] }` |
| **POST** `/api/routine/generate` | `{ userId: string, semester: number, examDate: string (YYYY-MM-DD), preferredHours: number }` | `{ success: boolean, routine: { id, userId, semester, routine: [{ date, time, topics, duration }], createdAt } }` |
| **POST** `/api/test/create` | `{ userId: string, semester: number, numQuestions: number }` | `{ success: boolean, testId: string, questions: [{ id, question, options, marks }], createdAt }` |
| **GET** `/api/test/:userId` | Query Params: none | `{ success: boolean, tests: [{ id, semester, createdAt, totalQuestions, status }] }` |
| **POST** `/api/test/answer` | `{ testId: string, questionId: string, selectedOption: number, timeSpent: number }` | `{ success: boolean, message: string, answerId: string }` |
| **GET** `/api/test/result/:testId` | Query Params: none | `{ success: boolean, result: { testId, totalQuestions, correctAnswers, score, percentage, timeSpent, answers: [...] } }` |
| **POST** `/api/test/create/final` | `{ userId: string, semester: number }` | `{ success: boolean, testId: string, questions: [{ id, question, options, marks }], totalMarks: number }` |
| **GET** `/api/user/profile` | Query Params: none (Auth Required) | `{ success: boolean, user: { id, email, name, university, createdAt, lastLogin } }` |
| **GET** `/api/user/progress` | Query Params: none (Auth Required) | `{ success: boolean, totalQuestionsCompleted: number, totalTestsCompleted: number, averageScore: number, recentTests: [...], streakDays: number }` |
| **GET** `/api/user/test/recent` | Query Params: none (Auth Required) | `{ success: boolean, recentTests: [{ testId, semester, date, score, percentage, status }] }` |

---

## Authentication Details

- **Base URL:** `http://localhost:PORT/api`
- **Authentication Method:** JWT Bearer Token (sent in `Authorization: Bearer <token>` header)
- **Token Expiration:** 7 days
- **Default Port:** Configured in `.env`

---

## API Categories

### 1. **Authentication APIs** (No Auth Required)
- `/api/auth/register` - Create new user account
- `/api/auth/login` - Authenticate existing user
- `/api/auth/google` - OAuth authentication with Google
- `/api/auth/logout` - End user session

### 2. **Progress APIs** (Auth Required)
- Track user's question completion status
- Get individual or aggregate progress data

### 3. **Routine APIs** (Auth Required)
- Generate personalized study routines based on semester and exam date
- Optimize study schedule based on available hours

### 4. **Test APIs** (Auth Required)
- Create practice tests from question bank
- Submit test answers
- Get test results and performance metrics
- Create final exam simulations

### 5. **User Dashboard APIs** (Auth Required)
- Retrieve user profile information
- Get comprehensive progress summary
- Access recent test results and performance trends

---

## Error Response Format

All endpoints follow this error response format:
```json
{
  "success": false,
  "message": "Error description",
  "statusCode": 400 | 401 | 403 | 404 | 500
}
```

---

## HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Server Error

