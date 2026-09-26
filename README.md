*This project has been created as part of the 42 curriculum by toloandr, aravelom, as-rakot, mfidimal.*

# Description

This is a social network permitting users to add friends, chat to friends, post pictures/videos. That's basically it, its name is **Heartbeat**.

# Instructions

Since it is using docker compose, the project comes with a docker-compose.yml. All necessary commands are listed using a Makefile. In the root of the project, just launch 'make' to get the documentation of each makefile rules. The prefered command is:
```bash
make up-build-d
```

### Prerequisites

Make sure the following tools are installed on your machine before running the project:

| Tool | Version | Purpose |
|------|---------|---------|
| **Docker** | latest | Containerization |
| **Docker Compose** | latest | Orchestrating the multi-container setup |
| **Git** | latest | Cloning the repository |

> Node.js, PostgreSQL, LocalStack, and Nginx do **not** need to be installed locally — they all run inside Docker containers.

---

### Project Structure

```
.
├── srcs/
│   ├── backend/       # NestJS API + Prisma + Better Auth + S3 client
│   ├── frontend/      # Next.js + Tailwind CSS
│   ├──                # PostgreSQL 17
│   ├──                # LocalStack (S3-compatible storage)
│   └── nginx/         # Nginx reverse proxy
├── docker-compose.yml
└── .env
```

---

### 1. Clone the Repository

```bash
git clone <repository-url>
cd <project-folder>
```

---

### 2. Environment Configuration

Create a `.env` file at the **root** of the project (next to `docker-compose.yml`). It is used by all services via `env_file`. Fill in the required variables:

```env
DB_HOST=postgres
DB_PORT=5432
DB_PASSWORD=password
DB_USER=postgres
DB_NAME=ft_transcendence

BETTER_AUTH_SECRET=

DATABASE_URL="postgresql://postgres:password@postgres:5432/ft_transcendence?schema=public"

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
REDIRECT_URI=https://localhost:9000/nest/auth/callback/google

INITIAL_ADMIN_EMAIL=
INITIAL_ADMIN_PASSWORD=

# LocalStack
LOCALSTACK_AUTH_TOKEN=

# S3 Settings (served by LocalStack)
S3_ENDPOINT=http://localstack:4566
S3_PUBLIC_URL=http://localhost:4566
S3_REGION=us-east-1
S3_ACCESS_KEY=test
S3_SECRET_KEY=test
S3_BUCKET_NAME=uploads
```

> **Note**: Inside the Docker network, services reach each other by their **service name** (e.g., `postgres`, `localstack`, `backend`, `frontend`), not `localhost`.

---

### 3. Build and Start the Stack

From the project root:

```bash
docker compose up --build
```

Or in detached mode:

```bash
docker compose up --build -d
```

This will build and start the following containers:

| Container | Service | Port(s) |
|-----------|---------|---------|
| `postgres-db` | PostgreSQL 17 | `5432` |
| `localstack-s3` | LocalStack (S3) | `4566` |
| `nest-backend` | NestJS API | `3000`, `51212` |
| `next-frontend` | Next.js | `3001` |
| `nginx-server` | Nginx reverse proxy | `9000` → `443` |

The `backend` service waits for both `postgres` and `localstack` to pass their healthchecks before starting. Similarly, `frontend` waits for `postgres`.

---

### 4. Database Setup (Prisma Migrations)

Once the `nest-backend` container is running, open a shell inside it to apply migrations:

```bash
docker compose exec backend sh
```

Then, inside the container:

```bash
npm run prisma:generate
npm run prisma:migrate
```

(Optional) Generate the Better Auth schema and create an admin user:

```bash
npm run auth:generate:force:prisma:pg
npm run create-admin
```

Exit the container:

```bash
exit
```

---

### 5. S3 Bucket Setup (LocalStack)

LocalStack starts empty — you need to create the `uploads` bucket once the container is healthy.

From the host (requires the AWS CLI, or use the container itself):

```bash
# Using the LocalStack container's bundled awslocal
docker compose exec localstack awslocal s3 mb s3://uploads

# List buckets to confirm
docker compose exec localstack awslocal s3 ls
```

Or via the Makefile helpers:

