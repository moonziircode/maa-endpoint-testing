# AUTHENTICATION FLOW

```text
[User Form: NIA + Password]
            │
            ▼
[Our Backend Server]
  1. GET https://cas.anteraja.id/cas/login
     -> Extract execution token
  2. POST https://cas.anteraja.id/cas/login
     -> username={NIA}, password={PW}, execution={token}, _eventId=submit
     -> Captures TGC Session Cookie
  3. GET https://cas.anteraja.id/cas/login?service=https://api.anteraja.id/user/cas/login
     -> Follows redirect to capture Service Ticket: ST-xxxx-mt
  4. POST https://api.anteraja.id/user/cas/login (body: {"token": "ST-xxxx-mt"})
     -> Receives JWT Bearer Token & MaaUser profile
  5. Encrypts session and sets HttpOnly cookie to Browser
            │
            ▼
[Browser Authenticated]
```
