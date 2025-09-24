# {Feature Name} — Architecture

## 1. Purpose
Short: describe the core responsibility and why this design was chosen.

## 2. High-level overview
- Components:
  - **Frontend (optional):** UI components, forms, client-side validation, API client.
  - **Backend (optional):** API endpoints, business logic services, DB models, auth middleware.
  - **Docs:** diagrams and process flows inside `docs/flow.png`.

## 3. Components & responsibilities
| Component | Responsibility |
|---|---|
| API (backend) | Exposes REST/HTTP or GraphQL endpoints for clients |
| Service layer | Core business logic, validation, orchestration |
| Data layer | DB models, ORMs, migrations |
| Client (frontend) | UI, state management, calling backend APIs |
| Tests | Unit, integration, e2e (minimal) |

## 4. Data flow (simple ASCII diagram)
User (browser) ---> FE (optional) ---> API Gateway (if any) ---> Backend endpoints ---> Database

### Typical request flow (example)
1. User clicks submit in FE form.
2. FE validates client-side and sends `POST /api/{feature}` with payload.
3. Backend validates payload, applies business logic, writes to DB.
4. Backend responds with 2xx and created resource or error.
5. FE updates UI and shows success/error to user.

## 5. API Contracts
Document important endpoints and payloads in `docs/API.md`.

## 6. Data Model
Document database model in `docs/API.md`.

## 7. Data model (example)
```sql
Table: user
- id: uuid (PK)
- firstname: varchar
- lastname: varchar
- email: varchar
- created_at: timestamp
- updated_at: timestamp
```
