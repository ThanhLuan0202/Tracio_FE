import React, { useState } from "react";
import "./LoginPage.scss";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

const LoginPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const validateForm = () => {
    const newErrors = {};
    if (!formData.username) {
      newErrors.username = "Username is required";
    }
    if (!formData.password) {
      newErrors.password = "Password is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
    // Clear error when user starts typing
    if (errors[id]) {
      setErrors((prev) => ({
        ...prev,
        [id]: "",
      }));
    }
    setErrorMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    try {
      const response = await axios.post("https://67dda021e00db03c406c656d.mockapi.io/account", formData);
      if (response.data) {
        // Store token in localStorage
        localStorage.setItem("token", response.data.token);
        // Store user data if needed
        localStorage.setItem("user", JSON.stringify(response.data.user));
        
        // Redirect to home page
        navigate("/");
      }
    } catch (error) {
      console.error("Login failed:", error);
      setErrorMessage("Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleSubmit}>
        <h3>Login Here</h3>

        <label htmlFor="username">Username</label>
        <input
          type="text"
          placeholder="Email or Phone"
          id="username"
          value={formData.username}
          onChange={handleChange}
          className={errors.username ? "error" : ""}
        />
        {errors.username && <span className="error-message">{errors.username}</span>}

        <label htmlFor="password">Password</label>
        <input
          type="password"
          placeholder="Password"
          id="password"
          value={formData.password}
          onChange={handleChange}
          className={errors.password ? "error" : ""}
        />
        {errors.password && <span className="error-message">{errors.password}</span>}

        {errorMessage && <div className="error-message">{errorMessage}</div>}
        <p className="register-link">
          Don't have an account? <Link to="/register">Click here!</Link>
        </p>
        <button type="submit" disabled={isLoading}>
          {isLoading ? "Logging in..." : "Log In"}
        </button>
        

        
      </form>
    </div>
  );
};

export default LoginPage;