# ANTERAJA MAA — AUTHENTICATION & TOKEN PROPAGATION FLOW

Analisis mekanisme otentikasi Single Sign-On (SSO) Central Authentication Service (CAS) Anteraja dan propagasi token Bearer JWT ke seluruh subsistem gateway.

---

## 1. SSO CAS LOGIN FLOW

```text
[Frontend / Client]
        │
        ▼ 1. POST /api/auth/login { username, password }
[Next.js Backend Server]
        │
        ▼ 2. GET https://cas.anteraja.id/cas/login?isapp=true&acctype=emp
[Anteraja CAS SSO Engine]
        │
        ▲ 3. Returns HTTP Headers: lt (login ticket) & execution tokens + CAS Session Cookie
[Next.js Backend Server]
        │
        ▼ 4. POST https://cas.anteraja.id/cas/login (Form URL-Encoded: username, password, lt, execution)
[Anteraja CAS SSO Engine]
        │
        ▲ 5. Validates Staff Credentials (NIA 50004786) -> Issues Bearer JWT & Agent Metadata
[Next.js Backend Server]
        │
        ▼ 6. Encrypts Iron Session Cookie with HttpOnly, SameSite=Lax, Secure flags
[Frontend / Client]
        │
        ▲ 7. Authenticated User Profile (flagship Kuningan City Lt. 2 / District 31.74.02)
```

---

## 2. UPSTREAM TOKEN INJECTION

Setiap pemanggilan API ke `https://api.anteraja.id/*` secara otomatis menyuntikkan header otentikasi wajib:
```http
token: <JWT_ACCESS_TOKEN>
Authorization: Bearer <JWT_ACCESS_TOKEN>
appKey: MAA
appSecret: santuy
deviceId: b6a8a44b-4c4f-4d43-a6cf-82e7b512e091
User-Agent: okhttp/4.9.0
Content-Type: application/json
```
