import Link from "next/link";
import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../contexts/AuthContext";

const UpdateProfile = () => {
  const usernameRef = useRef();
  const emailRef = useRef();
  const passwordRef = useRef();
  const confirmPasswordRef = useRef();
  const photoUrlRef = useRef();
  const router = useRouter();

  const {
    updateUserEmail,
    updateUsernameAndPhoto,
    updateUserPassword,
    currentUser,
  } = useAuth();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (passwordRef.current.value !== confirmPasswordRef.current.value) {
      return setError("password do not match");
    }

    const promises = [];

    setLoading(true);
    setError("");
    if (usernameRef.current.value !== "") {
      promises.push(
        updateUsernameAndPhoto(
          usernameRef.current.value,
          photoUrlRef.current.value
        )
      );
    }

    if (emailRef.current.value !== currentUser.email) {
      promises.push(updateUserEmail(emailRef.current.value));
    }

    if (passwordRef.current.value) {
      promises.push(updateUserPassword(passwordRef.current.value));
    }

    Promise.all(promises)
      .then(() => {
        setTimeout(() => {
          router.push("/session");
        }, 2000);
      })
      .catch((error) => {
        setError("Failed to update account");
        console.log(error);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    if (!currentUser) {
      router.push("/login"); // redirects if there is no user
    }
  }, [currentUser]);

  return (
    <div>
      <h1>UpdateProfile</h1>
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
          <input
            type="text"
            ref={usernameRef}
            defaultValue={currentUser.displayName}
          />
        </div>
        <div>
          <div>
            <label>Email</label>
          </div>
          <input
            label="email"
            type="email"
            required
            ref={emailRef}
            defaultValue={currentUser.email}
          />
        </div>
        <div>
          <div>
            <label>password</label>
          </div>
          <input
            label="password"
            type="password"
            ref={passwordRef}
            placeholder="leave blank to keep the same"
          />
        </div>
        <div>
          <div>
            <label>confirm password</label>
          </div>
          <input
            label="confirm password"
            type="password"
            ref={confirmPasswordRef}
            placeholder="leave blank to keep the same"
          />
        </div>
        <div>
          <div>
            <label>PhotoUrl</label>
          </div>
          <input
            label="confirm password"
            type="text"
            ref={photoUrlRef}
            defaultValue={currentUser.photoURL}
          />
        </div>
        <button disabled={loading} type="submit">
          Update
        </button>
      </form>
      <div>
        <Link href="/session">
          <a>cancel</a>
        </Link>
      </div>
    </div>
  );
};

export default UpdateProfile;
