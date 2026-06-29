# Omega3 — Backend

REST API powering the Omega3 project management platform. Built with Express and MongoDB, with Redis-backed OTP flows, JWT authentication, and Cloudinary-powered avatar uploads.

![Tech](https://img.shields.io/badge/Node.js-24-339933) ![Tech](https://img.shields.io/badge/Express-4-000000) ![Tech](https://img.shields.io/badge/MongoDB-Mongoose-47A248) ![Tech](https://img.shields.io/badge/Redis-Upstash-DC382D)

---

## Overview

The API exposes five resource domains — **Auth, User, Workspace, Project, Task** — all returning a consistent response envelope and protected by JWT bearer authentication. OTP-based flows (email verification, password reset) are backed by Redis for expiry and rate-limiting.

## Tech Stack

| Concern | Technology |
|---|---|
| Runtime | Node.js (ESM, `"type": "module"`) |
| Framework | Express 4 |
| Database | MongoDB via Mongoose |
| Cache / OTP store | Redis (Upstash-compatible) |
| Auth | JSON Web Tokens (`jsonwebtoken`) |
| Validation | Zod + `zod-express-middleware` |
| Password hashing | argon2 / bcrypt |
| Email | Nodemailer |
| File uploads | Multer (memory storage) → Cloudinary |
| Deployment | Vercel (serverless) |

## Project Structure

```
src/
├── index.js                  # Entry point
├── app.bootstrap.js           # Express app setup, middleware, route mounting
│
├── Common/
│   ├── response/                # successResponse, error classes, global error handler
│   ├── services/                  # redis.service.js, cloudinary.service.js
│   └── utils/
│       ├── email/                   # Nodemailer client, templates, event emitter
│       ├── security/                  # hashing, encryption, token generation
│       └── otp.js                       # OTP generation
│
├── DB/
│   ├── Models/                  # User, Workspace, Project, Task, Comment, Activity, Token
│   ├── database.repository.js     # Generic find/create/update/delete helpers
│   ├── db.connection.js             # Mongoose connection
│   └── redis.connection.js            # Redis client connection
│
├── Middleware/
│   ├── auth.middleware.js          # JWT verification, attaches req.user
│   ├── validation.middleware.js      # Zod schemas for every endpoint
│   ├── upload.middleware.js            # Multer config + error normalization
│   ├── recordActivity.js                # Activity log writer
│   └── asyncHandler.middleware.js         # Wraps async route handlers
│
└── Modules/
    ├── Auth/                      # register, login, verify email, reset password
    ├── User/                       # profile, avatar upload, change password
    ├── Workspace/                    # CRUD, invites (email + link), members
    ├── Project/                        # CRUD, members, stats
    └── Task/                             # CRUD, subtasks, comments, watchers, activity
```

## Getting Started

### Prerequisites

- Node.js ≥ 20
- A MongoDB connection string (Atlas or self-hosted)
- A Redis connection string (Upstash recommended for serverless)
- A Cloudinary account (free tier is sufficient) — for avatar uploads
- An SMTP-capable email account (Gmail app password works) — for OTP emails

### Installation

```bash
npm install
```

### Environment Variables

Create `config/.env.development` (and `config/.env.production` for prod):

```env
PORT=3000
APPLICATION_NAME="OMGA3"

# ===== Database =====
MONGODB_URI="mongodb+srv://<user>:<password>@<cluster>.mongodb.net/"
REDIS_URI="rediss://<user>:<password>@<host>:<port>"

# ===== Auth / JWT =====
JWT_SECRET='<random-secret>'
User_TOKEN_SECRET_KEY='<random-secret>'
ACCESS_EXPIRES_IN=900
REFRESH_EXPIRES_IN=604800

# ===== Encryption =====
ENC_BYTE='<32-byte-key>'
SALT_ROUND=10

# ===== OTP =====
OTP_EXPIRES_IN_MINUTES=5

# ===== Email =====
EMAIL_APP='your-email@gmail.com'
EMAIL_APP_PASSWORD='your-app-password'

# ===== Frontend =====
FRONTEND_URL='http://localhost:5173'

# ===== Cloudinary =====
CLOUDINARY_CLOUD_NAME='your_cloud_name'
CLOUDINARY_API_KEY='your_api_key'
CLOUDINARY_API_SECRET='your_api_secret'
```

> **Never commit real values.** Both env files are already listed in `.gitignore`. If credentials are ever shared outside this repo (chat, screenshots, tickets), rotate them immediately.

### Development

```bash
npm run start:dev
```

### Production

```bash
npm run start:prod
```

## API Reference

Base URL has **no path prefix** — routes are mounted directly off root.

Every response follows the same shape:

```json
{ "status": 200, "message": "Done", "data": {} }
```

Errors:

```json
{ "status": 400, "errorMessage": "Something went wrong" }
```

### Auth — `/auth`

| Method | Path | Description |
|---|---|---|
| POST | `/register` | Create account, sends verification email |
| POST | `/login` | Returns JWT + user object |
| PATCH | `/verifyEmail` | Confirm account via OTP |
| PATCH | `/resend-confirm-email` | Resend verification OTP |
| POST | `/reset-password` | Request password reset OTP |
| PATCH | `/verify-forgot-password-code` | Verify reset OTP |
| PATCH | `/reset-forgot-password-code` | Set new password |

### User — `/user` *(all require auth)*

| Method | Path | Description |
|---|---|---|
| GET | `/profile` | Get current user |
| PATCH | `/updateProfile` | Update display name / profile picture URL |
| POST | `/profile/avatar` | Upload avatar image (`multipart/form-data`, field `avatar`, ≤5MB, jpeg/png/webp/gif) — uploads to Cloudinary, returns updated user |
| PATCH | `/change-password` | Change password |

### Workspace — `/workspace` *(auth required unless noted)*

| Method | Path | Description |
|---|---|---|
| GET | `/` | List workspaces for current user |
| GET | `/:id` | Workspace details + members |
| GET | `/:id/projects` | Workspace + its projects |
| GET | `/:id/stats` | Dashboard analytics for workspace |
| POST | `/` | Create workspace |
| POST | `/:id/invite-member` | Send email invite |
| POST | `/accept-invite-token` | Accept invite via emailed token |
| POST | `/:id/accept-generate-invite` | Accept invite via shareable link |

### Project — `/project` *(auth required)*

| Method | Path | Description |
|---|---|---|
| POST | `/:workspaceId/create-project` | Create project in workspace |
| GET | `/:id/tasks` | Project details + its tasks |

### Task — `/task` *(auth required)*

| Method | Path | Description |
|---|---|---|
| POST | `/:projectId/create-task` | Create task |
| GET | `/:id` | Task details + parent project |
| GET | `/my-tasks` | All tasks assigned to current user |
| PUT | `/:id/title` \| `/status` \| `/description` \| `/assignees` \| `/priority` | Field-specific updates |
| POST | `/:id/add-subtask` | Add subtask |
| PUT | `/:id/update-subtask/:subTaskId` | Toggle subtask completion |
| POST | `/:id/add-comment` | Add comment |
| GET | `/:id/comments` | List comments |
| GET | `/:id/activity` | Activity log |
| POST | `/:id/watch` | Toggle watch status |
| POST | `/:id/achieved` | Toggle archive status |

## Avatar Upload Flow (Cloudinary)

1. Client sends `multipart/form-data` with field `avatar` to `POST /user/profile/avatar`.
2. `upload.middleware.js` validates file type (`jpeg`/`png`/`webp`/`gif`) and size (≤5MB) in memory — nothing touches disk, which keeps this serverless-compatible.
3. The buffer is streamed to Cloudinary under a per-user `public_id` (`omega3/avatars/user_<id>`), with a 400×400 face-aware crop transformation.
4. Re-uploading overwrites the same asset — no orphaned files accumulate on Cloudinary.
5. The user document's `profilePicture` (public URL) and `profilePicturePublicId` (hidden, `select: false`) fields are updated, then the response returns the updated user.

## Authentication Flow

1. `POST /auth/login` validates credentials and returns `{ token, userData }`.
2. Client sends `Authorization: Bearer <token>` on every subsequent request.
3. `auth.middleware.js` verifies the JWT, loads the user from MongoDB, and attaches it to `req.user`.
4. Invalid or expired tokens return `401`, which the frontend treats as a global logout signal.

## Error Handling

All thrown errors carry a `cause: { status, extra }` payload (see `Common/response/error.response.js`). The global error handler (`globalErrorHandling`) reads this to return the correct HTTP status, masking internal error messages in production (`NODE_ENV=production`) while still logging stack traces server-side.

## Database Models

| Model | Key relationships |
|---|---|
| `User` | — |
| `Workspace` | owner → User, members[] → User |
| `WorkspaceInvite` | workspace → Workspace |
| `Project` | workspace → Workspace, members[] → User |
| `Task` | project → Project, assignees[] → User, subtasks[], watchers[] → User |
| `Comment` | task → Task, author → User |
| `Activity` | user → User, resourceType/resourceId (polymorphic) |
| `Token` | user → User (refresh token tracking / revocation) |

## Deployment

Configured for Vercel serverless deployment via `vercel.json` — all routes proxy through `src/index.js`. Ensure all environment variables above are set in the Vercel project settings (not committed to the repo).

## Security Notes

- Rotate **all** secrets (`JWT_SECRET`, `MONGODB_URI` password, `EMAIL_APP_PASSWORD`, `REDIS_URI`) if they were ever pasted into a chat, ticket, or shared document.
- Avatar uploads are restricted server-side by MIME type and size regardless of what the client claims — do not rely on frontend validation alone.

## License

Private project — all rights reserved.
