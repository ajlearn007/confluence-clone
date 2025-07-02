# 🧠 Confluence Clone – Knowledge Base Platform

A full-stack **Confluence-like** collaborative knowledge base platform built using **FastAPI** (Python), **React**, **PostgreSQL**, and **TailwindCSS**. It allows teams to create, edit, search, and share documents with rich formatting and access control.

## 🚀 Features

### ✅ Authentication
- JWT-based authentication
- User registration & login with email
- Role-based access (author, shared user)

### ✅ Document Management
- Create, edit, delete documents (rich text editor with ReactQuill)
- Save public or private documents
- View all accessible documents (own, shared, public)

### ✅ Collaboration
- **@Mentions** (`@username`) to auto-share documents with view access
- Manual sharing with view/edit permissions
- Document visibility toggles (public/private)
- View public documents without login

### ✅ Global Search
- Case-insensitive partial search across title and content
- Returns documents that are owned, shared, or public

### ✅ Bonus (Ready for Extension)
- Modular backend for adding **version control** or **diff viewer**
- Secure, scalable backend with FastAPI and SQLAlchemy ORM

---

## 🛠️ Tech Stack

| Layer       | Technology                        |
|------------|------------------------------------|
| Frontend    | React, TailwindCSS, Ant Design, React-Quill |
| Backend     | FastAPI, SQLAlchemy, Pydantic     |
| Database    | PostgreSQL                        |
| Auth        | JWT (via `python-jose`)           |
| Deployment  | Vite (Frontend), Uvicorn (Backend)|

---

## 📸 Screenshots

> *You can add screenshots or a demo GIF here to visually showcase the UI/UX.*

---

## 🧪 Demo Credentials

```bash
Email: test@example.com
Password: test123
