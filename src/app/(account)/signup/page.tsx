"use client";

import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import styles from "./Signup.module.css";

const SignUpPage: React.FC = () => {
  const [userInfo, setUserInfo] = useState({
    id: "",
    name: "",
    password: "",
    confirmPassword: "",
    email: "",
    phone: "",
  });
  const [error, setError] = useState<Record<string, string>>({});
  const router = useRouter();

  const validate = () => {
    const newError: Record<string, string> = {};
    if (userInfo.id.length < 4)
      newError.id = "User ID must be at least 4 characters.";
    if (!userInfo.email.includes("@"))
      newError.email = "Please enter a valid email format.";
    if (userInfo.password.length < 8)
      newError.password = "Password must be at least 8 characters.";
    if (userInfo.password !== userInfo.confirmPassword)
      newError.confirmPassword = "Passwords do not match.";

    setError(newError);
    return Object.keys(newError).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: userInfo.id,
          name: userInfo.name,
          password: userInfo.password,
          email: userInfo.email,
          phone: userInfo.phone,
        }),
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem("userId", data.userId);
        alert("Sign-up completed successfully.");
        router.push("/");
      } else {
        alert(data.message || "Sign-up failed.");
      }
    } catch {
      alert("A server communication error occurred.");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserInfo({
      ...userInfo,
      [name]: value,
    });
  };

  return (
    <>
      <Header />
      <div className={styles.signupContainer}>
        <div className={styles.signupBox}>
          <h1>Sign up</h1>
          <p className={styles.signupSubtitle}>B2C Store Sign-up</p>
          <form className={styles.signupForm} onSubmit={handleSubmit}>
            {/* User ID */}
            <div className={styles.formGroup}>
              <label htmlFor="id">User ID *</label>
              <input
                type="text"
                id="id"
                name="id"
                value={userInfo.id}
                onChange={handleChange}
                placeholder="example"
                required
              />
              {error.id && <p className={styles.errorText}>{error.id}</p>}
            </div>
            {/* Name */}
            <div className={styles.formGroup}>
              <label htmlFor="name">Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={userInfo.name}
                onChange={handleChange}
                placeholder="John Doe"
                required
              />
            </div>
            {/* Email */}
            <div className={styles.formGroup}>
              <label htmlFor="email">Email *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={userInfo.email}
                onChange={handleChange}
                placeholder="example@email.com"
                required
              />
              {error.email && <p className={styles.errorText}>{error.email}</p>}
            </div>

            {/* Password */}
            <div className={styles.formGroup}>
              <label htmlFor="password">Password *</label>
              <input
                type="password"
                id="password"
                name="password"
                value={userInfo.password}
                onChange={handleChange}
                placeholder="At least 8 characters (letters + numbers)"
                required
              />
              {error.password && (
                <p className={styles.errorText}>{error.password}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div className={styles.formGroup}>
              <label htmlFor="confirmPassword">Confirm Password *</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={userInfo.confirmPassword}
                onChange={handleChange}
                placeholder="Re-enter password"
              />
              {error.confirmPassword && (
                <p className={styles.errorText}>{error.confirmPassword}</p>
              )}
            </div>

            {/* Phone Number */}
            <div className={styles.formGroup}>
              <label htmlFor="phone">Phone Number</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={userInfo.phone}
                onChange={handleChange}
                placeholder="010-0000-0000"
                required
              />
            </div>

            {/* Sign-up button */}
            <button type="submit" className={styles.signupButton}>
              Sign up
            </button>

            {/* Link to login page */}
            <p className={styles.loginLink}>
              Already have an account? <Link href="/login">Log in</Link>
            </p>
          </form>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default SignUpPage;