```bash
make ls-s3-create BUCKET=uploads
make ls-s3-buckets
```

> LocalStack accepts any credentials — the standard `test` / `test` pair works. This is why `S3_ACCESS_KEY` and `S3_SECRET_KEY` are hardcoded to `test` in `.env`.

---

### 6. Access the Application

Once all services are healthy, open your browser at:

- **Application (via Nginx, HTTPS)**: https://localhost:9000
- **Frontend (direct)**: http://localhost:3001
- **Backend API (direct)**: http://localhost:3000
- **LocalStack S3 endpoint**: http://localhost:4566
- **PostgreSQL**: `localhost:5432`

> ⚠️ Nginx serves over HTTPS on port `9000`. You may need to accept a self-signed certificate warning in your browser.

> ℹ️ LocalStack has no web console — inspect S3 via the `aws` CLI or `make ls-*` targets. The LocalStack health dashboard is available at http://localhost:4566/_localstack/health.

---

### 7. Useful Commands

| Command | Description |
|---------|-------------|
| `docker compose up --build` | Build and start all services |
| `docker compose up --build -d` | Same, in detached mode |
| `docker compose ps` | List running containers |
| `docker compose logs -f <service>` | Follow logs of a service |
| `docker compose exec backend sh` | Open a shell in the backend container |
| `docker compose exec frontend sh` | Open a shell in the frontend container |
| `docker compose exec postgres psql -U $DB_USER -d $DB_NAME` | Open a psql session |
| `docker compose exec localstack awslocal s3 ls` | List S3 buckets in LocalStack |
| `docker compose down` | Stop and remove containers |
| `docker compose down -v` | Stop and remove containers **and volumes** (⚠️ wipes DB and S3 data) |
| `docker compose build --no-cache` | Rebuild all images from scratch |

---

### 8. Rebuilding After Code Changes

Since `backend` and `frontend` mount their source directories as volumes, code changes are reflected automatically (hot reload in dev mode). However, if you change **dependencies** (`package.json`) or **Dockerfiles**, rebuild:

```bash
docker compose up --build -d
```

---

### 9. Stopping the Project

```bash
docker compose down
```

To also remove volumes (⚠️ deletes PostgreSQL and LocalStack S3 data):

```bash
docker compose down -v
```

# Resources

## Official Documentation

- **NestJS**: https://docs.nestjs.com/ — Framework for building efficient, scalable Node.js server-side applications.
- **Prisma**: https://www.prisma.io/docs — Next-generation ORM for Node.js and TypeScript with type-safe database access.
- **Tailwind CSS**: https://tailwindcss.com/docs — Utility-first CSS framework for rapidly building custom user interfaces.
- **Next.js**: https://nextjs.org/docs — React framework for building full-stack web applications.
- **Better Auth**: https://better-auth.com/docs — Authentication framework with built-in support for email/password, social providers, and plugins (OAuth 2.0, 2FA, API keys).
- **LocalStack**: https://docs.localstack.cloud/ — Fully functional local AWS cloud stack, used here for S3-compatible object storage.

## AI usage
AI helped generating long tedious tasks of creating endpoints in the backend and matching the look of the newly added feature with the general design. It helped too to generate relevant solutions to specific problems if they occured wich is added to the project if tested correct.

# Additional Sections

## Team Information

| Login | Role(s) | Responsibilities |
|-------|---------|------------------|
| `toloandr` | **PO** (Product Owner) + Developer | Defines the product vision, prioritizes the backlog, validates features against requirements, acts as the voice of the end user, and implements assigned features and modules. |
| `as-rakot` | **PM** (Project Manager) + Developer | Organizes the team's workflow, tracks progress, coordinates meetings, ensures deadlines are met, and implements assigned features and modules. |
| `mfidimal` | **Tech Lead** + Developer | Oversees technical architecture, reviews code, makes key technical decisions, mentors developers, and implements assigned features and modules. |
| `aravelom` | **Main Developer** | Implements the core features and modules, writes tests, participates in code reviews, and supports other developers. |

---

## Project Management

### Work Organization

The team followed an agile-inspired workflow compressed into a tight **14-day timeline**. Given the short deadline, the team adopted a lightweight but disciplined process:

