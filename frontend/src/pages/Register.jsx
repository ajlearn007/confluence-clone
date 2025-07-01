import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios";
import {
  Form,
  Input,
  Button,
  Typography,
  Card,
  message,
} from "antd";

const { Title } = Typography;

export default function Register() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const res = await axios.post("/register", values);
      localStorage.setItem("token", res.data.access_token);
      message.success("Registration successful");
      navigate("/");
    } catch (err) {
      message.error(err.response?.data?.detail || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-purple-100 px-4">
      <Card
        title={<Title level={3} className="text-center text-purple-700 m-0">📝 Register</Title>}
        className="w-full max-w-md rounded-xl shadow-xl"
        bordered={false}
      >
        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: "Please input your email!" },
              { type: "email", message: "Invalid email format" },
            ]}
          >
            <Input size="large" placeholder="Enter your email" />
          </Form.Item>

          <Form.Item
            label="Username"
            name="username"
            rules={[{ required: true, message: "Please input your username!" }]}
          >
            <Input size="large" placeholder="Choose a username" />
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            rules={[{ required: true, message: "Please input your password!" }]}
          >
            <Input.Password size="large" placeholder="Create a password" />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              block
              size="large"
              loading={loading}
            >
              🎉 Register
            </Button>
          </Form.Item>
        </Form>

        <p className="mt-2 text-center text-sm text-gray-500">
          Already have an account?{" "}
          <span
            onClick={() => navigate("/login")}
            className="text-purple-600 hover:underline cursor-pointer"
          >
            Login
          </span>
        </p>
      </Card>
    </div>
  );
}
