import React, { useState } from "react";
import "./RegisterPage.scss";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const RegisterPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const validateForm = () => {
    const newErrors = {};
    if (!formData.username) {
      newErrors.username = "Username is required";
    }
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
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
      const response = await axios.post("https://67dda021e00db03c406c656d.mockapi.io/account", {
        username: formData.username,
        email: formData.email,
        password: formData.password,
      });
      
      if (response.data) {
        // Store token in localStorage
        localStorage.setItem("token", response.data.token);
        // Store user data if needed
        localStorage.setItem("user", JSON.stringify(response.data.user));
        
        // Redirect to home page
        navigate("/");
      }
    } catch (error) {
      console.error("Registration failed:", error);
      setErrorMessage("Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="register-container">
      <form onSubmit={handleSubmit}>
        <h3>Register Here</h3>

        <label htmlFor="username">Username</label>
        <input
          type="text"
          placeholder="Username"
          id="username"
          value={formData.username}
          onChange={handleChange}
          className={errors.username ? "error" : ""}
        />
        {errors.username && <span className="error-message">{errors.username}</span>}

        <label htmlFor="email">Email</label>
        <input
          type="email"
          placeholder="Email"
          id="email"
          value={formData.email}
          onChange={handleChange}
          className={errors.email ? "error" : ""}
        />
        {errors.email && <span className="error-message">{errors.email}</span>}

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

        <label htmlFor="confirmPassword">Confirm Password</label>
        <input
          type="password"
          placeholder="Confirm Password"
          id="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          className={errors.confirmPassword ? "error" : ""}
        />
        {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}

        {errorMessage && <div className="error-message">{errorMessage}</div>}

        <button type="submit" disabled={isLoading}>
          {isLoading ? "Registering..." : "Register"}
        </button>
       
      </form>
    </div>
  );
};

export default RegisterPage; 