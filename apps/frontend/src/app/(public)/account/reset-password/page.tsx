"use client"

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Input, Button } from "@heroui/react";
import { useSearchParams } from "next/navigation";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { errorToast, successToast } from "@/actions/showToast";
import { backendUrl } from "@/lib/backend";

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
    if (loading) {
      return;
    }

    setLoading(true);

    try {
      const data = {
        email: user?.email,
        password: user?.password,
        token: token
      }
      const url = backendUrl("/api/auth/reset_password")
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });

      if (response?.ok) {
        router.push(`/account/sign-in?email=${user?.email}`);
      } else {
        const payload = await response.json().catch(() => null);
        const message =
          typeof payload?.error === "string"
            ? payload.error
            : typeof payload?.message === "string"
              ? payload.message
              : "An error occured, please try again !";

        errorToast(message);
      }
    } catch {
      errorToast("Unable to reach the server. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const onSendResetEmail = async() => {
    if (loading) {
      return;
    }

    setLoading(true);

    try {
      const data = { email: user?.email }
      const url = backendUrl("/api/auth/request_reset_password")
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });

      if (response?.ok) {
        successToast("We just sent you an email, follow the instructions to reset your password !");

        router.push('/account/sign-in');
      } else {
        const payload = await response.json().catch(() => null);
        const message =
          typeof payload?.error === "string"
            ? payload.error
            : typeof payload?.message === "string"
              ? payload.message
              : "An error occured, please try again !";

        errorToast(message);
      }
    } catch {
      errorToast("Unable to reach the server. Please try again.");
    } finally {
      setLoading(false);
    }
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
    <main className="flex min-h-dvh flex-col items-center justify-center gap-5 overflow-y-auto">
      <div className="w-[350px] sm:w-full max-w-[400px] flex flex-col p-6 gap-6 bg-content1 border border-divider rounded-2xl">
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
          <div className="w-full flex flex-col gap-5">
            <div className="flex flex-col gap-1">
              <label htmlFor="email" className="text-sm font-medium">Email</label>
              <Input
                id="email"
                name="email"
                value={user?.email}
                required
                disabled={token ? true : false}
                type="email"
                variant="secondary"
                onChange={(e) => setUser({...user, email: e?.target?.value})}
              />
            </div>

            {token ? (
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium">New password</label>
                <div className="relative">
                  <Input
                    required
                    type={isVisible ? "text" : "password"}
                    variant="secondary"
                    autoComplete="new-password"
                    className="w-full pr-10"
                    onChange={(e) => setUser({...user, password: e?.target?.value})}
                  />
                  {user?.password && (
                    <button className="absolute right-2 top-1/2 -translate-y-1/2 focus:outline-hidden" type="button" onClick={toggleVisibility} aria-label="toggle password visibility">
                      {isVisible ? <EyeOffIcon className="text-2xl pointer-events-none" /> : <EyeIcon className="text-2xl pointer-events-none" />}
                    </button>
                  )}
                </div>
              </div>
            ) : <></>}
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
            variant="primary"
            isDisabled={loading || !user?.password}
            isPending={loading}
            onClick={onResetPassword}
          >
            {"Reset password"}
          </Button> :
          <Button
            variant="primary"
            isDisabled={!user?.email}
            isPending={loading}
            onClick={onSendResetEmail}
          >
            {"Reset password"}
          </Button>
        }
      </div>
    </main>
  )
}
