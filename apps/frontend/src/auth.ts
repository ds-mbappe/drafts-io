import NextAuth from "next-auth";
import Google from "next-auth/providers/google"
import Github from "next-auth/providers/github"
import Facebook from "next-auth/providers/facebook"
import CredentialsProvider from "next-auth/providers/credentials";
import { isTokenExpired, refreshAccessToken } from "./lib/utils";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google, Github, Facebook,
    CredentialsProvider({
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/signin`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(credentials),
        });

        const data = await res.json();

        if (res.ok && data.access_token) {
          return {
            id: data.user.id,
            name: data.user.firstname,
            email: data.user.email,
            token: data.access_token,
            refreshToken: data.refresh_token,
            user: data.user,
          };
        }

        return null;
      },
    }),
  ],
  pages: {
    signIn: "/account/sign-in",
    error: "/account/sign-in",
  },
  session: {
    strategy: "jwt"
  },
  callbacks: {
    jwt: async ({ token, trigger, user, session }: any) => {
      if (trigger === "update") {
        token.user = { ...session }
      }
      if (user) {
        token.accessToken = user.token;
        token.refreshToken = user.refreshToken;
        token.user = user.user;
      }

      if (isTokenExpired(token.accessToken)) {
        try {
          const { access_token } = await refreshAccessToken(token.refreshToken);

          token.accessToken = access_token;
        } catch (err) {
          console.error('Token refresh failed', err);
          token.accessToken = null;
          token.refreshToken = null;
          token.user = null;
        }
      }

      return token
    },
    session: async ({ session, token }: { session: any, token: any }) => {
      session.accessToken = token.accessToken;
      session.user = token.user;
      return session;
    },
    authorized: async ({ request, auth }) => {
      if (request.nextUrl.pathname.startsWith('/account')) return true;
      return !!auth
    },
  },
});