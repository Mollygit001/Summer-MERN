# 🌞 MERN Summer Project

A full‑stack **MERN** (MongoDB • Express • React • Node.js) application that provides secure authentication (email/password & Google OAuth), robust user and link management, and a modern, responsive UI.

---

## 🚀 Features

- 🔐 **Authentication** — Email/Password & Google OAuth  
- 🛡️ **JWT** with secure, HTTP‑only cookies  
- 🧑‍💼 **Role‑based access** (Admin • Developer • Viewer)  
- 👤 **User CRUD** (create, update, delete)  
- 🔗 **Link CRUD** with click‑tracking analytics  
- 📱 **Responsive UI** built with Tailwind CSS  
- ⚛️ **Modern React** (Hooks & Redux Toolkit)  
- 🧹 **ESLint** for code quality  

---

## 🗂️ Project Structure

```
├── public/
├── server/
│   ├── src/
│   │   ├── constants/
│   │   ├── controller/
│   │   ├── dao/
│   │   ├── middleware/
│   │   ├── model/
│   │   ├── routes/
│   │   └── services/
│   ├── scripts/
│   ├── .env
│   └── index.js
├── src/
│   ├── app/
│   ├── components/
│   │   ├── layout/
│   │   └── pages/
│   ├── config/
│   ├── features/
│   ├── index.css
│   ├── App.jsx
│   └── main.jsx
├── .env
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

---

## ⚙️ Getting Started

### Prerequisites
- **Node.js** ≥ 18  
- **npm** or **yarn**  
- **MongoDB** running locally (`mongodb://127.0.0.1:27017/mern-summer`)  

---

## 🔑 Environment Variables

### Root `.env` (Vite / React)

```
VITE_SERVER_ENDPOINT=http://localhost:3000
```

### `server/.env` (Express / Node)

```
CLIENT_ENDPOINT=http://localhost:5173
JWT_SECRET=your_jwt_secret
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
```

---

## 📦 Install Dependencies

    # Client
    npm install

    # Server
    cd server
    npm install

---

## 🏃 Running the App

### Start the Server

    cd server
    npm start

### Start the Client

    npm run dev

> **Client**: <http://localhost:5173>  
> **Server**: <http://localhost:3000>

---

## 🧪 Usage Guide

1. Register a new account or sign in with Google.  
2. Access the dashboard to create and manage links.  
3. Admins can manage users (create, update, delete).  
4. All API routes are protected by JWT authentication.  

---

## 🧰 Available Scripts

| Command                       | Purpose                               |
|-------------------------------|---------------------------------------|
| `npm run dev`                 | Start Vite development server         |
| `npm run build`               | Build React app for production        |
| `npm run lint`                | Run ESLint                            |
| `npm run preview`             | Preview production build              |
| `cd server && npm start`      | Start Express API server              |

---

## 🧱 Tech Stack

- **Frontend:** React, Redux Toolkit, React Router, Tailwind CSS, Vite  
- **Backend:** Express, MongoDB, Mongoose, JWT, bcryptjs, Google OAuth  
- **Utilities:** ESLint, dotenv, axios  

---

## 🔍 Folder Highlights

- `src/components/pages` — Home, Login, Register, Dashboard  
- `src/features/form/formSlice.js` — Redux slice for user state  
- `server/src/controller/authController.js` — Authentication logic  
- `server/src/routes` — API route definitions  

---

## 📄 License

MIT

---

Crafted with ❤️ for the **Summer MERN Project**.
