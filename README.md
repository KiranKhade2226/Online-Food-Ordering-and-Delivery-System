# Online Food Ordering and Delivery System

Full-stack food ordering platform built with React, Node.js/Express, MongoDB, Socket.io, and Razorpay.

## What is in the project now

- JWT authentication with protected routes and role-based access.
- Canonical roles: `customer`, `restaurantOwner`, `deliveryPartner`, `admin`.
- Customer browsing, cart, orders, and Razorpay checkout.
- Owner dashboard with menu management, prep time editing, and incoming order handling.
- Delivery dashboard with available jobs, accept/reject flow, and delivery status updates.
- Admin dashboard with user management, restaurant approvals, order tables, and revenue charts.
- Socket.io integration for live order/payment updates.

## File Map

- [backend/src/app.js](backend/src/app.js) - Express app, middleware, and route mounting.
- [backend/src/server.js](backend/src/server.js) - Starts the HTTP server, MongoDB, and Socket.io.
- [backend/src/middleware/authMiddleware.js](backend/src/middleware/authMiddleware.js) - `verifyJWT` and role authorization.
- [backend/src/utils/role.js](backend/src/utils/role.js) - Canonical role normalization helpers.
- [backend/src/controllers/authController.js](backend/src/controllers/authController.js) - Register, login, session, password reset.
- [backend/src/controllers/orderController.js](backend/src/controllers/orderController.js) - Customer order creation and order queries.
- [backend/src/controllers/paymentController.js](backend/src/controllers/paymentController.js) - Razorpay order creation and verification.
- [backend/src/controllers/adminController.js](backend/src/controllers/adminController.js) - Admin users, restaurants, orders, and stats.
- [backend/src/controllers/ownerController.js](backend/src/controllers/ownerController.js) - Owner menu and order management.
- [backend/src/controllers/deliveryController.js](backend/src/controllers/deliveryController.js) - Delivery partner workflow.
- [backend/src/controllers/restaurantController.js](backend/src/controllers/restaurantController.js) - Restaurant discovery and menu CRUD.
- [backend/src/routes/authRoutes.js](backend/src/routes/authRoutes.js) - Auth endpoints.
- [backend/src/routes/orderRoutes.js](backend/src/routes/orderRoutes.js) - Order endpoints.
- [backend/src/routes/paymentRoutes.js](backend/src/routes/paymentRoutes.js) - Razorpay endpoints.
- [backend/src/routes/adminRoutes.js](backend/src/routes/adminRoutes.js) - Admin endpoints.
- [backend/src/routes/ownerRoutes.js](backend/src/routes/ownerRoutes.js) - Owner endpoints.
- [backend/src/routes/deliveryRoutes.js](backend/src/routes/deliveryRoutes.js) - Delivery endpoints.
- [backend/src/models/User.js](backend/src/models/User.js) - User schema.
- [backend/src/models/Restaurant.js](backend/src/models/Restaurant.js) - Restaurant schema.
- [backend/src/models/Order.js](backend/src/models/Order.js) - Order schema.
- [backend/src/models/Payment.js](backend/src/models/Payment.js) - Payment schema.
- [backend/scripts/seed-admin.js](backend/scripts/seed-admin.js) - Seeds the admin user.
- [backend/scripts/seed-demo.js](backend/scripts/seed-demo.js) - Seeds admin, customer, owner, and delivery demo users.
- [backend/scripts/seed-sample.js](backend/scripts/seed-sample.js) - Seeds the sample restaurant and menu item.
- [backend/scripts/normalize-roles.js](backend/scripts/normalize-roles.js) - Migrates legacy `owner` and `delivery` roles.
- [frontend/src/App.jsx](frontend/src/App.jsx) - App routes.
- [frontend/src/components/AppShell.jsx](frontend/src/components/AppShell.jsx) - Authenticated layout and navigation.
- [frontend/src/components/ProtectedRoute.jsx](frontend/src/components/ProtectedRoute.jsx) - Route guard.
- [frontend/src/context/AuthContext.jsx](frontend/src/context/AuthContext.jsx) - Auth state and API methods.
- [frontend/src/context/CartContext.jsx](frontend/src/context/CartContext.jsx) - Cart state.
- [frontend/src/context/SocketContext.jsx](frontend/src/context/SocketContext.jsx) - Socket client.
- [frontend/src/api/client.js](frontend/src/api/client.js) - Shared Axios client.
- [frontend/src/api/paymentApi.js](frontend/src/api/paymentApi.js) - Razorpay API wrapper.
- [frontend/src/api/ownerApi.js](frontend/src/api/ownerApi.js) - Owner dashboard API wrapper.
- [frontend/src/api/deliveryApi.js](frontend/src/api/deliveryApi.js) - Delivery dashboard API wrapper.
- [frontend/src/api/adminApi.js](frontend/src/api/adminApi.js) - Admin dashboard API wrapper.
- [frontend/src/pages/customer/CartPage.jsx](frontend/src/pages/customer/CartPage.jsx) - Razorpay checkout flow.
- [frontend/src/pages/customer/OrdersPage.jsx](frontend/src/pages/customer/OrdersPage.jsx) - Customer order history.
- [frontend/src/pages/customer/CustomerDashboard.jsx](frontend/src/pages/customer/CustomerDashboard.jsx) - Nearby restaurant view.
- [frontend/src/pages/owner/OwnerDashboard.jsx](frontend/src/pages/owner/OwnerDashboard.jsx) - Owner workspace.
- [frontend/src/pages/delivery/DeliveryDashboard.jsx](frontend/src/pages/delivery/DeliveryDashboard.jsx) - Delivery workspace.
- [frontend/src/pages/admin/AdminDashboard.jsx](frontend/src/pages/admin/AdminDashboard.jsx) - Admin command center.
- [frontend/src/components/admin/TrendChart.jsx](frontend/src/components/admin/TrendChart.jsx) - Recharts analytics chart.

