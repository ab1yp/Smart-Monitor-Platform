 # SMP — Smart Monitor Platform

> A full-stack monitoring platform for Split AC systems, built around device management, role-based access, current status snapshots, and structured time-series telemetry.

[![Angular](https://img.shields.io/badge/Angular-21-DD0031?logo=angular&logoColor=white)](https://angular.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-22-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-5-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Database-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)

---

## Overview

**SMP (Smart Monitor Platform)** is a full-stack monitoring application focused on **Split AC systems**.

The current version provides a structured foundation for:

- managing AC devices and ownership
- authenticating users with JWT access and refresh flows
- controlling device access with owner, admin, and member roles
- exposing the latest operational state through a dedicated `Status` snapshot
- storing historical measurements in separate time-series collections
- working with seeded telemetry data for development and demonstration

The project is intentionally modular so historical analytics, alerting, physical sensor integration, and maintenance intelligence can be added later without replacing the core data model.

---

## What the Current Version Implements

### Authentication

- User sign up and sign in
- JWT-based authentication
- Refresh-token workflow
- Protected Angular routes
- Authentication interceptor
- Logout
- Password reset flow

### Device Management

- Create devices
- View devices available to the authenticated user
- View a single device
- Update device name and description
- Delete a device and its associated data
- Device ownership
- Device member management

### Device Access Control

Each device can have multiple members with three supported roles:

```text
owner
admin
member
```

Authorization is enforced by the backend rather than relying only on frontend visibility.

### Current Status

Each device has one `Status` document containing the latest operational snapshot:

```text
online
compressor
roomTemperature
setpoint
compressorFrequency
power
current
internalTemperature
lastError
lastUpdated
```

This keeps fleet and device views lightweight while historical measurements remain in dedicated collections.

### Telemetry

The current data model supports:

```text
RoomTemperature
Setpoint
CompressorState
CompressorFrequency
Power
Current
InternalTemperature
Error
```

All telemetry records are linked to a device using:

```text
deviceId
timestamp
```

Internal temperature records additionally contain a sensor name:

```text
evaporator
condenser
discharge
```

---

## Architecture

```text
┌────────────────────────────────────────────┐
│                  Angular 21                │
│                                            │
│  Components → Services → HTTP → API       │
│  Guards / Interceptors / Typed Interfaces  │
└───────────────────────┬────────────────────┘
                        │
                        │ REST API
                        ▼
┌────────────────────────────────────────────┐
│              Node.js / Express 5           │
│                                            │
│ Authentication → Authorization → Resources │
└───────────────────────┬────────────────────┘
                        │
                        │ Mongoose
                        ▼
┌────────────────────────────────────────────┐
│                  MongoDB                   │
│                                            │
│ Users / Devices / Members / Status         │
│ Historical telemetry collections            │
└────────────────────────────────────────────┘
```

### Data model separation

```text
Device
  └── Identity, ownership, configuration

Status
  └── Latest operational snapshot

Telemetry collections
  └── Historical measurements

DeviceMember
  └── Device-level access control
```

---

## Project Structure

```text
smp/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── seed/
│   ├── .env.example
│   ├── package.json
│   └── server.js
│
├── frontend/
│   ├── src/
│   │   └── app/
│   │       ├── core/
│   │       ├── features/
│   │       ├── layouts/
│   │       └── shared/
│   └── package.json
│
├── README.md
└── LICENSE
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Angular 21 |
| Language | TypeScript 5.9 |
| Styling | Tailwind CSS 4 |
| State / HTTP | Angular services + RxJS |
| Backend | Node.js 22 + Express 5 |
| Database | MongoDB + Mongoose 9 |
| Authentication | JWT + refresh tokens |
| Password hashing | bcryptjs |
| Charts foundation | Chart.js + ng2-charts |

---

## API Surface

The project uses resource-specific endpoints rather than a generated OpenAPI layer.

### Authentication

```text
POST /api/auth/signin
POST /api/auth/signup
POST /api/auth/refresh
GET  /api/auth/logout
POST /api/auth/forgot_password
PUT  /api/auth/update_password
```

### Devices

```text
POST   /api/devices/createDevice
GET    /api/devices/getDevices
GET    /api/devices/getDevice/:deviceId
POST   /api/devices/updateDevice
DELETE /api/devices/deleteDevice/:deviceId
```

### Device Members

```text
POST   /api/devicemembers/createDeviceMember
GET    /api/devicemembers/getDeviceMembers/:deviceId
GET    /api/devicemembers/getDeviceMember/:deviceId
POST   /api/devicemembers/getSearchedDeviceMembers
PUT    /api/devicemembers/updateDeviceMember
DELETE /api/devicemembers/deleteDeviceMember
```

### Users

```text
GET  /api/users/getUser
POST /api/users/getUsers
GET  /api/users/getUserById/:userId
PUT  /api/users/updateUser
PUT  /api/users/deleteUser
```

Protected routes require the authentication middleware.

---

## Seed Dataset

The repository includes a development seed designed to create a realistic monitoring dataset.

### Default configuration

```text
Users:              12
Devices:            100
History:            30 days
Sampling interval:  15 minutes
Internal sensors:   3
```

The seed generates approximately:

```text
1,728,600 single-value telemetry records
864,300 internal-temperature records
100 current-status snapshots
+ generated AC error records
```

The dataset intentionally introduces different operating patterns, degradation, and occasional abnormal conditions so the application can be tested with non-trivial data.

### Demo credentials

```text
Email:    demo.user1@acmonitoring.com
Password: Password123!
```

All seeded users use the same demo password.

### Run the seed

Create a backend `.env` file from `.env.example`, then run:

```bash
cd backend
npm run seed
```

To clear previously generated seed data before inserting a new dataset:

```env
CLEAR_SEED_DATA=true
```

Then run:

```bash
npm run seed
```

---

## Environment Variables

Backend `.env`:

```env
MONGO_URL=mongodb://localhost:27017/smp
PORT=3000
JWT_SECRET=your-jwt-secret
REFRESH_SECRET=your-refresh-secret
FRONT_URL=http://localhost:4200
BACK_URL=http://localhost:3000
EMAIL=your-email
EMAIL_PASSWORD=your-password
FRONTEND_URL=http://localhost:4200
GEMINI_API_KEY=
CLEAR_SEED_DATA=false
```

Do not commit real credentials or production secrets.

Frontend environment files should point to the deployed API URL before production deployment.

---

## Local Development

### Requirements

- Node.js 22+
- npm
- MongoDB
- Angular CLI (optional; the project can use the local npm scripts)

### Backend

```bash
cd backend
npm install
npm run dev
```

The backend listens on the configured port, which defaults to:

```text
http://localhost:3000
```

The backend script uses Node's built-in watch mode for development.

### Frontend

Open a second terminal:

```bash
cd frontend
npm install
npm start
```

Angular runs on:

```text
http://localhost:4200
```

---

## Design Decisions

### Why a separate `Status` model?

Telemetry is historical data. A fleet dashboard needs the latest state without running multiple `findOne().sort({ timestamp: -1 })` queries for every device.

SMP therefore separates the concerns:

```text
Historical telemetry
        ↓
Dedicated time-series collections

Latest device state
        ↓
Status snapshot
```

The `Status` document is intended to be updated whenever new telemetry is ingested.

### Why separate telemetry collections?

Each measurement type has its own shape, validation, and index strategy. This keeps the current schema explicit and leaves room for different retention or aggregation strategies later.

### Why device-level RBAC?

Access is tied directly to the monitored resource. A user can own one device, administer another, and be a standard member of a third.

---

## Account Deletion Behavior

Deleting a user account performs two different actions:

### Devices owned by the user

The device and all associated records are deleted, including:

```text
Device
Status
DeviceMember
RoomTemperature
Setpoint
CompressorState
CompressorFrequency
Power
Current
InternalTemperature
Error
```

### Devices owned by other users

The device remains available to its owner. Only the deleted user's `DeviceMember` records are removed.

This prevents a member leaving the platform from deleting resources they do not own.

---

## Current Scope vs. Direction

The current release is a **monitoring foundation**. The following capabilities are planned rather than presented as completed functionality:

```text
[ ] Historical charts and analytics
[ ] Alert and anomaly workflows
[ ] Maintenance-oriented analysis
[ ] ESP32 / physical sensor integration
[ ] Predictive maintenance models
[ ] AI-assisted device summaries
[ ] Automated test suite
[ ] CI/CD pipeline
[ ] Production deployment
```

The distinction is intentional: the current implementation is documented separately from future product direction.

---

## Portfolio Context

SMP was built as a full-stack engineering project to demonstrate:

- Angular application architecture
- REST API design with Express
- MongoDB data modeling
- authentication and authorization
- device-level role management
- time-series telemetry modeling
- seeded development datasets
- separation between current state and historical data
- responsive product-oriented UI

The project is suitable as a **portfolio case study / MVP engineering project** rather than being presented as a production IoT platform.

---

## Author

**Abdulrahman P**

Full-Stack Developer · Software · AI & Technology

---

## License

MIT License. See [`LICENSE`](LICENSE) for details.
"# Smart-Monitor-Platform" 
