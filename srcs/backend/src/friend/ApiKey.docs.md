# Friend API — Remove a Friend

## Overview

The "remove a friend" (unfriend) operation transitions an **ACCEPTED** friendship
to a removed state. The caller must be a participant in the friendship.

Two routes are exposed:

| Method  | Path                          | Auth                     |
|---------|-------------------------------|--------------------------|
| `PATCH` | `/friend/:id/remove`          | Session (`AuthGuard`)    |
| `PATCH` | `/friend/api-key/:id/remove`  | API key (`ApiKeyGuard`)  |

> **Note:** `:id` is the **friendship id** — the primary key of the row in the
> `friendships` table — **not** the other user's id.

---

## Authentication

### Session-based routes

Authenticated via Better Auth session cookie. The `AuthGuard` reads the session
and attaches the current user to the request.

Required header:

```
Cookie: better-auth.session_token=<YOUR_SESSION_TOKEN>
```

### API-key routes

Authenticated via the `x-api-key` header. The `ApiKeyGuard` verifies the key
against Better Auth's API key plugin and attaches the key's owner
(`referenceId`) to the request.

Required header:

```
x-api-key: <YOUR_API_KEY>
```

---

## Removing a Friend

### Session-based

```bash
curl -X PATCH "http://localhost:3000/friend/FR_123/remove" \
  -H "Cookie: better-auth.session_token=YOUR_SESSION_TOKEN"
```

### API-key based

```bash
curl -X PATCH "http://localhost:3000/friend/api-key/FR_123/remove" \
  -H "x-api-key: YOUR_API_KEY"
```

### Verbose (for debugging)

```bash
curl -v -X PATCH "http://localhost:3000/friend/api-key/FR_123/remove" \
  -H "x-api-key: YOUR_API_KEY" \
  -H "Accept: application/json"
```

---

## Finding the Friendship ID

If you only know the **other user's id** and not the **friendship id**, look up
the friendship first:

```bash
curl "http://localhost:3000/friend/api-key/with/USER_456" \
  -H "x-api-key: YOUR_API_KEY"
```

The response contains the friendship object, including its `id`. Use that id in
the remove call:

```bash
curl -X PATCH "http://localhost:3000/friend/api-key/FR_123/remove" \
  -H "x-api-key: YOUR_API_KEY"
```

---

## Global Prefix

If a global route prefix was configured in `main.ts` via
`app.setGlobalPrefix(...)`, prepend it to every path.

Example — with a prefix of `api`:

```bash
curl -X PATCH "http://localhost:3000/api/friend/api-key/FR_123/remove" \
  -H "x-api-key: YOUR_API_KEY"
```

---

## Quick Reference

| Item             | Value                                             |
|------------------|---------------------------------------------------|
| Base URL         | `http://localhost:3000`                           |
| Route (session)  | `PATCH /friend/:id/remove`                        |
| Route (API key)  | `PATCH /friend/api-key/:id/remove`                |
| Session header   | `Cookie: better-auth.session_token=<token>`       |
| API-key header   | `x-api-key: <key>`                                |
| `:id` semantics  | Friendship id (not user id)                       |
| Success response | `200 OK`                                          |

---

## Optional: Remove by User ID

To avoid the two-step lookup, add a convenience endpoint that resolves the
friendship from the other user's id and removes it in one call.

### Controller

```typescript
@UseGuards(ApiKeyGuard)
@ApiSecurity('x-api-key')
@Delete('api-key/with/:userId')
@HttpCode(HttpStatus.OK)
@ApiOperation({ summary: '[API key] Remove the friendship with a given user' })
removeWithViaApiKey(
  @Req() req: Request,
  @Param('userId') otherUserId: string,
) {
  return this.friendService.removeByUserId(req.apiKey!.referenceId, otherUserId);
}
```

### Service

```typescript
async removeByUserId(userId: string, otherUserId: string) {
  const friendship = await this.findByUserId(userId, otherUserId);
  if (!friendship) {
    throw new NotFoundException('Friendship not found');
  }
  return this.removeFriend(userId, friendship.id);
}
```

### curl

```bash
curl -X DELETE "http://localhost:3000/friend/api-key/with/USER_456" \
  -H "x-api-key: YOUR_API_KEY"
```