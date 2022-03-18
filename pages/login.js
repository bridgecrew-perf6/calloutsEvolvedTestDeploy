import Link from "next/link";
import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../contexts/AuthContext";

const Login = () => {
  const emailRef = useRef();
  const passwordRef = useRef();
  const router = useRouter();

  const { login, currentUser, logout } = useAuth();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setError("");
      setLoading(true);
      await login(emailRef.current.value, passwordRef.current.value);
      router.push("/session");
    } catch (error) {
      setError("Failed to Log in");
      console.log(error);
    }
    setLoading(false);
  };

  return (
    <div>
      <h1>Login</h1>
      {currentUser && currentUser.email}
      {error && (
        <div style={{ padding: "5px", background: "rgba(255,0,0,0.2)" }}>
          <p>{error}</p>
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <div>
          <div>
            <label>Email</label>
          </div>
          <input label="email" type="email" required ref={emailRef} />
        </div>
        <div>
          <label>password</label>
        </div>
        <div>
          <input label="password" type="password" required ref={passwordRef} />
        </div>

        <button disabled={loading} type="submit">
          Login
        </button>
      </form>
      <div>
        <Link href="/register">
          <a>Go to Register</a>
        </Link>
      </div>
      <div>
        <Link href="/forgotPassword">
          <a>forgot password</a>
        </Link>
      </div>
    </div>
  );
};

export default Login;