## Backend Setup

1. Install dependencies.

```bash
cd backend
npm install
```

2. Copy the example env file and configure it.

```bash
copy .env.example .env
```

3. Start MongoDB locally, or point `MONGO_URI` to Atlas.

4. Seed demo users and sample restaurant data.

```bash
npm run seed:demo
npm run seed:sample
```

5. Start the backend.

```bash
npm run dev
```

## Frontend Setup

1. Install dependencies.

```bash
cd frontend
npm install
```

2. Copy the frontend env example.

```bash
copy .env.example .env
```

3. Start the app.

```bash
npm run dev
```

## Environment Variables

### Backend

- `MONGO_URI` - MongoDB connection string.
- `JWT_SECRET` - JWT signing secret.
- `CLIENT_URL` - Frontend origin for CORS and cookies.
- `RAZORPAY_KEY_ID` - Razorpay public key ID.
- `RAZORPAY_KEY_SECRET` - Razorpay secret key.

### Frontend

- `VITE_API_BASE_URL` - Backend API base URL.
- `VITE_SOCKET_URL` - Socket.io server URL.
- `VITE_RAZORPAY_KEY_ID` - Razorpay public key ID for checkout.

## Seed Data

- Admin: `admin@example.com` / `Admin@12345`
- Customer: `customer1@example.com` / `Customer@12345`
- Restaurant owner: `owner@example.com` / `Owner@12345`
- Delivery partner: `delivery@example.com` / `Delivery@12345`

## How to Test

### Admin Flow

1. Log in as `admin@example.com`.
2. Open `/dashboard/admin`.
3. Review users, restaurants, and orders.
4. Approve or reject restaurants.
5. Check the Recharts analytics card for orders and revenue.

### Customer Flow

1. Log in as `customer1@example.com`.
2. Open `/restaurants` or `/dashboard/customer`.
3. Open a menu and add items to the cart.
4. Click checkout and complete the Razorpay flow.
5. Check `/orders` for payment and order status updates.

### Owner Flow

1. Log in as `owner@example.com`.
2. Open `/dashboard/owner`.
3. Add, edit, or delete menu items.
4. Update preparation time.
5. Accept, reject, or update incoming order status.

### Delivery Flow

1. Log in as `delivery@example.com`.
2. Open `/dashboard/delivery`.
3. Accept available deliveries.
4. Update status to `On The Way` and `Delivered`.

### Payment Testing

1. Add Razorpay keys to both env files.
2. Restart backend and frontend.
3. Create a cart order and open checkout.
4. Confirm the payment verification request returns success and the order shows `Paid`.

## Notes

- Run `npm run roles:normalize` in the backend if you have older `owner` or `delivery` values stored in MongoDB.
- Use `npm run seed:demo` to recreate the standard demo accounts.
- The frontend now uses a chart library and a real Razorpay checkout script loader.# Online Food Ordering and Delivery System

Full-stack starter for a role-based food ordering platform using React, Node.js, MongoDB, Socket.io, and Razorpay.

## Folder Structure

