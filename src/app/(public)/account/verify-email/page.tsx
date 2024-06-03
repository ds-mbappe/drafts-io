"use client";

import { Link } from "@nextui-org/react";
import { useEffect, useState } from "react";

export default function VerifyEmailPage() {
  const [token, setToken] = useState("");
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState(false);

  const verifyUserEmail = async () => {
    try {
      const response = await fetch("/api/account/verifyemail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token })
      });
      // const data = await response.json();
      // console.log(data);
      if (!response.ok) {
        setError(true);
      } else {
        setVerified(true);
      }
    } catch (error: any) {
      console.log(error)
    }
  };
  useEffect(() => {
    const urlToken = window?.location.search.split("=")[1];
    setToken(urlToken || "");
  }, []);

  useEffect(() => {
    if (token.length > 0) {
      verifyUserEmail();
    }
  }, [token]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <h1 className="text-4xl">Verify Email</h1>
      <h2 className="p-2 text-black">
        {token ? `${token}` : "no token"}
      </h2>

      {verified && (
        <div>
          <h2 className="text-2xl">Email Verified</h2>
          <Link href="/account/sign-in">Login</Link>
        </div>
      )}

      {error && (
        <div>
          <h2 className="text-2xl">Error</h2>
        </div>
      )}
    </div>
  );
}