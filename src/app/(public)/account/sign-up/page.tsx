"use client"

import { useAlertService } from "@/app/_services";
import { Input, Button, Link } from "@nextui-org/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SignInPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState({
    username: "",
    email: "",
    password: "",
  })
  const alertService = useAlertService();

  const socials = [
    {
      id: "facebook",
      icon: "F",
      action: () => {
        console.log("Facebook")
      }
    },
    {
      id: "Github",
      icon: "G",
      action: () => {
        console.log("Github")
      }
    },
    {
      id: "Google",
      icon: "G",
      action: () => {
        console.log("Google")
      }
    },
  ]

  const onSignUp = async () => {
    setLoading(true);
    alertService.clear();
    try {
      const response = await fetch("/api/account/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(user)
      });
      if (response.ok) {
        router.push("/account/sign-in");
      }
      setLoading(false)
      // const data = await response.json();
      // console.log(data)
    } catch (error: any) {
      alertService.error(error);
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-gray-200 gap-5">
      <div className="w-[350px] sm:w-full max-w-[400px] h-full flex flex-col p-6 gap-6 bg-white rounded-2xl">
        <div className="flex flex-col gap-6">
          {/* Sign up intro */}
          <div className="flex flex-col gap-1">
            <p className="text-black font-semibold text-2xl">
              {"Create a new account"}
            </p>

            <p className="text-black font-normal">
              {"Fill the form to create a new account."}
            </p>
          </div>

          {/* Social SSO */}
          <div className="flex gap-2">
            {
              socials.map(social => (
                <Button
                  key={social.id}
                  radius="sm"
                  variant="bordered"
                  className="flex-1"
                  onClick={social.action}
                >
                  {social.icon}
                </Button>
              ))
            }
          </div>

          {/* Separator */}
          <div className="flex items-center justify-center gap-3">
            <div className="w-full border border-default" />

            <p className="text-black font-normal">{"or"}</p>

            <div className="w-full border border-default" />
          </div>
        </div>

        {/* Inputs */}
        <div className="w-full h-full flex flex-col gap-5">
          <Input
            isRequired
            size="sm"
            type="text"
            label={"Username"}
            variant="bordered"
            autoComplete="new-password"
            onChange={(e) => setUser({...user, username: e.target.value})}
          />

          <Input
            isRequired
            size="sm"
            type="email"
            label={"Email"}
            variant="bordered"
            autoComplete="new-password"
            onChange={(e) => setUser({...user, email: e.target.value})}
          />

          <Input
            isRequired
            size="sm"
            type="password"
            label="Password"
            variant="bordered"
            autoComplete="new-password"
            onChange={(e) => setUser({...user, password: e.target.value})}
          />
        </div>

        {/* Sign up Button */}
        <Button
          radius="sm"
          color="primary"
          isLoading={loading}
          variant="shadow"
          onClick={onSignUp}
        >
          {"Sign up"}
        </Button>

        {/* Sign in text */}
        <div className="flex gap-1">
          <p className="text-black font-normal">
            {"Already have an account ?"}
          </p>

          <Link href="/account/sign-in">
            <p className="text-black font-medium">
              {"Sign in"}
            </p>
          </Link>
        </div>
      </div>
    </main>
  );
}