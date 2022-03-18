import React, { ReactChild, ReactElement } from "react";

import Link from "next/link";

import DisplayData from "./DisplayData";
import Navbar from "./Navbar";

const Layout = ({ children }) => {
  return (
    <>
      <Navbar />
      <div style={{ background: "rgba(0,0,0,0.1)" }}>
        <DisplayData />
      </div>
      <main>{children}</main>
    </>
  );
};

export default Layout;
