import {
  doc,
  setDoc,
  getDoc,
  collection,
  getDocs,
  Timestamp,
  query,
  orderBy,
  limit,
  where,
} from "firebase/firestore";
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
  uploadBytes,
} from "firebase/storage";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useRef, useState } from "react";
import { firestore, storage } from "../firebase/firebaseClient";

const Blogs = (props) => {
  const [limitNum, setLimitNum] = useState(5);
  const [data, setData] = useState(props.data);

  console.log(data);

  useEffect(() => {
    if (limitNum > 50) {
      loadMore;
    }
  }, [limitNum]);

  const loadMore = async () => {
    const ref = collection(firestore, "blogs");

    try {
      const q = await query(
        ref,

        orderBy("timestamp", "desc"),
        limit(limitNum)
      );
      const res = await getDocs(q);

      const entry = res.docs.map((entry) => entry.data());

      setData([...entry]);
      console.log(data);
    } catch (error) {
      console.log("error happened: " + error);
    }
  };

  let itemnum = 0;
  return (
    <div>
      <h1>Blogs</h1>

      <div>
        <h4>blogs</h4>
        {data &&
          data.map((blog) => {
            itemnum++;
            if (limitNum >= itemnum) {
              return (
                <Link
                  href={`/blog/${blog.blogTitle}`}
                  key={blog.timestamp + Math.random()}
                >
                  <a>
                    <div style={{ background: "rgba(0,0,0,0.1" }}>
                      {blog.blogImg && (
                        <Image
                          src={blog.blogImg}
                          alt={blog.blogAlt}
                          height={50}
                          width={50}
                        />
                      )}
                      <h1>{`Title: ${blog.blogTitle}`}</h1>
                      <h4>{`alt: ${blog.blogAlt}`}</h4>
                      <h5>{`Author: ${blog.AuthorName}`}</h5>
                      <h4>
                        {`publish Date: ${
                          blog.timestamp !== "" && blog.timestamp
                        }`}
                      </h4>
                      <h5>{`Read time: ${blog.timeReq} Minutes`}</h5>
                      <p>{`comments: ${blog.comments}`}</p>
                    </div>
                  </a>
                </Link>
              );
            }
          })}
        <button
          onClick={() => {
            setLimitNum(limitNum + 5);
          }}
        >
          load more
        </button>
      </div>
    </div>
  );
};

export const getServerSideProps = async () => {
  const ref = collection(firestore, "blogs");
  try {
    const q = await query(
      ref,

      orderBy("timestamp", "desc"),
      limit(50)
    );
    const res = await getDocs(q);

    const entry = res.docs.map((entry) => entry.data());
    return {
      props: { data: entry },
    };
  } catch (error) {
    console.log(error);
    return {
      props: { data: [{ title: "Error" }] },
    };
  }
};

export default Blogs;
