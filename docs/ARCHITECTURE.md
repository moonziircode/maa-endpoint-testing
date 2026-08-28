# ANTERAJA MAA WEB ARCHITECTURE

## 1. High-Level Architecture Overview

```text
┌─────────────────────────────────────────────────────────┐
│                      CLIENT LAYER                       │
│     Next.js 14 Web UI (React + Tailwind + Lucide)       │
│     - Responsive Desktop Sidebar & Mobile Navigation    │
│     - Barcode / Camera / Manual Input Scanner           │
│     - Supabase Master District Autocomplete             │
│     - Real-Time QR Payment Renderer                     │
└────────────────────────────┬────────────────────────────┘
                             │ (JSON over HTTPS)
                             ▼
┌─────────────────────────────────────────────────────────┐
│                  BACKEND PROXY LAYER                    │
│           Next.js Edge / Node.js Server API             │
│  - HttpOnly Cookie Encrypted Session (AES-GCM / Jose)   │
│  - Anteraja CAS SSO Handshake Engine                    │
│  - Input Validation & Error Sanitization                │
│  - Authoritative Pricing & Payment Reconciler           │
└──────────────┬──────────────────────────┬───────────────┘
               │                          │
               ▼                          ▼
┌──────────────────────────────┐ ┌────────────────────────┐
│      ANTERAJA SERVICES       │ │    SUPABASE CLOUD      │
│  - cas.anteraja.id (SSO)     │ │ - public.districts     │
│  - api.anteraja.id (Core)    │ │   (6,545 records)      │
│    * /maa-task/order/*       │ │ - master-data bucket   │
│    * /maa-task/rates         │ │ - Audit logs & caching │
│    * /maa-task/promo/*       │ └────────────────────────┘
│    * /maa-task/payment/*     │
└──────────────────────────────┘
```

## 2. Security Boundaries & Zero-Trust Client
1. **Zero Secret Leakage:** The browser never receives the Anteraja CAS JWT token, TGC cookie, or Supabase Service Role Key.
2. **Encrypted Session Cookie:** The browser holds a signed and encrypted HttpOnly cookie containing the server session.
3. **Authoritative Billing:** The frontend cannot tamper with shipping rates or promo discounts. The backend independently validates all rate and dropoff requests against Anteraja and Bayaraja payment gateways.
