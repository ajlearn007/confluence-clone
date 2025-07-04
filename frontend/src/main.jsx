import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import App from './App'
import Login from './pages/Login'
import Register from './pages/Register'
import Home from './pages/Home'
import CreateDocument from './pages/CreateDocument'
import EditDocument from './pages/EditDocument';
import 'antd/dist/reset.css'; // Add this once globally




import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/create" element={<CreateDocument />} />
        <Route path="/edit/:id" element={<EditDocument />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
)

