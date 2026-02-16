# Firza-mern-10pshine
# Notly - Modern MERN Stack Notes Management System
Notly is a high-performance, full-stack notes management application designed for speed and reliability. Built with the MERN stack (MongoDB, Express, React, Node.js), it features a clean UI, automated testing, and secure file handling.
# Core Features
Advanced Dashboard: Real-time visualization of your notes and activity tracking.

Secure Authentication: JWT-based user login, signup, and password reset flows.

Note Management (CRUD): Full capability to create, edit, and organize notes with rich text support.

Media Attachments: Support for uploading and managing images and PDF attachments.

Search & Favorites: Quick search functionality and a dedicated space for "Favorite" notes.

# Tech Stack
Frontend: React.js, Vite (for ultra-fast development), Tailwind CSS.

Backend: Node.js, Express.js.

Database: MongoDB.

Logging: Structured logging using Pino Logger for better debugging.

Testing: Vitest / Jest for unit and integration testing.

# Project Structure
The project is organized into two main directories for a clean separation of concerns:

/backend: Contains models, controllers, and middleware logic.

/frontend: Contains the React application, pages, and components.

# Installation & Setup
1. Clone the repository
Bash
git clone https://github.com/firzakamal975/Firza-mern-10pshine.git
cd Firza-mern-10pshine
2. Backend Setup
Bash
cd backend
npm install
# Create a .env file and add your MONGO_URI and JWT_SECRET
npm run start
3. Frontend Setup
Bash
cd frontend
npm install
npm run dev
**Running Tests
To ensure everything is working correctly:

Bash
# In backend directory
npm test

# In frontend directory
npm test