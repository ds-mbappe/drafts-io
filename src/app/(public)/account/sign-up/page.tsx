"use client"

import Link from "next/link";
import { useState } from "react";
import { Icon } from '@iconify/react';
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { errorToast } from "@/actions/showToast";
import { Input, Button } from "@heroui/react";
import { EyeIcon, EyeOffIcon } from "lucide-react";

export default function SignInPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [user, setUser] = useState({
    email: "",
    username: "",
    firstname: "",
    lastname: "",
    password: "",
  })

  const socials = [
    {
      id: "facebook",
      icon: <Icon icon="logos:facebook" width={24} height={24} />,
      action: () => {
        signIn("facebook", {
          callbackUrl: "/app"
        })
      }
    },
    {
      id: "Github",
      icon: <Icon icon="icon-park:github" width={24} height={24} />,
      action: () => {
        signIn("github", {
          callbackUrl: "/app"
        })
      }
    },
    {
      id: "Google",
      icon: <Icon icon="logos:google-icon" width={24} height={24} />,
      action: () => {
        signIn("google", {
          callbackUrl: "/app"
        })
      }
    },
  ]

  const toggleVisibility = () => setIsVisible(!isVisible);

  const onSignUp = async () => {
    setLoading(true);
    const response = await fetch("/api/account/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(user)
    });

    if (response?.ok) {
      router.push(`/account/sign-in?email=${user?.email}`);
    } else {
      const { error } = await response.json()
      errorToast(error);
    }
    setLoading(false)
  }

  return (
    <main className="flex h-[100dvh] flex-col items-center justify-center gap-5">
      <div className="w-[350px] sm:w-full max-w-[400px] flex flex-col p-6 gap-6 bg-content1 border border-divider rounded-2xl">
        <div className="flex flex-col gap-6">
          {/* Sign up intro */}
          <div className="flex flex-col gap-1">
            <p className="font-semibold text-2xl">
              {"Create a new account"}
            </p>

            <p className="font-normal">
              {"Continue with social accounts."}
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
            <div className="w-full border border-divider" />

            <p className="text-black font-normal">{"or"}</p>

            <div className="w-full border border-divider" />
          </div>
        </div>

        <form onSubmit={onSignUp} className="w-full flex flex-col gap-6">
          {/* Inputs */}
          <div className="w-full h-full flex flex-col gap-5">
            <Input
              isRequired
              type="text"
              label={"Username"}
              variant="bordered"
              autoComplete="new-password"
              onChange={(e) => setUser({...user, username: e.target.value})}
            />

            <Input
              isRequired
              type="email"
              label={"Email"}
              variant="bordered"
              autoComplete="new-password"
              onChange={(e) => setUser({...user, email: e.target.value})}
            />

            <Input
              isRequired
              type="text"
              label={"Firstname"}
              variant="bordered"
              autoComplete="new-password"
              onChange={(e) => setUser({...user, firstname: e.target.value})}
            />

            <Input
              isRequired
              type="text"
              label={"Lastname"}
              variant="bordered"
              autoComplete="new-password"
              onChange={(e) => setUser({...user, lastname: e.target.value})}
            />

            <Input
              isRequired
              type={isVisible ? "text" : "password"}
              label="Password"
              variant="bordered"
              autoComplete="new-password"
              endContent={ user?.password ?
                <button className="focus:outline-none" type="button" onClick={toggleVisibility} aria-label="toggle password visibility">
                  {isVisible ? (
                    <EyeOffIcon className="text-2xl pointer-events-none" />
                  ) : (
                    <EyeIcon className="text-2xl pointer-events-none" />
                  )}
                </button> : <></>
              }
              onChange={(e) => setUser({...user, password: e.target.value})}
            />
          </div>

          {/* Sign up Button */}
          <Button
            color="primary"
            isDisabled={!user?.email || !user.password || !user?.username}
            isLoading={loading}
            onClick={onSignUp}
          >
            {"Sign up"}
          </Button>
        </form>

        {/* Sign in text */}
        <div className="flex gap-1">
          <p className="font-normal">
            {"Already have an account ?"}
          </p>

          <Link href="/account/sign-in">
            <p className="font-medium hover:text-primary transition-all">
              {"Sign in"}
            </p>
          </Link>
        </div>
      </div>
    </main>
  );
}