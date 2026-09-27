# API-Key Guarded Endpoints Documentation

**Base URL:** `https://localhost:9000/nest`

All endpoints below require an API key sent in the **`x-api-key`** header:

```
x-api-key: <YOUR_API_KEY>
```

> ⚠️ Since the server uses a self-signed certificate on `localhost`, you may need `-k` (curl) or `rejectUnauthorized: false` (Node) when testing.

---

## 1. List All Users (Admin)

```http
GET /user/api-key
```

**curl:**
```bash
curl -k -X GET https://localhost:9000/nest/user/api-key \
  -H "x-api-key: <YOUR_API_KEY>"
```

**Response:** Array of user objects.

---

## 2. Count All Users (Admin)

```http
GET /user/api-key/count
```

**curl:**
```bash
curl -k -X GET https://localhost:9000/nest/user/api-key/count \
  -H "x-api-key: <YOUR_API_KEY>"
```

**Response:** `{ "count": <number> }` (or similar).

---

## 3. Search Users

Search users to befriend. Excludes self, existing friends, pending requests, and blocked users. The current user is derived from the API key's `referenceId`.

```http
GET /user/api-key/search?<query>
```

**Query params** (per `SearchUsersQueryDto`, typically):
- `q` / `query` — search term (username, email, etc.)
- `limit`, `offset` — pagination

**curl:**
```bash
curl -k -X GET "https://localhost:9000/nest/user/api-key/search?q=alice&limit=10" \
  -H "x-api-key: <YOUR_API_KEY>"
```

---

## 4. Get Current User

Returns the user associated with the API key's `referenceId`.

```http
GET /user/api-key/me
```

**curl:**
```bash
curl -k -X GET https://localhost:9000/nest/user/api-key/me \
  -H "x-api-key: <YOUR_API_KEY>"
```

---

## 5. Update Current User

```http
PATCH /user/api-key/me
Content-Type: application/json
```

**Body** (`UpdateUserDto`):
```json
{
  "username": "new_name",
  "email": "new@example.com",
  "bio": "..."
}
```

**curl:**
```bash
curl -k -X PATCH https://localhost:9000/nest/user/api-key/me \
  -H "x-api-key: <YOUR_API_KEY>" \
  -H "Content-Type: application/json" \
  -d '{"username":"new_name"}'
```

---

## 6. Upload Avatar (Current User)

Uses `PUT` (not `PATCH`) for the API-key variant.

```http
PUT /user/api-key/me/avatar
Content-Type: multipart/form-data
```

**Form field:** `file` — image file (png, jpg, jpeg, webp, gif; max **5 MB**).

**curl:**
```bash
curl -k -X PUT https://localhost:9000/nest/user/api-key/me/avatar \
  -H "x-api-key: <YOUR_API_KEY>" \
  -F "file=@/path/to/avatar.png"
```

---

## 7. Delete Avatar (Current User)

Resets the avatar to the default.

```http
DELETE /user/api-key/me/avatar
```

**curl:**
```bash
curl -k -X DELETE https://localhost:9000/nest/user/api-key/me/avatar \
  -H "x-api-key: <YOUR_API_KEY>"
```

---

## 8. Delete Current User Account (Self-Deletion)

Returns HTTP **200 OK** on success.

```http
DELETE /user/api-key/me
```

**curl:**
```bash
curl -k -X DELETE https://localhost:9000/nest/user/api-key/me \
  -H "x-api-key: <YOUR_API_KEY>"
```

---

## 9. Admin: Update User by ID

```http
PATCH /user/api-key/:id
Content-Type: application/json
```

**Body** (`UpdateUserDto`):
```json
{ "username": "updated", "email": "u@example.com" }
```

**curl:**
```bash
curl -k -X PATCH https://localhost:9000/nest/user/api-key/12345 \
  -H "x-api-key: <YOUR_API_KEY>" \
  -H "Content-Type: application/json" \
  -d '{"username":"updated"}'
```

---

## 10. Admin: Change User Role by ID

The acting admin is inferred from the API key's `referenceId`.

```http
PATCH /user/api-key/:id/role
Content-Type: application/json
```

**Body** (`UpdateUserRoleDto`):
```json
{ "role": "ADMIN" }
```

**curl:**
```bash
curl -k -X PATCH https://localhost:9000/nest/user/api-key/12345/role \
  -H "x-api-key: <YOUR_API_KEY>" \
  -H "Content-Type: application/json" \
  -d '{"role":"ADMIN"}'
```

---

## 11. Admin: Delete User by ID

Returns HTTP **200 OK**.

```http
DELETE /user/api-key/:id
```

**curl:**
```bash
curl -k -X DELETE https://localhost:9000/nest/user/api-key/12345 \
  -H "x-api-key: <YOUR_API_KEY>"
```

---

## 12. Get Public Profile by ID

```http
GET /user/api-key/:id
```

**curl:**
```bash
curl -k -X GET https://localhost:9000/nest/user/api-key/12345 \
  -H "x-api-key: <YOUR_API_KEY>"
```

---

## Quick Reference Table

| # | Method | Path | Purpose | Auth context |
|---|--------|------|---------|--------------|
| 1 | GET | `/user/api-key` | List all users | Admin |
| 2 | GET | `/user/api-key/count` | Count users | Admin |
| 3 | GET | `/user/api-key/search` | Search users | Any user |
| 4 | GET | `/user/api-key/me` | Get current user | Any user |
| 5 | PATCH | `/user/api-key/me` | Update current user | Any user |
| 6 | PUT | `/user/api-key/me/avatar` | Upload avatar | Any user |
| 7 | DELETE | `/user/api-key/me/avatar` | Delete avatar | Any user |
| 8 | DELETE | `/user/api-key/me` | Delete own account | Any user |
| 9 | PATCH | `/user/api-key/:id` | Update user by ID | Admin |
| 10 | PATCH | `/user/api-key/:id/role` | Change user role | Admin |
| 11 | DELETE | `/user/api-key/:id` | Delete user by ID | Admin |
| 12 | GET | `/user/api-key/:id` | Get public profile | Any user |

---

## Notes on Route Ordering

The controller declares literal routes **before** parameterized `:id` routes (e.g., `count`, `search`, `me` come before `:id`), which prevents `:id` from swallowing them. The same convention is applied for the `api-key` prefix: `/user/api-key/count`, `/user/api-key/search`, `/user/api-key/me` are declared before `/user/api-key/:id`.

## Example Node.js (fetch) Usage

```js
const BASE = "https://localhost:9000/nest";
const API_KEY = process.env.API_KEY;

const res = await fetch(`${BASE}/user/api-key/me`, {
  headers: { "x-api-key": API_KEY },
});
const me = await res.json();
console.log(me);
```

> For `localhost` self-signed certs in Node, set `NODE_TLS_REJECT_UNAUTHORIZED=0` **only in development**, or pass a custom `https.Agent({ rejectUnauthorized: false })` to `fetch` via a library like `undici` / `node-fetch`.