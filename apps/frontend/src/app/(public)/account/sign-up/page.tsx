"use client"

import Link from "next/link";
import { useState } from "react";
import { Icon } from '@iconify/react';
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { errorToast } from "@/actions/showToast";
import { Input, Button } from "@heroui/react";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { backendUrl } from "@/lib/backend";

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
    if (loading) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(backendUrl("/api/auth/signup"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(user)
      });

      if (response.ok) {
        router.push(`/account/sign-in?email=${user.email}`);
        return;
      }

      const payload = await response.json().catch(() => null);
      const message =
        typeof payload?.error === "string"
          ? payload.error
          : typeof payload?.message === "string"
            ? payload.message
            : "Sign up failed, please try again.";

      errorToast(message);
    } catch {
      errorToast("Unable to reach the server. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-5 overflow-y-auto">
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
                  className="flex-1 rounded-sm"
                  variant="outline"
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

        <form
          onSubmit={(e) => {
            e.preventDefault();
            void onSignUp();
          }}
          className="w-full flex flex-col gap-6"
        >
          {/* Inputs */}
          <div className="w-full h-full flex flex-col gap-5">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">Username</label>
              <Input required type="text" variant="secondary" autoComplete="new-password" onChange={(e) => setUser({...user, username: e.target.value})} />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">Email</label>
              <Input required type="email" variant="secondary" autoComplete="new-password" onChange={(e) => setUser({...user, email: e.target.value})} />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">Firstname</label>
              <Input required type="text" variant="secondary" autoComplete="new-password" onChange={(e) => setUser({...user, firstname: e.target.value})} />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">Lastname</label>
              <Input required type="text" variant="secondary" autoComplete="new-password" onChange={(e) => setUser({...user, lastname: e.target.value})} />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">Password</label>
              <div className="relative">
                <Input required type={isVisible ? "text" : "password"} variant="secondary" autoComplete="new-password" className="w-full pr-10" onChange={(e) => setUser({...user, password: e.target.value})} />
                {user?.password && (
                  <button className="absolute right-2 top-1/2 -translate-y-1/2 focus:outline-hidden" type="button" onClick={toggleVisibility} aria-label="toggle password visibility">
                    {isVisible ? <EyeOffIcon className="text-2xl pointer-events-none" /> : <EyeIcon className="text-2xl pointer-events-none" />}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Sign up Button */}
          <Button
            type="submit"
            variant="primary"
            isDisabled={loading || !user?.email || !user.password || !user?.username}
            isPending={loading}
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
