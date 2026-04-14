# NOVA Air Solutions — Field Service Management App

A cross-platform mobile application built for a commercial HVAC company to modernize their field operations, technician scheduling, and customer communications. Developed and maintained as a solo contract project from the ground up.

---

## Features

- **AI-Powered Scheduling & Dispatch** — Integrated with the Anthropic Claude API to generate intelligent scheduling recommendations and reduce manual dispatch coordination
- **Job & Work Order Management** — Create, assign, and track field service jobs in real time
- **Technician Scheduling** — Manage technician availability, assignments, and dispatch
- **Customer Notifications** — Automated transactional emails via the Resend API
- **Address Validation** — Google Places API integration for accurate job site entry
- **Real-Time Data Sync** — Live updates across devices using Firestore
- **Authentication** — Secure role-based access via Firebase Auth
- **Serverless Backend** — Business logic handled through Firebase Cloud Functions

---

## Tech Stack

| Layer | Technology |
|---|---|
| Mobile App | React Native, TypeScript |
| Backend | Firebase Cloud Functions, Node.js |
| Database | Firestore (Firebase) |
| Auth | Firebase Authentication |
| AI / Scheduling | Anthropic Claude API |
| Email | Resend API |
| Address Lookup | Google Places API |
| Companion Website | Next.js, TypeScript |

---

## Architecture Overview

```
React Native App (iOS & Android)
        │
        ├── Firebase Auth (authentication)
        ├── Firestore (real-time database)
        └── Cloud Functions (serverless backend)
                ├── Anthropic Claude API (AI scheduling)
                ├── Resend API (customer emails)
                └── Google Places API (address validation)
```

---

## Project Context

This is a production application built under contract for NOVA Air Solution, a commercial HVAC company. All development — architecture, feature scoping, client requirements gathering, and deployment — was handled independently.

---

## Getting Started

> **Note:** This is a private client project. The repository is for portfolio/reference purposes. Environment variables and Firebase config are not included.

### Prerequisites

- Node.js >= 18
- React Native development environment ([React Native CLI Quickstart](https://reactnative.dev/docs/environment-setup))
- Firebase project with Firestore, Auth, and Cloud Functions enabled

### Installation

```bash
git clone https://github.com/marthbear/<repo-name>.git
cd <repo-name>
npm install
```

### Environment Variables

Create a `.env` file in the root with the following:

```
FIREBASE_API_KEY=
FIREBASE_AUTH_DOMAIN=
FIREBASE_PROJECT_ID=
ANTHROPIC_API_KEY=
RESEND_API_KEY=
GOOGLE_PLACES_API_KEY=
```

### Run

```bash
# iOS
npx react-native run-ios

# Android
npx react-native run-android
```

---

## Author

**Nicholas Larson**
[github.com/marthbear](https://github.com/marthbear) · [linkedin.com/in/nicholas-larson2002](https://linkedin.com/in/nicholas-larson2002)

