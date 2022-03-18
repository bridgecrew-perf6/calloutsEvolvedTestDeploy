import Link from "next/link";
import { useRouter } from "next/router";
import React, { useEffect } from "react";
import DisplayData from "../../components/DisplayData";
import { useAuth } from "../../contexts/AuthContext";
import ManageSub from "../../components/ManageSub";

const Index = () => {
  const { currentUser } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!currentUser || currentUser.isAnonymous) {
      router.push("/lfg");
    }
  }, [currentUser]);

  return (
    <div>
      <h1>Session</h1>
      <DisplayData />
      <Link href={"/updateProfile"}>
        <a>update profile</a>
      </Link>
      <ManageSub />
    </div>
  );
};

export default Index;
