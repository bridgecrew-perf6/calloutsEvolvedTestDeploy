import Link from "next/link";
import React, { useRef, useState } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../contexts/AuthContext";

const Register = () => {
  const usernameRef = useRef();
  const emailRef = useRef();
  const passwordRef = useRef();
  const confirmPasswordRef = useRef();
  const photoUrlRef = useRef();
  const router = useRouter();

  const { register, currentUser } = useAuth();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (passwordRef.current.value !== confirmPasswordRef.current.value) {
      return setError("password do not match");
    }
    try {
      setError("");
      setLoading(true);
      await register(
        emailRef.current.value,
        passwordRef.current.value,
        usernameRef.current.value,
        photoUrlRef.current.value
      );
      router.push("/session");
    } catch (error) {
      setError("Failed to create an account");
      console.log(error);
    }
    setLoading(false);
  };

  return (
    <div>
      <h1>Register</h1>
      {currentUser && currentUser.email}
      {error && (
        <div style={{ padding: "5px", background: "rgba(255,0,0,0.2)" }}>
          <p>{error}</p>
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <div>
          <div>
            <label>Username</label>
          </div>
          <input type="text" required ref={usernameRef} />
        </div>
        <div>
          <div>
            <label>Email</label>
          </div>
          <input type="email" required ref={emailRef} />
        </div>
        <div>
          <div>
            <label>password</label>
          </div>
          <input type="password" required ref={passwordRef} />
        </div>
        <div>
          <div>
            <label>confirm password</label>
          </div>
          <input type="password" required ref={confirmPasswordRef} />
        </div>
        <div>
          <div>
            <label>photoURL</label>
          </div>
          <input type="text" ref={photoUrlRef} />
        </div>
        <button disabled={loading} type="submit">
          register
        </button>
      </form>
      <div>
        <Link href="/login">
          <a>Go to Login</a>
        </Link>
      </div>
    </div>
  );
};

export default Register;