- **Sprint structure**: A single 2-week sprint covering the entire project, broken into daily objectives. Each day ended with a short sync to review progress and re-prioritize the next day's work.

- **Task distribution**: Since all four members share the same technical background and are already familiar with NestJS, Next.js, and the Dockerized setup, the team did not need heavy hand-holding or strict task delegation. Instead, each developer **created their own GitHub Issues** based on the shared backlog. This worked well because the developer assigned to a task is the one who best knows what needs to be checked, tested, and delivered — so they defined the scope and acceptance criteria of their own issues.

- **Module kickoff**: Because the PO is also a developer, they took the responsibility of **preparing a minimal skeleton for each module** at the start. This gave every developer a clear starting point and a shared understanding of the module's scope before issues were created and picked up.

- **Code review process**: Every change was submitted via a pull request on GitHub. At least one other team member reviewed the PR before merging. The Tech Lead handled architectural reviews and ensured consistency across the codebase.

- **Decision-making**: Technical and product decisions were made collectively during the daily syncs. The PO had the final say on product-related priorities, the PM on scheduling and scope, and the Tech Lead on architectural matters. Disagreements were resolved by discussion, and when needed, by a quick proof-of-concept to validate the best approach.

- **Time constraints**: With only 14 days available, the team prioritized **critical-path features first**, deferred non-essential refinements, and relied on the shared technical familiarity to move fast without lengthy onboarding or documentation overhead.

### Tools Used

- **GitHub Issues / GitHub Projects** — Task tracking and backlog management.

### Communication Channels

- **whatsapp/slack** — Daily communication, quick questions, and voice meetings.

---

## Technical Stack

### Frontend

- **Next.js 16** — React framework for server-side rendering and routing.
- **React 19** — UI library.
- **Tailwind CSS 4** — Utility-first CSS framework.
- **React Hook Form + Zod** — Form handling and schema validation.
- **next-intl** — Internationalization.
- **Socket.IO Client** — Real-time communication.
- **Better Auth Client** — Authentication on the client side.

### Backend

- **NestJS 12** — Progressive Node.js framework for building scalable server-side applications.
- **Prisma 7** — Type-safe ORM for PostgreSQL.
- **Better Auth** — Authentication framework with Prisma adapter.
- **Socket.IO** — WebSocket gateway for real-time features.
- **Multer + Sharp** — File uploads and image processing.
- **Nodemailer** — Email sending.
- **AWS SDK S3 Client** — Interfacing with LocalStack's S3 API.
- **class-validator / class-transformer** — DTO validation and transformation.
- **Swagger** — API documentation.

### Database

- **PostgreSQL 17** — Chosen for its robustness, ACID compliance, strong support for relational data, and first-class integration with Prisma.
- **LocalStack (S3)** — S3-compatible object storage for files and media assets, running fully locally.

### Other Significant Technologies

- **Docker & Docker Compose** — Containerization and orchestration.
- **Nginx** — Reverse proxy and HTTPS termination.
- **Vitest** — Unit and end-to-end testing.
- **oxlint / ESLint / Prettier** — Linting and formatting.

### Justification for Major Technical Choices

NestJS was chosen over Express because it provides an opinionated, structured architecture out of the box. Express is a lightweight and unopinionated framework — flexible, but it requires developers to manually assemble middleware and define their own project structure. NestJS follows a "convention over configuration" approach and ships with built-in modules, dependency injection, guards, interceptors, and pipes. This enforces a consistent code organization across the team, reduces human error, and improves testability. NestJS is also deeply integrated with TypeScript, offering stronger type safety throughout the backend.

Prisma was chosen over TypeORM primarily for its superior type safety and developer experience. Prisma uses a declarative `.prisma` schema file to define data models and auto-generates a fully type-safe client. This means all database queries are type-checked at compile time, preventing runtime errors such as accessing fields that were not queried — something TypeORM cannot guarantee in every scenario. Prisma's API is also more intuitive, exposing semantic operators like `contains` and `startsWith`, whereas TypeORM leans closer to raw SQL operators. Although TypeORM is more mature and supports the Active Record pattern, Prisma's schema-first approach and powerful migration tooling (Prisma Migrate) gave the team a smoother, more predictable development workflow.

