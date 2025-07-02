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
![image](https://github.com/user-attachments/assets/ea6291ab-c7c1-455a-89cf-ef30cadb5291)
Login

![image](https://github.com/user-attachments/assets/e4b9b350-671c-4788-b4a5-6bda2e1e5e1a)
Register

![image](https://github.com/user-attachments/assets/5ae1d4ea-b10a-475f-9c14-85463049746d)
Home

![image](https://github.com/user-attachments/assets/656e565c-140d-4e7e-9d5a-151dfef4e5aa)
Create Document

![image](https://github.com/user-attachments/assets/62df8766-18e7-4776-8267-de404e286e8d)
Edit Document




---

## 🧪 Demo Credentials

```bash
Email: test@example.com
Password: test123
