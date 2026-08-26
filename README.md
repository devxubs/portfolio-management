# Portfolio Management System

A simple and modern portfolio management system for managing portfolio projects from an admin dashboard.

The system is built with a separate frontend and backend architecture:

```text
Frontend (React + Vite)
        ↓
Backend API (Node.js + Express)
        ↓
Supabase
   ├── PostgreSQL Database
   └── Storage
```

---

## Features

* View all portfolio projects
* Add new projects
* Edit existing projects
* Delete projects
* Upload project images
* Store project information in Supabase
* REST API based architecture
* Separate frontend and backend
* CORS configuration
* Environment-based configuration
* Production deployment support

---

## Project Structure

```text
portfolio-management/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── hooks/
│   │   └── App.jsx
│   │
│   ├── public/
│   ├── .env
│   ├── vite.config.js
│   └── package.json
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── supabase.js
│   │   │
│   │   ├── controllers/
│   │   │   └── project.controller.js
│   │   │
│   │   ├── routes/
│   │   │   └── project.routes.js
│   │   │
│   │   ├── services/
│   │   │   └── project.service.js
│   │   │
│   │   └── server.js
│   │
│   ├── .env
│   └── package.json
│
└── README.md
```

---

# Tech Stack

## Frontend

* React
* Vite
* JavaScript
* CSS / Tailwind CSS
* Fetch API

## Backend

* Node.js
* Express.js
* CORS
* REST API

## Database & Storage

* Supabase PostgreSQL
* Supabase Storage

## Deployment

* Frontend → Vercel
* Backend → Render
* Database & Storage → Supabase

---

# Environment Variables

## Frontend

Create:

```text
frontend/.env
```

For local development:

```env
VITE_API_URL=http://localhost:3000
```

For production:

```env
VITE_API_URL=https://your-backend.onrender.com
```

Use the API URL in your frontend:

```js
const response = await fetch(
  `${import.meta.env.VITE_API_URL}/api/projects`
);
```

---

# Backend Environment Variables

Create:

```text
backend/.env
```

Example:

```env
NODE_ENV=development

PORT=3000

FRONTEND_URL=http://localhost:5173

SUPABASE_URL=your_supabase_project_url

SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

SUPABASE_STORAGE_BUCKET=portfolio-projects

JWT_SECRET=your_secure_random_secret

JWT_EXPIRES_IN=7d
```

> Never expose `SUPABASE_SERVICE_ROLE_KEY` in the frontend.

---

# Supabase Setup

Create a Supabase project and configure:

```text
Database
Storage
```

The main project table can contain fields such as:

```text
projects
├── id
├── title
├── description
├── image
├── category
├── technologies
├── live_url
├── github_url
├── featured
├── created_at
└── updated_at
```

Create a storage bucket:

```text
portfolio-projects
```

This bucket can be used to store project images.

---

# API Endpoints

## Get Projects

```http
GET /api/projects
```

Returns all portfolio projects.

---

## Get Single Project

```http
GET /api/projects/:id
```

Returns a specific project.

---

## Create Project

```http
POST /api/projects
```

Creates a new portfolio project.

Example request:

```json
{
  "title": "Portfolio Website",
  "description": "A modern developer portfolio website.",
  "category": "Web Development",
  "technologies": [
    "React",
    "Node.js",
    "Supabase"
  ],
  "live_url": "https://example.com",
  "github_url": "https://github.com/example/project"
}
```

---

## Update Project

```http
PUT /api/projects/:id
```

Updates an existing project.

---

## Delete Project

```http
DELETE /api/projects/:id
```

Deletes a project.

---

# CORS Configuration

The backend must allow requests from the frontend.

Example:

```js
import cors from "cors";

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);
```

For local development:

```env
FRONTEND_URL=http://localhost:5173
```

For production:

```env
FRONTEND_URL=https://your-portfolio.vercel.app
```

---

# Local Development

## 1. Clone the Repository

```bash
git clone https://github.com/your-username/portfolio-management.git
```

Go to the project:

```bash
cd portfolio-management
```

---

## 2. Install Frontend Dependencies

```bash
cd frontend
npm install
```

Start frontend:

```bash
npm run dev
```

Frontend will normally run at:

```text
http://localhost:5173
```

---

## 3. Install Backend Dependencies

Open another terminal:

```bash
cd backend
npm install
```

Start backend:

```bash
npm run dev
```

Backend will run at:

```text
http://localhost:3000
```

---

# Development Architecture

```text
Browser
   │
   │ HTTP Request
   ▼
React + Vite
localhost:5173
   │
   │ /api/projects
   ▼
Express API
localhost:3000
   │
   ▼
Supabase
   │
   ├── PostgreSQL
   └── Storage
```

---

# Production Architecture

```text
User
 │
 ▼
Vercel
React Frontend
 │
 │ HTTPS API Request
 ▼
Render
Node.js + Express
 │
 ▼
Supabase
 ├── PostgreSQL
 └── Storage
```

---

# Deployment

## Frontend — Vercel

Deploy the `frontend` directory to Vercel.

Set the following environment variable:

```env
VITE_API_URL=https://your-backend.onrender.com
```

After adding or changing environment variables, redeploy the project.

---

## Backend — Render

Deploy the `backend` directory to Render.

Set these environment variables:

```env
NODE_ENV=production

FRONTEND_URL=https://your-portfolio.vercel.app

SUPABASE_URL=your_supabase_project_url

SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

SUPABASE_STORAGE_BUCKET=portfolio-projects

JWT_SECRET=your_secure_random_secret

JWT_EXPIRES_IN=7d
```

Use the Render-provided `PORT`:

```js
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

---

# Security

Never commit the following files:

```text
.env
.env.local
.env.production
```

Add them to `.gitignore`:

```gitignore
node_modules/
.env
.env.local
.env.production
dist/
```

Never expose:

```text
SUPABASE_SERVICE_ROLE_KEY
JWT_SECRET
```

in frontend code.

---

# API Example

Frontend request:

```js
const getProjects = async () => {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/api/projects`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch projects");
  }

  return response.json();
};
```

---

# Error Handling

The API should return consistent responses.

Success:

```json
{
  "success": true,
  "data": []
}
```

Error:

```json
{
  "success": false,
  "message": "Something went wrong"
}
```

---

# Future Improvements

Possible future features:

* Admin authentication
* Role-based access
* Project search
* Project filtering
* Project sorting
* Image optimization
* Project categories
* Featured project management
* Activity logs
* Dashboard statistics

---

# License

This project is for personal portfolio management and development purposes.
