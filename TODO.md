# Stow – Backend Execution Plan (Core + Controlled Enhancements)

Deadline: 03/03/2026  

--------------------------------------------------

PROJECT OBJECTIVE

--------------------------------------------------
Build a subscription-based file & folder system with:

- Dynamic admin-defined package limits
- Strict runtime enforcement
- Subscription history tracking
- Rate limiting
- Usage analytics
- JWT access + refresh token authentication

No unnecessary features.

--------------------------------------------------

PHASE 1 – PROJECT SETUP

--------------------------------------------------

[ ] Initialize Node.js + TypeScript project
[ ] Install dependencies:
    - express
    - prisma
    - @prisma/client
    - pg
    - jsonwebtoken
    - bcrypt
    - multer
    - cors
    - dotenv
    - express-rate-limit
    - uuid

[ ] Setup tsconfig.json
[ ] Create folder structure:

src/
  app.ts
  server.ts
  config/
  modules/
  middlewares/
  utils/
  uploads/

[ ] Setup environment variables:
    DATABASE_URL
    JWT_ACCESS_SECRET
    JWT_REFRESH_SECRET
    ACCESS_TOKEN_EXPIRES=15m
    REFRESH_TOKEN_EXPIRES=7d

[ ] Setup Prisma + migrate

--------------------------------------------------

PHASE 2 – DATABASE DESIGN

--------------------------------------------------

Models:

1. User
   - id
   - name
   - email (unique)
   - password
   - role (ADMIN | USER)
   - createdAt

2. SubscriptionPackage
   - id
   - name
   - maxFolders
   - maxNestingLevel
   - allowedFileTypes (enum[])
   - maxFileSizeMB
   - totalFileLimit
   - filesPerFolder
   - createdAt
   - updatedAt

3. UserSubscription
   - id
   - userId
   - packageId
   - startDate
   - endDate
   - isActive

4. Folder
   - id
   - name
   - userId
   - parentId
   - nestingLevel
   - createdAt

5. File
   - id
   - name
   - type (IMAGE | VIDEO | AUDIO | PDF)
   - size (store in bytes)
   - path
   - folderId
   - userId
   - createdAt

6. RefreshToken
   - id
   - userId
   - token
   - expiresAt
   - createdAt

[ ] Create schema
[ ] Migrate
[ ] Seed default admin

--------------------------------------------------

PHASE 3 – AUTHENTICATION (ACCESS + REFRESH)

--------------------------------------------------

Access Token:

- Short lived (15m)

Refresh Token:

- Stored in DB
- 7 day expiry
- Rotated on refresh

Routes:

[ ] POST /auth/register
[ ] POST /auth/login
[ ] POST /auth/refresh
[ ] POST /auth/logout

Flow:

Login:

1. Validate credentials
2. Generate access token
3. Generate refresh token
4. Store refresh token in DB
5. Return both tokens

Refresh:

1. Validate refresh token
2. Check in DB
3. Rotate token
4. Issue new access token

Logout:

1. Delete refresh token from DB

--------------------------------------------------

PHASE 4 – RATE LIMITING

--------------------------------------------------

Global rate limiter:

- Apply to auth routes (strict)
- Apply moderate limit to upload routes

Example:

- Auth: 5 requests per minute
- Upload: 20 requests per minute

--------------------------------------------------

PHASE 5 – ADMIN PACKAGE MANAGEMENT

--------------------------------------------------

Routes:

[ ] POST   /admin/packages
[ ] GET    /admin/packages
[ ] PATCH  /admin/packages/:id
[ ] DELETE /admin/packages/:id

- Only ADMIN role
- All limits stored dynamically

--------------------------------------------------

PHASE 6 – USER SUBSCRIPTION

--------------------------------------------------

Routes:

[ ] GET  /subscriptions
[ ] POST /subscriptions/select/:packageId
[ ] GET  /subscriptions/history

Logic:

- End previous subscription
- Create new active subscription
- No data deletion

--------------------------------------------------

PHASE 7 – ENFORCEMENT ENGINE (CRITICAL)

--------------------------------------------------

Reusable service:

validateFolderCreation(userId, parentId)
validateFileUpload(userId, folderId, fileMeta)

Folder checks:

- Total folders < maxFolders
- nestingLevel <= maxNestingLevel

File checks:

- Type allowed
- Size <= maxFileSizeMB
- Total files < totalFileLimit
- Files in folder < filesPerFolder

Reject with structured error if violated.

--------------------------------------------------

PHASE 8 – FOLDER MANAGEMENT

--------------------------------------------------

Routes:

[ ] POST   /folders
[ ] GET    /folders
[ ] PATCH  /folders/:id
[ ] DELETE /folders/:id

Compute nesting dynamically.

--------------------------------------------------

PHASE 9 – FILE MANAGEMENT

--------------------------------------------------

Routes:

[ ] POST   /files/upload
[ ] GET    /files/:folderId
[ ] PATCH  /files/:id
[ ] DELETE /files/:id

Store files locally in /uploads.

--------------------------------------------------

PHASE 10 – ANALYTICS (SIMPLE)

--------------------------------------------------

Create endpoint:

[ ] GET /analytics/usage

Return:

{
  totalFolders,
  totalFiles,
  totalStorageUsedBytes,
  storageUsedMB,
  activePackage
}

Implementation:

- COUNT folders
- COUNT files
- SUM file.size
- Fetch active subscription

No complex charts required.

--------------------------------------------------

PHASE 11 – ERROR HANDLING

--------------------------------------------------

[ ] Global error handler
[ ] Consistent JSON response format

Example:
{
  success: false,
  message: "Files per folder limit exceeded"
}

--------------------------------------------------

PHASE 12 – FINAL CHECKLIST

--------------------------------------------------

[ ] Folder limit enforcement works
[ ] Nesting limit blocks properly
[ ] File size restriction works
[ ] File type restriction works
[ ] Total file limit works
[ ] Files per folder works
[ ] Subscription switching works
[ ] Refresh token rotation works
[ ] Rate limiting triggers correctly
[ ] Analytics endpoint accurate