Next.js was chosen over plain React to gain full-stack capabilities out of the box. Plain React is essentially a UI library — developers must configure routing, data-fetching strategies, and build tooling themselves. Next.js, as a React framework, provides file-system routing, server-side rendering (SSR), static site generation (SSG), and API routes as built-in features, significantly reducing initial setup and architectural decisions. This matters for projects that need SEO optimization, fast first-paint performance, and unified full-stack development. Next.js's conventional structure also lowers the onboarding cost for new team members, letting the team focus on building features sooner.

PostgreSQL was chosen over MongoDB because the project requires strong data consistency and structured relational queries. PostgreSQL is a strictly ACID-compliant relational database that enforces data integrity and reliability through foreign keys and transactions — essential for business scenarios involving clearly related entities such as users, sessions, and accounts. While MongoDB offers more schema flexibility, that same flexibility can lead to data inconsistency and long-term maintenance issues. PostgreSQL's mature ecosystem, advanced querying capabilities (joins, aggregations, window functions), and first-class integration with Prisma made it the better fit for this project.

LocalStack was chosen over direct disk storage because it provides an S3-compatible object storage interface, decoupling file storage from the application server. Writing files directly to the local disk ties data to a single container or machine, which breaks as soon as the app scales horizontally or is redeployed. LocalStack solves this by exposing a standard S3 API locally, allowing the backend to store and retrieve files (images, uploads, assets) in a scalable, portable way. It runs fully in Docker alongside the rest of the stack, requires no cloud provider or account, and lets the team migrate to real AWS S3 or any S3-compatible service later without changing application code. Compared to MinIO, LocalStack offers a broader set of AWS services in a single container, which is useful if the project later needs to mock other AWS primitives (SQS, Lambda, etc.).

---

## Database Schema

### Tables / Collections and Relationships

| Table | Description | Key Fields | Relationships |
|-------|-------------|------------|---------------|
| `user` | Core user account | `id`, `email`, `name`, `pseudo`, `role`, `banned` | 1-N with `Session`, `Account`, `Notification`, `Message`, `Friendship`, `Post`, `Comment`, `Channel`, `TwoFactor`; 1-1 with `UserSetting` |
| `session` | Active login sessions | `id`, `token`, `userId`, `expiresAt`, `ipAddress`, `userAgent` | N-1 with `User` |
| `account` | OAuth / credential provider accounts | `id`, `accountId`, `providerId`, `userId`, `password` | N-1 with `User` |
| `verification` | Email / token verification records | `id`, `identifier`, `value`, `expiresAt` | Standalone |
| `apikey` | API keys issued to users/services | `id`, `key`, `referenceId`, `enabled`, `rateLimitMax` | Standalone (references user via `referenceId`) |
| `twoFactor` | 2FA secrets and backup codes | `id`, `secret`, `backupCodes`, `userId`, `verified` | N-1 with `User` |
| `user_settings` | Per-user preferences | `userId`, `theme`, `language` | 1-1 with `User` |
| `notifications` | In-app notifications | `id`, `userId`, `content`, `isSeen` | N-1 with `User` |
| `friendships` | Friend requests, accepted, blocked relations | `id`, `requesterId`, `addresseeId`, `status`, `pairKey`, `blockedById` | N-1 with `User` (requester, addressee, blocker) |
| `message_tables` | DM conversation threads between two users | `id`, `user1Id`, `user2Id`, `pairKey` | N-1 with `User`; 1-N with `Message` |
| `messages` | Individual direct messages | `id`, `messageTableId`, `senderId`, `receiverId`, `content`, `mediaUrls`, `isSeen` | N-1 with `MessageTable`, `User` (sender/receiver) |
| `channels` | Group channels created by users | `id`, `createdById`, `title`, `description`, `mediaUrl` | N-1 with `User`; 1-N with `UserInChannel`, `UserChannelMessage` |
| `user_in_channels` | Membership join table (users ↔ channels) | `userId`, `channelId`, `isOwner`, `joinedAt` | N-1 with `User`, `Channel` (composite PK) |
| `user_channel_messages` | Messages posted inside channels | `id`, `userId`, `channelId`, `content`, `mediaUrls` | N-1 with `User`, `Channel` |
| `posts` | Social feed posts | `id`, `userId`, `content`, `mediaUrls` | N-1 with `User`; 1-N with `Comment`, `UserPostLike` |
| `comments` | Comments on posts | `id`, `userId`, `postId`, `content`, `mediaUrl` | N-1 with `User`, `Post`; 1-N with `UserCommentLike` |
| `user_post_likes` | Post likes join table | `userId`, `postId`, `createdAt` | N-1 with `User`, `Post` (composite PK) |
| `user_comment_likes` | Comment likes join table | `userId`, `commentId`, `createdAt` | N-1 with `User`, `Comment` (composite PK) |

