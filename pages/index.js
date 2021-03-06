import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "../contexts/AuthContext";

import styles from "../styles/Home.module.css";

export default function Home() {
  const { currentUser } = useAuth();
  return (
    <div className={styles.container}>
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div>
        <h1>Home</h1>
        <p>
          <Link href={"/blogs"}>
            <a>Blogs</a>
          </Link>
        </p>
        {currentUser && !currentUser.isAnonymous && (
          <p>
            <Link href={"/session"}>
              <a>session</a>
            </Link>
          </p>
        )}
        <p>
          <Link href={"/login"}>
            <a>Login</a>
          </Link>
        </p>
        <p>
          <Link href={"/register"}>
            <a>Register</a>
          </Link>
        </p>
        <p>
          <Link href={"/lfg"}>
            <a>Lfg</a>
          </Link>
        </p>
      </div>
    </div>
  );
}
