# Stow – SaaS File Management System

Stow is a subscription-based file and folder management platform where all storage limits are dynamically defined by the admin and strictly enforced at runtime.

--------------------------------------------------

TECH STACK

--------------------------------------------------

- Node.js
- Express.js
- TypeScript
- PostgreSQL
- Prisma ORM

--------------------------------------------------

CORE FEATURES

--------------------------------------------------

Admin:

- Manage subscription packages
- Define dynamic storage limits

User:

- Register & Login
- JWT Access + Refresh Token authentication
- Select subscription package
- View subscription history
- Create nested folders
- Upload and manage files

--------------------------------------------------

ENFORCEMENT ENGINE

--------------------------------------------------

Every file or folder action:

1. Fetch active subscription
2. Fetch package limits
3. Validate action
4. Proceed or reject

No limits are hardcoded.

When switching packages:

- Existing data remains
- New limits apply only to future actions

--------------------------------------------------

SECURITY

--------------------------------------------------

- JWT access tokens (short-lived)
- Refresh token rotation
- Stored refresh tokens in database
- Rate limiting on sensitive routes

--------------------------------------------------

ANALYTICS

--------------------------------------------------

Endpoint:
GET /analytics/usage

Returns:

- Total folders
- Total files
- Total storage used
- Active subscription

--------------------------------------------------

SETUP

--------------------------------------------------

1. Clone repository
2. Configure .env:
   DATABASE_URL
   JWT_ACCESS_SECRET
   JWT_REFRESH_SECRET
3. Run:
   npx prisma migrate dev
   npm run dev

Demonstrate strong backend architecture, dynamic SaaS rule enforcement, secure authentication, and clean database design.
