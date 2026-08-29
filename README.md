# 🍽️ Foodie Network

A modern social recipe sharing platform where food lovers discover, share, and save their favorite recipes. Built with a clean, minimalist UI inspired by Linear and Vercel.

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-20-339933?logo=node.js&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker&logoColor=white)

---

## ✨ Features

🍳 **Recipe Feed** — Browse recipes with category filters (Italian, Vegan, Dessert, Mexican, Asian, American, Mediterranean) with smooth viewport-triggered card animations

📝 **Create & Edit Recipes** — Share recipes with image upload from your device or URL, ingredients, step-by-step instructions, difficulty level, and category

📖 **Recipe Book** — Save favorite recipes and organize them into custom collections with a popover picker and inline collection creation

💬 **Comments** — Comment on recipes, like comments, and manage comments on your own posts

❤️ **Likes & Ratings** — Like recipes and rate them on a 5-star scale with optimistic UI updates

👤 **User Profiles** — View profiles with posted recipes, follower stats, and dynamically computed average ratings

🔍 **Search** — Search across recipes, users, and categories with instant results

📸 **Image Upload** — Upload photos directly from your device with drag & drop style upload zones (supports JPG, PNG, GIF, WebP up to 10MB)

🎨 **Modern UI** — Glassmorphism header, scroll-driven animations, smooth transitions, and a custom design system with CSS tokens

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| **React 19** | UI library with hooks & context API |
| **React Router v7** | Client-side routing & navigation |
| **Vite** | Build tool & dev server |
| **Tailwind CSS v4** | Utility-first styling with `@theme` tokens |
| **Framer Motion** | Scroll-driven animations & page transitions |

### Backend
| Technology | Purpose |
|---|---|
| **Node.js** | JavaScript runtime |
| **Express** | REST API framework |
| **MongoDB Atlas** | Cloud database (free tier) |
| **Mongoose** | ODM for schemas, validation & queries |
| **Multer** | Multipart file upload handling |

### DevOps
| Technology | Purpose |
|---|---|
| **Docker** | Containerized deployment |
| **Docker Compose** | Multi-service orchestration |
| **Nginx** | Production static file serving & reverse proxy |

---

## 🐳 Quick Start with Docker

```bash
git clone https://github.com/oriad6/Foodie-Network.git
cd Foodie-Network
```

Create `backend/.env` with your MongoDB connection string:
```
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/foodie-network
```

Run with Docker:
```bash
docker compose up --build
```

Open and start cooking! 🧑‍🍳

---

## 💻 Local Development

**Prerequisites:** Node.js v18+

```bash
# Install dependencies
cd backend && npm install
cd ../frontend && npm install

# Start backend (terminal 1)
cd backend && node server.js

# Start frontend (terminal 2)
cd frontend && npm run dev
```

### 🌱 Seed the Database

Populate the database with sample users, recipes, comments, and collections:

```bash
cd backend && node scripts/seed.js
```

---

## 📁 Project Structure

```
Foodie-Network/
├── 🐳 docker-compose.yml
│
├── 📦 backend/
│   ├── config/           # DB connection & constants
│   ├── controllers/      # Request handlers
│   ├── middleware/        # Auth & current user resolution
│   ├── models/           # Business logic & data access
│   ├── routes/           # API route definitions
│   ├── schemas/          # Mongoose schemas & indexes
│   ├── scripts/          # Database seeding
│   ├── Dockerfile
│   └── server.js
│
└── 🎨 frontend/
    ├── src/
    │   ├── components/   # React components
    │   ├── App.jsx       # Routing, layout & context
    │   ├── index.css     # Design system & tokens
    │   └── main.jsx      # Entry point
    ├── nginx.conf        # Production proxy config
    └── Dockerfile
```

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/posts` | Get all posts (optional `?category=` filter) |
| `GET` | `/api/posts/:id` | Get single post |
| `POST` | `/api/recipes` | Create a recipe |
| `PUT` | `/api/recipes/:id` | Update a recipe |
| `DELETE` | `/api/recipes/:id` | Delete a recipe |
| `PUT` | `/api/posts/:id/like` | Toggle like |
| `PUT` | `/api/posts/:id/rating` | Set rating |
| `GET` | `/api/posts/:id/comments` | Get comments |
| `POST` | `/api/posts/:id/comments` | Add comment |
| `DELETE` | `/api/comments/:id` | Delete comment |
| `PUT` | `/api/comments/:id/like` | Toggle comment like |
| `GET` | `/api/users/:id` | Get user profile |
| `GET` | `/api/recipe-book/saved` | Get saved recipes |
| `POST` | `/api/recipe-book/saved/:postId` | Save a recipe |
| `DELETE` | `/api/recipe-book/saved/:postId` | Unsave a recipe |
| `GET` | `/api/recipe-book/collections` | Get collections |
| `POST` | `/api/recipe-book/collections` | Create collection |
| `GET` | `/api/search?q=` | Search users, recipes & categories |
| `POST` | `/api/upload` | Upload an image |

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
