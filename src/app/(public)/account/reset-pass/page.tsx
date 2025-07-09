"use client"

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Input, Button } from "@heroui/react";
import { useSearchParams } from "next/navigation";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { errorToast, successToast } from "@/actions/showToast";

export default function ResetPass() {
  const router = useRouter();
  const [user, setUser] = useState({
    email: "",
    password: "",
  })
  const searchParams = useSearchParams();
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const toggleVisibility = () => setIsVisible(!isVisible);

  const onResetPassword = async() => {
    setLoading(true);
    try {
      const data = {
        email: user?.email,
        password: user?.password,
        token: token
      }

      const response = await fetch("/api/account/reset_password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });

      if (response?.ok) {
        successToast("You can now sign in with your new password !");
        router.push(`/account/sign-in`);
      } else {
        errorToast("An error occured, please try again !");
      }
    } catch (error) {
      console.log(error)
    }
    setLoading(false);
  }

  const onSendResetEmail = async() => {
    setLoading(true);
    try {
      const data = { email: user?.email }
      const response = await fetch("/api/account/reset_password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });

      if (response?.ok) {
        successToast("We just sent you an email, follow the instructions to reset your password !");
      } else {
        errorToast("An error occured, please try again !");
      }
    } catch (error) {
      console.log(error)
    }
    setLoading(false);
  }

  useEffect(() => {
    const getToken = () => {
      if (searchParams.has('token')) {
        setToken(searchParams.get('token') || "")
      }
      if (searchParams.has('email')) {
        setUser({...user, email: searchParams.get('email') || ""})
      }
    }

    getToken();
  }, [token])

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-5">
      <div className="w-[350px] sm:w-full max-w-[400px] h-full flex flex-col p-6 gap-6 bg-content1 border border-divider rounded-2xl">
        {/* Texts */}
        <div className="flex flex-col gap-1">
          <p className="font-semibold text-2xl">
            {"Reset your password"}
          </p>

          <p className="font-normal">
            {"Enter your email below and you will receive a link to reset your password."}
          </p>
        </div>

        {/* Inputs */}
        <div className="w-full flex flex-col gap-2">
          <div className="w-full h-full flex flex-col gap-5">
            <Input
              id="email"
              name="email"
              value={user?.email}
              isRequired
              isDisabled={token ? true : false}
              type="email"
              label={"Email"}
              variant="bordered"
              onChange={(e) => setUser({...user, email: e?.target?.value})}
            />

            {token ?
              <Input
                isRequired
                type={isVisible ? "text" : "password"}
                label="New password"
                variant="bordered"
                autoComplete="new-password"
                endContent={user?.password ?
                  <button className="focus:outline-none" type="button" onClick={toggleVisibility} aria-label="toggle password visibility">
                    {isVisible ? (
                      <EyeOffIcon className="text-2xl pointer-events-none" />
                    ) : (
                      <EyeIcon className="text-2xl pointer-events-none" />
                    )}
                  </button> : <></>
                }
                onChange={(e) => setUser({...user, password: e?.target?.value})}
              /> : <></>
            }
          </div>

          <div className="flex gap-1">
            <p className="font-normal text-sm">
              {"Remember your password ?"}
            </p>

            <Link href="/account/sign-in">
              <p className="font-medium hover:text-primary transition-all text-sm">
                {"Back to login"}
              </p>
            </Link>
          </div>
        </div>

        {/* Reset password Button */}
        {token ?
          <Button
            color="primary"
            isDisabled={!user?.password}
            isLoading={loading}
            onClick={onResetPassword}
          >
            {"Reset password"}
          </Button> :
          <Button
            color="primary"
            isDisabled={!user?.email}
            isLoading={loading}
            onClick={onSendResetEmail}
          >
            {"Reset password"}
          </Button>
        }
      </div>
    </main>
  )
}