### Key Fields and Data Types

| Field | Type | Notes |
|-------|------|-------|
| `id` | `String` (`cuid(2)`) | Primary key, collision-resistant, sortable, used across all main models. |
| `email` | `String` | Unique on `User`. |
| `pseudo` | `String?` | Optional unique username. |
| `emailVerified` | `Boolean` | Defaults to `false`; set to `true` after verification. |
| `image` | `String` | Defaults to `/nest/uploads/default-avatar.png`. |
| `createdAt` / `updatedAt` | `DateTime` | Auto-managed timestamps. |
| `expiresAt` | `DateTime` | Used on `Session`, `Verification`, `Apikey`. |
| `token` | `String` | Unique session token. |
| `password` | `String?` | Optional hashed password on `Account`. |
| `theme` | `Theme` (enum) | `LIGHT`, `DARK`, `SYSTEM` — defaults to `SYSTEM`. |
| `language` | `Language` (enum) | `FR`, `EN`, `ES` — defaults to `FR`. |
| `status` | `FriendshipStatus` (enum) | `PENDING`, `ACCEPTED`, `REJECTED`, `BLOCKED`, `CANCELLED`. |
| `pairKey` | `String` (`@unique`) | Canonical `"smallerId:largerId"` key preventing duplicate conversations and friendships. |
| `mediaUrls` | `String[]` | Array of S3/LocalStack URLs attached to a message or post. |
| `isSeen` / `seenAt` | `Boolean` / `DateTime?` | Message read receipts. |
| `role` | `String?` | User role (e.g., `admin`, `user`). |
| `banned` / `banReason` / `banExpires` | `Boolean?` / `String?` / `DateTime?` | Moderation fields for user bans. |
| `twoFactorEnabled` | `Boolean?` | Toggles 2FA for a user. |
| `rateLimitMax` / `rateLimitTimeWindow` | `Int?` | Rate-limiting config for API keys. |
| `isOwner` | `Boolean` | Marks the channel owner in `user_in_channels`. |
| Composite PKs | `@@id([...])` | Used on `user_in_channels`, `user_post_likes`, `user_comment_likes` to enforce uniqueness on join tables. |

> **Notes on design choices:**
> - **`pairKey`** on `friendships` and `message_tables` prevents `(A,B)` and `(B,A)` duplicates at the database level.
> - **`onDelete: Cascade`** is applied to most user-owned relations so deleting a user cleans up their data. `MessageTable` uses `SetNull` on `user1`/`user2` to preserve message history even if a user is removed.
> - **Composite primary keys** on like/membership tables prevent duplicate likes and duplicate channel joins.
> - **Indexes** are added on foreign keys and frequently sorted fields (`createdAt(sort: Desc)`) for query performance.

---

## Features List

