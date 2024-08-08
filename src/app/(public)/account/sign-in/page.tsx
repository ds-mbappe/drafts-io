"use client"

import { Input, Button } from "@nextui-org/react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Icon } from '@iconify/react';
import { toast } from "sonner";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { useSearchParams } from 'next/navigation'

export default function SignInPage() {
  const router = useRouter();
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [user, setUser] = useState({
    email: "",
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

  const onSignIn = async () => {
    setLoading(true);
    const response = await signIn('credentials', {
      email: user.email,
      password: user.password,
      callbackUrl: "/app",
      redirect: false,
    })

    if (response?.ok) {
      router.push("/app");
    } else {
      toast.error(`Error`, {
        description: `Incorrect credentials, please try again !`,
        duration: 3000,
        action: {
          label: "Close",
          onClick: () => {},
        },
      })
    }
    setLoading(false);
  }

  useEffect(() => {
    const getEmail = () => {
      const email = searchParams.get('email');

      if (email) {
        setUser({...user, email: email})

        toast.success(`User created successfully !`, {
          description: `You may now sign in with the email <b>${email}</b> and your password.<br/>Don't forget to verify yout account later !`,
          duration: 3000,
        })
      }
    }

    getEmail();
  }, [])

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-5">
      <div className="w-[350px] sm:w-full max-w-[400px] h-full flex flex-col p-6 gap-6 bg-content1 border border-divider rounded-2xl">
        <div className="flex flex-col gap-6">
          {/* Sign in intro */}
          <div className="flex flex-col gap-1">
            <p className="font-semibold text-2xl">
              {"Sign into your account"}
            </p>

            <p className="font-normal">
              {"Continue with social accounts."}
            </p>

            {process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL}
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

            <p className="font-normal">{"or"}</p>

            <div className="w-full border border-divider" />
          </div>
        </div>

        {/* Inputs */}
        <div className="w-full h-full flex flex-col gap-5">
          <Input
            id="email"
            name="email"
            value={user.email}
            isRequired
            type="email"
            label={"Email"}
            variant="bordered"
            onChange={(e) => setUser({...user, email: e.target.value})}
          />

          <Input
            id="password"
            name="password"
            isRequired
            type={isVisible ? "text" : "password"}
            label={"Password"}
            variant="bordered"
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

        {/* Sign in Button */}
        <Button
          color="primary"
          isDisabled={!user?.email || !user.password}
          isLoading={loading}
          onClick={onSignIn}
        >
          {"Sign in"}
        </Button>

        {/* Sign up text */}
        <div className="flex gap-1">
          <p className="font-normal">
            {"Don't have an account yet ?"}
          </p>

          <Link href="/account/sign-up">
            <p className="font-medium hover:text-content1-foreground">
              {"Sign up"}
            </p>
          </Link>
        </div>
      </div>
    </main>
  );
}