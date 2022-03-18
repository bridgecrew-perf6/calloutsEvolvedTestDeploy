import Link from "next/link";
import React, { useRef, useState } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../contexts/AuthContext";

const ForgotPassword = () => {
  const emailRef = useRef();

  const router = useRouter();

  const { resetPassword, currentUser } = useAuth();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setMessage("");
      setError("");
      setLoading(true);
      await resetPassword(emailRef.current.value);

      setMessage("Check your inbox for further instructions");
    } catch (error) {
      setError("Failed to Reset Password");
      console.log(error);
    }
    setLoading(false);
  };

  return (
    <div>
      <h1>Reset password</h1>
      {currentUser && currentUser.email}
      {error && (
        <div style={{ padding: "5px", background: "rgba(255,0,0,0.2)" }}>
          <p>{error}</p>
        </div>
      )}
      {message && (
        <div style={{ padding: "5px", background: "rgba(0,255,0,0.2)" }}>
          <p>{message}</p>
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <div>
          <div>
            <label>Email</label>
          </div>
          <input label="email" type="email" required ref={emailRef} />
        </div>

        <button disabled={loading} type="submit">
          Reset Password
        </button>
      </form>
      <div>
        <Link href="/register">
          <a>Go to Register</a>
        </Link>
      </div>
      <div>
        <Link href="/login">
          <a>Go to login</a>
        </Link>
      </div>
    </div>
  );
};

export default ForgotPassword;
