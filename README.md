# ExploreX — AI Travel Planner & Booking Platform

A full-stack MERN application with AI-powered trip planning, hotel booking, travel blogs, wishlist, real-time chat support, and an admin dashboard.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Tailwind CSS, React Router v6, Axios, Framer Motion, Redux Toolkit |
| Backend | Node.js, Express.js (MVC) |
| Database | MongoDB Atlas + Mongoose |
| Auth | JWT + bcrypt, Google OAuth (optional) |
| Real-time | Socket.io |
| AI | Google Gemini API / Anthropic Claude API |
| Maps | Google Maps API / Mapbox |
| Images | Cloudinary |
| Payments | Razorpay |
| Cache | Redis |
| Deploy | Vercel (frontend), Render/AWS (backend) |

---

## Quick Start

### Prerequisites
- Node.js >= 18
- MongoDB Atlas URI
- API keys (see `.env.example`)

### 1. Clone & Install
```bash
git clone https://github.com/your-org/explorex.git
cd explorex

# Install server deps
cd server && npm install

# Install client deps
cd ../client && npm install
```

### 2. Configure Environment
```bash
# Server
cp server/.env.example server/.env
# Fill in all values in server/.env

# Client
cp client/.env.example client/.env
# Fill in VITE_API_URL and VITE_GOOGLE_MAPS_KEY
```

### 3. Run Locally
```bash
# Terminal 1 — Backend
cd server && npm run dev

# Terminal 2 — Frontend
cd client && npm run dev
```

Backend runs on `http://localhost:5000`  
Frontend runs on `http://localhost:5173`

---

## Project Structure

```
explorex/
├── client/                   # React frontend
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   │   ├── common/       # Navbar, Footer, Loader, Modal…
│   │   │   ├── auth/         # Login, Signup forms
│   │   │   ├── destination/  # DestinationCard, DestinationFilter
│   │   │   ├── hotel/        # HotelCard, BookingForm
│   │   │   ├── blog/         # BlogCard, RichEditor
│   │   │   ├── planner/      # AI form + Itinerary display
│   │   │   └── admin/        # Dashboard widgets
│   │   ├── pages/            # Route-level pages
│   │   ├── redux/            # Redux Toolkit store + slices
│   │   ├── services/         # Axios API service layer
│   │   ├── hooks/            # Custom React hooks
│   │   └── utils/            # Helpers, constants, validators
│   └── public/
│
└── server/                   # Express backend
    ├── controllers/          # Business logic per resource
    ├── routes/               # Express routers
    ├── models/               # Mongoose schemas
    ├── middleware/           # Auth, error, rate-limit, upload
    ├── config/               # DB, Redis, Cloudinary config
    ├── ai/                   # Gemini / Claude AI service
    ├── sockets/              # Socket.io handlers
    └── utils/                # Logger, email, helpers
```

---

## API Overview

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login, returns JWT |
| POST | `/api/auth/logout` | Invalidate token |
| GET | `/api/auth/me` | Get current user |
| POST | `/api/auth/google` | Google OAuth |

### Destinations
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/destinations` | List (query: search, type, budget) |
| GET | `/api/destinations/:id` | Single destination |
| POST | `/api/destinations` | Create (admin) |
| PUT | `/api/destinations/:id` | Update (admin) |
| DELETE | `/api/destinations/:id` | Delete (admin) |

### Hotels
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/hotels` | List with filters |
| GET | `/api/hotels/:id` | Single hotel |
| POST | `/api/hotels` | Create (admin) |
| PUT | `/api/hotels/:id` | Update (admin) |

### Bookings
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/bookings` | Create booking |
| GET | `/api/bookings/my` | User's bookings |
| GET | `/api/bookings/:id` | Single booking |
| PUT | `/api/bookings/:id/cancel` | Cancel booking |

### AI Planner
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/ai/itinerary` | Generate AI itinerary |
| GET | `/api/ai/recommendations` | Personalised recommendations |

### Blogs
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/blogs` | List blogs |
| POST | `/api/blogs` | Create blog (auth) |
| PUT | `/api/blogs/:id` | Update blog (author) |
| DELETE | `/api/blogs/:id` | Delete blog |
| POST | `/api/blogs/:id/like` | Toggle like |
| POST | `/api/blogs/:id/comments` | Add comment |

### Wishlist
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/wishlist` | Get user wishlist |
| POST | `/api/wishlist` | Add item |
| DELETE | `/api/wishlist/:id` | Remove item |

### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/stats` | Dashboard analytics |
| GET | `/api/admin/users` | Manage users |
| PUT | `/api/admin/users/:id` | Update user role |

---

## Environment Variables

See `server/.env.example` and `client/.env.example` for full list.

---

## Deployment

### Frontend (Vercel)
```bash
cd client
npm run build
# Push to GitHub → connect repo in Vercel dashboard
# Set VITE_API_URL to your Render/AWS backend URL
```

### Backend (Render)
1. Create a new Web Service on Render
2. Set build command: `npm install`
3. Set start command: `npm start`
4. Add all env vars from `server/.env.example`

### Database (MongoDB Atlas)
1. Create a free cluster on atlas.mongodb.com
2. Whitelist `0.0.0.0/0` or your server IP
3. Copy the connection string to `MONGODB_URI`

---

## Features Checklist

- [x] JWT Authentication
- [x] Google OAuth
- [x] Destination Explorer with filters
- [x] Hotel & Package Booking
- [x] Razorpay Payment Integration
- [x] AI Trip Planner (Gemini API)
- [x] Personalised Recommendations
- [x] Wishlist System
- [x] Travel Blog with Rich Text Editor
- [x] Like / Comment System
- [x] Star Ratings & Reviews
- [x] Interactive Maps (Google Maps)
- [x] Real-time Chat Support (Socket.io)
- [x] Push Notifications
- [x] Admin Dashboard
- [x] Analytics Dashboard
- [x] Dark / Light Mode
- [x] Redis Caching
- [x] Docker Support
- [x] CI/CD Pipeline (GitHub Actions)
- [x] SEO Optimisation
- [x] Mobile Responsive

---

## License
MIT