| # | Feature | Description | Team Member(s) |
|---|---------|-------------|----------------|
| 1 | **User Authentication** | Email/password registration, login, session management, and logout using Better Auth. Sessions are stored in the `session` table with expiry, IP, and user-agent tracking. | `toloandr` |
| 2 | **OAuth 2.0 Login** | Sign in with external providers (Google). Provider accounts are linked via the `account` table. | `toloandr` |
| 3 | **Two-Factor Authentication (2FA)** | TOTP-based 2FA with backup codes. Users can enable, verify, and disable 2FA from their settings. Secrets stored in the `twoFactor` table. | `toloandr` |
| 4 | **User Profile Management** | Users can update name, email, and avatar. Each user has a public profile page displaying their info, posts, and friends. | `toloandr, aravelom` |
| 5 | **Avatar Upload** | Users can upload a custom avatar with server-side validation and Sharp processing. A default avatar is used if none is provided. | `toloandr` |
| 6 | **Friends System** | Full friendship lifecycle: send, accept, reject, and cancel requests. Uses a `pairKey` to prevent duplicate relations. | `aravelom, as-rakot, toloandr` |
| 7 | **Online Status / Presence** | Real-time presence tracking over WebSockets — users can see who is online among their friends. | `mfidimal` |
| 8 | **Direct Messaging (Chat)** | One-to-one real-time chat between users. Conversations are stored in `message_tables`, individual messages in `messages`, with media attachments and read receipts (`isSeen`, `seenAt`). | `mfidimal` |
| 9 | **Social Feed (Posts)** | Users can publish posts with text and media. Posts appear in a feed sorted by creation date (indexed `createdAt DESC`). | `as-rakot, aravelom` |
| 10 | **Comments and Likes** | Users can comment on posts and like both posts and comments. Likes use composite PKs (`user_post_likes`, `user_comment_likes`) to prevent duplicates. | `as-rakot, aravelom` |
| 11 | **Advanced Permissions System** | Role-based access control with multiple roles (`admin`, `user`, `moderator`). Admins can create, view, edit, and delete users, and access moderation views. Admins have access to the admin platform. | `toloandr` |
| 12 | **Public API with API Keys** | Secured REST API with API key authentication via the Better Auth API Key plugin, per-key rate limiting, and Swagger documentation. Exposes 5+ endpoints across GET/POST/PUT/DELETE. | `toloandr` |
| 13 | **File Upload & Management** | Multi-type upload (images, documents) with client + server validation, Sharp processing, LocalStack S3 storage, access control, progress indicators, preview, and deletion. | `as-rakot`, `toloandr` |
| 14 | **Internationalization (i18n)** | Full translation support for **French**, **English**, and **Spanish** via `next-intl`, with a UI language switcher and per-user language preference stored in `user_settings.language`. | `mfidimal` |
| 15 | **Theme Switching** | Users can toggle between light, dark, and system themes. Preference stored in `user_settings.theme`. | `toloandr, as-rakot` |
| 16 | **Real-time WebSocket Layer** | Socket.IO gateway handles connections, disconnections, authentication, and event broadcasting (new messages, presence). | `mfidimal` |
| 17 | **Notification System** | Complete notification system for all creation, update, and deletion actions across the platform, using `sonner` for toast notifications. | `mfidimal, toloandr, aravelom, as-rakot` |
| 18 | **Organization System (Discussion Channels)** | Users can create, edit, and delete discussion channels (organizations), add/remove members, post messages with media, and perform owner-based actions within a channel. | `as-rakot, mfidimal` |

---

## Modules

### Module Summary

| Module | Type | Points | Chosen By |
|--------|------|--------|-----------|
| Use a frontend framework (Next.js / React) | Minor | 1 | `mfidimal, as-rakot, toloandr, aravelom` |
| Use a backend framework (NestJS) | Minor | 1 | `mfidimal, as-rakot, toloandr, aravelom` |
| Use an ORM for the database (Prisma) | Minor | 1 | `mfidimal, as-rakot, toloandr, aravelom` |
| Support for multiple languages (i18n, 3+ languages) | Minor | 1 | `mfidimal` |
| Implement a complete 2FA system | Minor | 1 | `toloandr` |
| Implement remote authentication with OAuth 2.0 | Minor | 1 | `toloandr` |
| Standard user management and authentication | Major | 2 | `toloandr, aravelom` |
| Advanced permissions system (roles, CRUD on users) | Major | 2 | `toloandr` |
| Public API with secured API key, rate limiting, docs, 5+ endpoints | Major | 2 | `toloandr` |
| File upload and management system | Minor | 1 | `as-rakot` |
| Real-time features using WebSockets | Major | 2 | `mfidimal` |
| Users interact with other users (chat, profile, friends) | Major | 2 | `mfidimal, as-rakot, toloandr, aravelom` |
| Complete notification system | Minor | 1 | `mfidimal, as-rakot, toloandr, aravelom` |
| Organization system (discussion channels) | Major | 2 | `as-rakot, mfidimal` |
| **Total** | | **20 pts** | |

