# Coremart (Backend)

A production-oriented e-commerce backend system built with a backend-first approach, focusing on scalable architecture, clean modular design, and real-world engineering practices.


## Description

Coremart Backend powers the entire Coremart ecosystem, including the admin panel and user-facing frontend.

This project is designed to simulate a real-world backend system with:

* modular architecture
* secure authentication and session management
* scalable infrastructure (Redis, queues)
* production-ready deployment (Docker, VPS, Nginx, CI/CD)

The goal is not just functionality, but to demonstrate how modern backend systems are built, structured, and deployed in production environments.


## Installation

You can run this project using either a manual setup or Docker (recommended).


### Manual Setup

#### 1. Clone the repository

```
git clone https://github.com/core-stack-code/coremart-backend.git
cd coremart-backend
```

#### 2. Install dependencies

```
npm install
```

#### 3. Setup environment variables

Create a `.env` file using the provided `.env.example`:

#### 4. Setup PostgreSQL

* Install PostgreSQL locally or use a remote database
* Create a database
* Update `DATABASE_URL` in `.env`

#### 5. Setup Redis

Run Redis locally or via Docker:

```
docker run -d -p 6379:6379 redis:7
```

Or use a remote Redis provider and update `REDIS_URL`.

#### 6. Run database migrations

```
npx prisma migrate dev
```

#### 7. Start the server

```
npm run dev
```

---

### Docker Setup (Recommended)

This project includes full Docker support.

Run everything with:

```
docker compose up -d --build
```

This will start:

* API server
* PostgreSQL
* Redis
* Worker (BullMQ)


## Tech Stack and Libraries

* Node.js, Express.js, TypeScript
* PostgreSQL, Prisma ORM
* Redis, BullMQ
* JWT Authentication (Access + Refresh)
* Cloudinary (media storage)
* Docker, Nginx, GitHub Actions


## Features

* **JWT-based authentication** with access and refresh tokens, using httpOnly cookies and **session management** (tracking, rotation, revocation)
* **Product system** built on **variant and SKU architecture**, supporting flexible attributes (size, color, material) with **pricing, stock, and availability control**
* **Advanced product querying** with filtering, sorting, pagination, and **soft delete/activation handling**
* **Cart system** designed around SKUs, with quantity management and **validation against stock and inactive items**
* **Order and payment flow** with structured lifecycle, **payment session handling**, and **webhook-ready design**
* **Redis integration** for **caching** frequently accessed data and managing temporary data like OTP and **rate limiting**
* **Background job processing** using queues for async tasks such as **email handling, expiration, and cleanup**
* **Modular architecture** with clear separation of concerns (**controller, service, repository**) for scalability and maintainability
* **Production-ready setup** with **Dockerized services**, reverse proxy, and **CI/CD pipeline** for automated deployment


## Related Repositories

Admin Panel:
[https://github.com/core-stack-code/coremart-admin]()

Frontend (User):
[https://github.com/core-stack-code/coremart-frontend]()


## Author Note

This project was built with a strong focus on:

* real-world backend practices
* infrastructure awareness
* scalable architecture

It represents a production-style backend system suitable for learning, showcasing, and extending into real applications.