```text
food-ordering/
├─ backend/
│  ├─ src/
│  │  ├─ config/
│  │  ├─ controllers/
│  │  ├─ middleware/
│  │  ├─ models/
│  │  ├─ routes/
│  │  ├─ services/
│  │  ├─ utils/
│  │  ├─ app.js
│  │  └─ server.js
│  └─ package.json
├─ frontend/
│  ├─ src/
│  │  ├─ api/
│  │  ├─ components/
│  │  ├─ context/
│  │  ├─ pages/
│  │  └─ styles/
│  └─ package.json
├─ package.json
└─ README.md
```

## Backend Setup

1. Copy `backend/.env.example` to `backend/.env` and fill in the values.
2. Install dependencies inside `backend`.
3. Start the API server.

```bash
cd backend
npm install
npm run dev
```

### Backend Architecture

- `src/app.js` configures Express, security middleware, rate limiting, routes, and error handlers.
- `src/server.js` connects MongoDB, boots HTTP, and initializes Socket.io.
- `src/models/` holds the Mongoose schemas for `User`, `Restaurant`, `FoodItem`, `Order`, `Cart`, `Review`, `Coupon`, and `Payment`.
- `src/controllers/` contains the business logic for auth, restaurants, orders, cart, reviews, coupons, payments, and admin reporting.
- `src/middleware/authMiddleware.js` enforces JWT protection and role-based authorization.

### Authentication Flow

- `POST /api/auth/register` creates the user and issues a JWT.
- Public registration is limited to `customer`, `owner`, and `delivery`; create admin accounts separately.
- `POST /api/auth/login` verifies credentials and issues a JWT.
- `POST /api/auth/forgot-password` generates and emails an OTP when SMTP is configured.
- `POST /api/auth/reset-password` validates the OTP and updates the password.
- `GET /api/auth/me` returns the current authenticated user.

### Core API Routes

- `GET /api/restaurants/nearby` GPS-based restaurant discovery.
- `POST /api/restaurants` restaurant registration for owners.
- `POST /api/food-items` menu item creation.
- `POST /api/orders` order creation from cart.
- `PATCH /api/orders/:id/status` live order status updates.
- `POST /api/payments/create-order` Razorpay order creation.
- `POST /api/payments/verify` Razorpay payment verification.
- `GET /api/admin/stats` admin analytics summary.

### Socket.io Events

- `join-order-room`
- `join-user-room`
- `order-created`
- `order-updated`
- `payment-updated`
- `notification`

## Frontend Setup

1. Copy `frontend/.env.example` to `frontend/.env` and configure the API URLs.
2. Install dependencies inside `frontend`.
3. Start the React app.

```bash
cd frontend
npm install
npm run dev
```

### Frontend Structure

- `src/context/AuthContext.jsx` manages login, registration, user persistence, and logout.
- `src/context/CartContext.jsx` wraps cart API calls.
- `src/context/SocketContext.jsx` handles Socket.io connectivity.
- `src/components/AppShell.jsx` provides the authenticated layout and navigation.
- `src/pages/` contains the login, forgot password, and role dashboards.

### Sample UI Components

- Login page
- Customer dashboard
- Cart page
- Orders page
- Restaurant owner dashboard
- Delivery partner dashboard
- Admin dashboard

## Razorpay Integration

1. Create a Razorpay order on the backend with `POST /api/payments/create-order`.
2. Pass the order details to the frontend checkout flow.
3. Verify the signature with `POST /api/payments/verify` after payment completion.
4. Mark the payment as `paid` and update the associated order.

## Deployment

### Backend on Render

1. Create a new Render Web Service from the `backend` folder.
2. Set the build command to `npm install`.
3. Set the start command to `npm start`.
4. Add environment variables from `backend/.env.example`.
5. Point `MONGO_URI` to a MongoDB Atlas cluster.
6. Set `CLIENT_URL` to the deployed Vercel frontend URL.

### Frontend on Vercel

1. Import the repository into Vercel.
2. Set the root directory to `frontend`.
3. Add `VITE_API_BASE_URL` and `VITE_SOCKET_URL` as environment variables.
4. Build command: `npm run build`.
5. Output directory: `dist`.
6. Deploy and update the backend `CLIENT_URL` to match the Vercel URL.

### Production Checklist

- Use a strong `JWT_SECRET`.
- Restrict CORS to the deployed frontend domain.
- Configure SMTP for OTP-based password resets.
- Configure Razorpay live keys for production.
- Make sure MongoDB indexes are created before launch.

## Notes

- This is a production-ready starter with the full project structure and working foundations.
- You can extend the controllers with stricter validation, pagination, and richer analytics as the product grows.