---

### Module Details

#### Frontend Framework (Next.js + React) — Minor (1 pt)

- **Justification**: A modern frontend framework is mandatory for building a responsive, component-based social network UI. Next.js was chosen over plain React for its built-in routing, SSR/SSG, and API integration, which speeds up development and improves SEO and first-paint performance.
- **Implementation**: The frontend is built with Next.js 16 (App Router) and React 19, styled with Tailwind CSS 4. State is managed with Zustand, forms with React Hook Form + Zod, and real-time updates via Socket.IO Client.
- **Team Member(s)**: `ALL`

#### Backend Framework (NestJS) — Minor (1 pt)

- **Justification**: A structured backend framework is essential to keep the codebase consistent across four developers in a 14-day sprint. NestJS provides modules, dependency injection, guards, and interceptors out of the box, which enforces architecture and reduces setup overhead.
- **Implementation**: The backend is a NestJS 12 application organized into feature modules (auth, users, friends, messages, channels, posts, files, notifications). It exposes a REST API documented via Swagger and a WebSocket gateway for real-time events.
- **Team Member(s)**: `ALL`

#### ORM for the Database (Prisma) — Minor (1 pt)

- **Justification**: Prisma was chosen for its type-safe client, declarative schema, and migration tooling — critical for a data-heavy social network with many relational models (users, friendships, messages, posts, likes).
- **Implementation**: All models are defined in `schema.prisma` with relations, enums, indexes, and composite keys. Prisma Migrate handles schema evolution, and the generated client is used across all NestJS services.
- **Team Member(s)**: `ALL`

#### Multiple Languages / i18n — Minor (1 pt)

- **Justification**: A social network targets users across regions, so full internationalization is required. The subject mandates at least 3 complete language translations with a UI switcher and all user-facing text translatable.
- **Implementation**: `next-intl` handles translations on the frontend with locale files for **French**, **English**, and **Spanish**. A language switcher is available in the UI, the selected language is persisted per user in `UserSetting.language`, and all UI strings use translation keys — no hardcoded text.
- **Team Member(s)**: `mfidimal`

#### Complete 2FA System — Minor (1 pt)

- **Justification**: Two-factor authentication adds a critical security layer to user accounts, which is essential for a platform handling private messages and personal data.
- **Implementation**: 2FA is implemented with Better Auth's two-factor plugin, supporting TOTP (authenticator apps) and backup codes. Secrets and backup codes are stored in the `TwoFactor` model, with `twoFactorEnabled` on the `User`. Users can enable, verify, and disable 2FA from their settings.
- **Team Member(s)**: `toloandr`

#### Remote Authentication with OAuth 2.0 — Minor (1 pt)

- **Justification**: OAuth 2.0 allows users to sign in with existing accounts (Google), improving onboarding and reducing password fatigue — a standard expectation for modern social platforms.
- **Implementation**: Better Auth handles the OAuth 2.0 flow with external providers. Provider accounts are linked through the `Account` model, and sessions are issued via the `Session` model. Users can link/unlink providers from their profile.
- **Team Member(s)**: `toloandr`

#### Standard User Management and Authentication — Major (2 pts)

- **Justification**: Core to any social network — users must be able to register, log in, manage their identity, and connect with others.
- **Implementation**:
  - **Profile updates**: users can edit name, pseudo, email, and other profile info.
  - **Avatar upload**: users can upload a custom avatar via the file system; a default avatar (`/nest/uploads/default-avatar.png`) is used if none is provided.
  - **Friends system**: users can send, accept, reject, cancel, and block friend requests via the `Friendship` model, which uses a `pairKey` to prevent duplicates.
  - **Online status**: presence is tracked in real time through WebSockets.
  - **Profile page**: each user has a public profile displaying their info, posts, and friends.
- **Team Member(s)**: `toloandr, aravelom, as-rakot`

#### Advanced Permissions System — Major (2 pts)

