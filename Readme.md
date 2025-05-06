# 👨‍💻 Codemate - Connect with Coders

Codemate is a production-grade social media platform built using the MERN stack, designed to help developers connect, collaborate, and communicate. It includes authentication, real-time chat, reminders, notifications, and payment integration — all deployed securely using cloud infrastructure and modern DevOps practices.

---

## 🌐 Live Site

🔗 [https://codemate.tech](https://codemate.tech)

---

## 📌 Features

- 🔐 **JWT Authentication** with secure login, signup, and logout
- 🛡️ **Security**: Rate-limiting, CAPTCHA, and route protection
- 💬 **Real-Time Chat** using Socket.IO for connected users
- 🤝 **Connection System**: Send and accept connection requests to chat
- 📅 **Daily Reminder Service** using `node-cron`, Redis & BullMQ to email users about pending requests
- 💳 **Razorpay Payment Integration** with Webhook-based order handling
- ✅ **API Unit Testing** using Vitest with 80%+ code coverage
- 🌍 **Production Deployment** on AWS EC2 with:
  - NGINX reverse proxy
  - SSL/TLS via OpenSSL & Cloudflare
  - Domain: [codemate.tech](https://codemate.tech)

---

## 🛠️ Tech Stack

| Layer           | Tech                                     |
| --------------- | ---------------------------------------- |
| Frontend        | React.js                                 |
| Backend         | Node.js, Express.js                      |
| Database        | MongoDB + Mongoose                       |
| Auth            | JWT, bcrypt, cookie-parser               |
| Real-time Comm. | Socket.IO                                |
| Job Queue       | BullMQ + Redis                           |
| Scheduler       | Node-Cron                                |
| Payment Gateway | Razorpay + Webhooks                      |
| Email Service   | Nodemailer                               |
| Security        | express-rate-limit, CAPTCHA (Cloudflare) |
| Testing         | Vitest                                   |
| Deployment      | AWS EC2, NGINX, Cloudflare SSL           |

---

## 📤 Hosting & DevOps Deployment

- 🚀 **Single EC2 Instance Deployment** on AWS with both frontend and backend hosted on same machine
- 🌐 **NGINX Reverse Proxy**: Routes `/api` to backend and serves React build for all other routes
- 🔒 **OpenSSL Certificates**: Self-signed SSL certificates configured for HTTPS using NGINX
- 🌩️ **Cloudflare Integration**:
  - Free SSL layer on top of server TLS
  - Managed DNS and CAPTCHA protection
- 🔁 **Webhook Handling**:
  - Razorpay webhooks for payment validation
  - Secure middleware validation of webhook signatures
- 📩 **Email Queue via Redis**:
  - Scalable queue-based email service using Redis + BullMQ
  - Handles retries and failure states
- 🧪 **Test Coverage + CI Ready**:
  - Codebase tested using Vitest
  - Configured for 80%+ coverage
  - Easy to plug into CI/CD pipelines
- 📆 **Job Scheduling via Node-Cron**:
  - Sends reminder emails every day at 9:30 AM
  - Runs as a background service

---

## 🔁 System Design Highlights

Codemate is designed with **modular, scalable, and production-grade architecture** in mind:

### 🔄 1. Queue-Based Email Notification System

- Uses **Redis + BullMQ** for background jobs
- Prevents API blocking and ensures delivery via retry attempts
- Emails include daily reminders about connection requests

### 💬 2. Real-Time Messaging with Socket.IO

- Two-way real-time connection using **WebSocket protocol**
- Chat room created dynamically based on approved connection
- Enables instant dev-to-dev communication

### 🧱 3. Scalable Architecture

- Backend follows **controller-service-repository pattern**
- Clear separation of concerns for maintainability
- Easily adaptable for microservices in future phases

### 🔐 4. Secure Authentication Flow

- JWT tokens are stored in **HTTP-only cookies**
- Login endpoint rate-limited to avoid brute-force attacks
- Signup integrated with CAPTCHA challenge (via Cloudflare)

### ⚙️ 5. Background Job Scheduling

- **Node-Cron** used to run daily jobs
- Integrates with BullMQ queue for processing tasks
- Lightweight but production-ready scheduler

### 🧪 6. API Testing & Coverage

- Every core route is covered by **Vitest unit tests**
- Can be extended with E2E and integration tests
- Ensures regression-proof development process

---

## 📃 API Endpoints

### 🔐 Auth Routes

```http
POST   /api/auth/login       // Login (with rate-limiting)
POST   /api/auth/signup      // Signup (with CAPTCHA)
POST   /api/auth/logout      // Logout (protected route)
```

### 🤝 Connection Routes

```
POST   /api/connection/send/:status/:toUserId       // Send connection request
POST   /api/connection/review/:status/:requestId    // Accept/Reject connection request
```

### 🧑‍🤝‍🧑 User Routes

```
GET    /api/user/feed                  // Get developer feed
GET    /api/user/chat/:targetUserId   // Get chat with user
GET    /api/user/requests/received    // Received connection requests
GET    /api/user/connections          // All approved connections
```

### 👤 Profile Routes

```
GET    /api/profile/view
PATCH  /api/profile/edit
DELETE /api/profile/delete
```

### 💰 Payment Routes

```
POST   /api/payment/create     // Create Razorpay order
POST   /api/payment/webhook    // Razorpay webhook handler
GET    /api/payment/verify     // Confirm payment
```

### ✅ Testing

- Unit tests for backend APIs using Vitest

- Achieves 80%+ code coverage

- Ensures robustness and catches edge cases
