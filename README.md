# Foodie Network

A social recipe sharing platform where food lovers can discover, share, and save their favorite recipes.

## Features

- **Recipe Feed** — Browse recipes with category filters (Italian, Vegan, Dessert, Mexican, Asian, American, Mediterranean)
- **Create & Edit Recipes** — Share your own recipes with image upload or URL, ingredients, instructions, difficulty level, and category
- **Recipe Book** — Save your favorite recipes and organize them into custom collections
- **Comments** — Comment on recipes, like other people's comments, and manage comments on your own posts
- **Likes & Ratings** — Like recipes and rate them on a 5-star scale
- **User Profiles** — View user profiles with their posted recipes and stats
- **Search** — Search across recipes, users, and categories

## Tech Stack

**Frontend**
- React 19 with React Router v7
- Vite
- Tailwind CSS v4

**Backend**
- Node.js with Express
- Multer for image uploads
- In-memory mock data

## Getting Started

### Prerequisites

- Node.js (v18+)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/oriad6/Foodie-Network.git
   cd Foodie-Network
   ```

2. Install dependencies:
   ```bash
   cd backend && npm install
   cd ../frontend && npm install
   ```

3. Start the backend server:
   ```bash
   cd backend
   node server.js
   ```

4. In a separate terminal, start the frontend:
   ```bash
   cd frontend
   npm run dev
   ```

5. Open [http://localhost:5173](http://localhost:5173) in your browser.

## Project Structure

```
Foodie-Network/
├── backend/
│   ├── config/          # App constants
│   ├── controllers/     # Request handlers
│   ├── data/            # Mock data
│   ├── models/          # Business logic
│   ├── routes/          # API route definitions
│   └── server.js        # Express app entry point
│
└── frontend/
    └── src/
        ├── components/  # React components
        ├── App.jsx      # Routing & layout
        └── main.jsx     # Entry point
```