- **Justification**: A social network needs moderation and role-based access to keep the platform safe and manageable. Some pages are not accessible to normal users.
- **Implementation**: Roles (`admin`, `moderator`, `user`) are stored on `User.role`. NestJS guards enforce role checks on endpoints, and the frontend conditionally renders views and actions based on role. Admins can perform full CRUD on users (create, view, edit, delete).
- **Team Member(s)**: `toloandr`

#### Public API with Secured API Key, Rate Limiting, Docs, 5+ Endpoints — Major (2 pts)

- **Justification**: Exposing a public API allows external integrations and demonstrates a production-grade backend. Security (API keys + rate limiting) and documentation are required to make it usable and safe.
- **Implementation**: API keys are issued and managed through the **Better Auth API Key plugin**, which stores keys with configurable rate limiting (`rateLimitMax`, `rateLimitTimeWindow`, `refillInterval`). NestJS guards validate the API key and enforce rate limits. Swagger documents the API, which exposes well over 5 endpoints across `GET`, `POST`, `PUT`, and `DELETE` on resources like users, posts, messages, and channels.
- **Team Member(s)**: `toloandr`

#### File Upload and Management System — Minor (1 pt)

- **Justification**: A social network is media-heavy — post images, chat attachments, and channel banners all require robust file handling with security and previews.
- **Implementation**: Files are uploaded via Multer, validated on the client (type, size, format) and server, processed with Sharp (resizing/optimization), and stored in **LocalStack S3** (S3-compatible). Access control is enforced per resource, uploads show progress indicators on the frontend, and users can delete their uploaded files.
- **Team Member(s)**: `as-rakot`

#### Real-time Features using WebSockets — Major (2 pts)

- **Justification**: Real-time interaction is what makes a social network feel alive — instant messages, notifications, and online status all depend on it.
- **Implementation**: A Socket.IO gateway is implemented in NestJS (`@nestjs/websockets` + `@nestjs/platform-socket.io`), with the client using `socket.io-client` on the frontend. The gateway handles connection/disconnection gracefully, authenticates sockets via Better Auth sessions, and broadcasts events efficiently (new messages, notifications, presence changes) to the right rooms/channels only.
- **Team Member(s)**: `mfidimal`

#### Users Interact with Other Users (Chat, Profile, Friends) — Major (2 pts)

- **Justification**: This is the heart of the social network — the subject requires a basic chat system, a profile system, and a friends system.
- **Implementation**:
  - **Chat**: direct messages are stored in `MessageTable` (one per user pair) and `Message` (individual messages with `mediaUrls`, read receipts via `isSeen`/`seenAt`). Real-time delivery is handled via WebSockets.
  - **Profile system**: public user profiles display avatar, pseudo, bio, posts, and friends.
  - **Friends system**: full lifecycle via `Friendship` (`PENDING`, `ACCEPTED`, `REJECTED`, `CANCELLED`), with `pairKey` preventing duplicate relations.
- **Team Member(s)**: `as-rakot, toloandr, mfidimal, aravelom`

#### Complete Notification System — Minor (1 pt)

- **Justification**: Users need immediate feedback on all create, update, and delete actions across the platform. A unified notification system improves UX and makes state changes visible in real time.
- **Implementation**: Notifications are delivered on all CRUD actions (post created, friend request sent, message received, channel updated, etc.) using **sonner** on the frontend for toast notifications. 
- **Team Member(s)**: `as-rakot, toloandr, mfidimal, aravelom`

#### Organization System — Major (2 pts)

- **Justification**: Organizations allow users to group together and collaborate in shared spaces, extending the social network beyond 1-to-1 interactions. Rather than introducing a separate domain model, organizations are implemented as **discussion channels** — a natural fit for a social platform, since channels already provide a shared space with membership, roles, and messages.
- **Implementation**:
  - **Create / edit / delete organizations**: users can create new organizations, update their details, and delete them.
  - **Add / remove users**: organization owners can invite users to join and remove them from the organization.
  - **View organizations**: users can browse organizations and see their members, with member-only views exposing the discussion thread.
  - **Actions within an organization** (minimum create, read, update): ownership and role checks enforce who can edit the organization, invite members, or remove them. All membership and CRUD actions emit notifications and are broadcast in real time.
- **Team Member(s)**: `as-rakot, mfidimal`
