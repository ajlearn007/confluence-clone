import { useState } from "react";
import axios from "../api/axios";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", username: "", password: "" });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("/register", form);
      localStorage.setItem("token", res.data.access_token);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.detail || "Registration failed");
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <h1 className="text-2xl mb-4">Register</h1>
      <form onSubmit={handleSubmit}>
        <input name="email" onChange={handleChange} placeholder="Email" className="input mb-2" />
        <input name="username" onChange={handleChange} placeholder="Username" className="input mb-2" />
        <input name="password" type="password" onChange={handleChange} placeholder="Password" className="input mb-2" />
        <button className="btn w-full">Register</button>
        {error && <p className="text-red-500 mt-2">{error}</p>}
      </form>
    </div>
  );
}
