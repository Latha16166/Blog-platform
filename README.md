# BlogSpace — Full-Stack Blog Platform with Comments

A complete blogging platform: user auth, posts (CRUD), and comments, built with the MERN stack (MongoDB, Express, React, Node.js).

## Project Structure
```
blog-platform/
├── backend/          Node.js + Express + MongoDB REST API
│   ├── config/db.js
│   ├── models/       User, Post, Comment (Mongoose schemas)
│   ├── routes/       auth, posts, comments
│   ├── middleware/   JWT auth
│   └── server.js
└── frontend/         React (Create React App)
    └── src/
        ├── api/client.js      Axios + JWT interceptors
        ├── context/           Auth context (global user state)
        ├── components/        Navbar, PrivateRoute
        └── pages/              Feed, Login, Register, PostForm, PostDetail
```

## Setup

### 1. Backend
```bash
cd backend
npm install
cp .env.example .env       # then edit MONGODB_URI and JWT_SECRET
npm run dev                 # starts on http://localhost:5000
```
You'll need a MongoDB instance — either local (`mongodb://localhost:27017/blogplatform`) or a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster.

### 2. Frontend
```bash
cd frontend
npm install
cp .env.example .env       # points to http://localhost:5000/api by default
npm start                   # starts on http://localhost:3000
```

## API Endpoints

| Method | Endpoint                    | Auth | Description              |
|--------|------------------------------|------|---------------------------|
| POST   | /api/auth/register          | No   | Create account            |
| POST   | /api/auth/login             | No   | Log in, get JWT           |
| GET    | /api/auth/me                | Yes  | Get current user          |
| PUT    | /api/auth/me                | Yes  | Update profile            |
| GET    | /api/posts                  | No   | List posts (paginated, searchable) |
| GET    | /api/posts/:id              | No   | Get single post           |
| POST   | /api/posts                  | Yes  | Create post                |
| PUT    | /api/posts/:id              | Yes  | Edit post (owner only)    |
| DELETE | /api/posts/:id              | Yes  | Delete post (owner only)  |
| POST   | /api/posts/:id/like         | Yes  | Toggle like                |
| GET    | /api/comments/post/:postId  | No   | List comments for a post  |
| POST   | /api/comments/post/:postId  | Yes  | Add comment                 |
| PUT    | /api/comments/:id           | Yes  | Edit comment (owner only) |
| DELETE | /api/comments/:id           | Yes  | Delete (owner or post author) |

## Features
- JWT-based authentication with bcrypt password hashing
- Full CRUD on blog posts with ownership checks
- Nested comments with delete permissions (comment author or post author)
- Like/unlike posts
- Search posts by title/content
- Tagging system
- Pagination
- Input validation (express-validator) on the backend, inline validation on the frontend

## Deployment Notes
- **Backend**: Deploy to Render, Railway, or Heroku. Set env vars (`MONGODB_URI`, `JWT_SECRET`, `CLIENT_URL`) in the dashboard.
- **Frontend**: Deploy to Vercel or Netlify. Set `REACT_APP_API_URL` to your deployed backend URL.
- **Database**: Use MongoDB Atlas free tier for production.
