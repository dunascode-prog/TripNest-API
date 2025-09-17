📌 **TripNest API**

TripNest is a RESTful API designed for managing tours, users, bookings, and reviews. It provides a complete backend solution for travel and adventure platforms, offering robust authentication, secure payments, and advanced data handling.

⚠️** Note:** This project is still under active development and not yet fully complete. Some features may be missing or subject to change.

🚀 **Features (Planned & Implemented)**

User Authentication & Authorization

Secure signup & login using JWT

Role-based access control (admin, guide, user)

Tour Management

Create, read, update, delete (CRUD) tours

Tour filtering, sorting, pagination

Advanced search with query parameters

User Management

Update user profiles & passwords

Upload and manage profile photos

Reviews & Ratings

Users can post reviews on tours

Average ratings automatically calculated per tour

Bookings & Payments (in progress)

Tour booking system (mock/Stripe integration planned)

Track and manage user bookings

Security Features

Data sanitization, rate limiting, and CORS

Password hashing and secure JWT tokens

API Documentation (planned)

Postman/Swagger docs for easy testing

**🛠️ Tech Stack**

Backend: Node.js, Express

Database: MongoDB with Mongoose ODM

Authentication: JWT & bcrypt

Utilities: Multer (file uploads), Nodemailer (emails), Stripe (optional payments)

**📂 Example Endpoints**

POST /api/v1/users/signup → Register new users

POST /api/v1/users/login → Authenticate users

GET /api/v1/tours → Get all tours

GET /api/v1/tours/:id → Get a specific tour

POST /api/v1/tours → Create a new tour (admin/guide only)

PATCH /api/v1/users/updateMe → Update current user details

POST /api/v1/bookings/checkout-session/:tourId → (in progress)
