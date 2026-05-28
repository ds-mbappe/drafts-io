"use client"

import Link from "next/link";
import { Icon } from '@iconify/react';
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useSearchParams } from 'next/navigation';
import { Input, Button } from "@heroui/react";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { errorToast, successToast } from "@/actions/showToast";

export default function SignInPage() {
  const router = useRouter();
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [user, setUser] = useState({
    email: "",
    password: "",
  })

  // Social
  const socials = [
    {
      id: "facebook",
      icon: <Icon icon="logos:facebook" width={24} height={24} />,
      action: () => {
        signIn("facebook", {
          redirectTo: "/app"
        })
      }
    },
    {
      id: "Github",
      icon: <Icon icon="icon-park:github" width={24} height={24} />,
      action: () => {
        signIn("github", {
          redirectTo: "/app"
        })
      }
    },
    {
      id: "Google",
      icon: <Icon icon="logos:google-icon" width={24} height={24} />,
      action: () => {
        signIn("google", {
          redirectTo: "/app"
        })
      }
    },
  ]

  const toggleVisibility = () => setIsVisible(!isVisible);

  const onSignIn = async () => {
    if (loading) {
      return;
    }

    setLoading(true);

    try {
      const response = await signIn('credentials', {
        email: user?.email,
        password: user?.password,
        redirect: false,
      });

      if (!response?.error) {
        router.push("/app");
        return;
      }

      errorToast("Incorrect credentials, please try again !");
    } catch {
      errorToast("Unable to reach the server. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const getUrlParams = () => {
      const email = searchParams.get('email');

      if (email) {
        setUser({...user, email: email})

        successToast(`You may now sign in with the email <b>${email}</b> and your password.<br/>Don't forget to verify your account later !`);
      }
    }

    getUrlParams();
  }, [])

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-5 px-5 overflow-y-auto">
      <div className="w-full max-w-[400px] flex flex-col p-6 gap-6 bg-content1 border border-divider rounded-2xl">
        <div className="flex flex-col gap-6">
          {/* Sign in intro */}
          <div className="flex flex-col gap-1">
            <p className="font-semibold text-2xl">
              {"Sign into your account"}
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

            <p className="font-normal">{"or"}</p>

            <div className="w-full border border-divider" />
          </div>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            void onSignIn();
          }}
          className="w-full flex flex-col gap-6"
        >
          {/* Inputs */}
          <div className="w-full flex flex-col gap-2">
            <div className="w-full h-full flex flex-col gap-5">
              <div className="flex flex-col gap-1">
                <label htmlFor="email" className="text-sm font-medium">Email</label>
                <Input
                  id="email"
                  name="email"
                  value={user?.email}
                  required
                  type="email"
                  variant="secondary"
                  onChange={(e) => setUser({ ...user, email: e?.target?.value })}
                />
              </div>

              <div className="flex flex-col gap-1">
                <label htmlFor="password" className="text-sm font-medium">Password</label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    required
                    type={isVisible ? "text" : "password"}
                    variant="secondary"
                    className="w-full pr-10"
                    onChange={(e) => setUser({ ...user, password: e?.target?.value })}
                  />
                  {user?.password && (
                    <button className="absolute right-2 top-1/2 -translate-y-1/2 focus:outline-hidden" type="button" onClick={toggleVisibility} aria-label="toggle password visibility">
                      {isVisible ? (
                        <EyeOffIcon className="text-2xl pointer-events-none" />
                      ) : (
                        <EyeIcon className="text-2xl pointer-events-none" />
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-1">
              <p className="font-normal text-sm">
                {"Forgot your password ?"}
              </p>

              <Link href="/account/reset-password">
                <p className="font-medium hover:text-primary transition-all text-sm">
                  {"Click here"}
                </p>
              </Link>
            </div>
          </div>

          {/* Sign in Button */}
          <Button
            type="submit"
            variant="primary"
            isDisabled={loading || !user?.email || !user.password}
            isPending={loading}
          >
            {"Sign in"}
          </Button>
        </form>


        {/* Sign up text */}
        <div className="flex gap-1">
          <p className="font-normal">
            {"Don't have an account yet ?"}
          </p>

          <Link href="/account/sign-up">
            <p className="font-medium hover:text-primary transition-all">
              {"Sign up"}
            </p>
          </Link>
        </div>
      </div>
    </main>
  );
}
