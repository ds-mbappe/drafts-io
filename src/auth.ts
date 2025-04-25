import bcryptjs from "bcryptjs";
import NextAuth from "next-auth";
import Google from "next-auth/providers/google"
import Github from "next-auth/providers/github"
import Facebook from "next-auth/providers/facebook"
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "../lib/prisma";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google, Github, Facebook,
    CredentialsProvider({
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findFirst({
          where: {
            email: credentials.email,
          },
        })

        if (!user || !user.password) {
          return null
        }

        const isValidPassword = bcryptjs.compare(
          credentials.password.toString(),
          user.password
        )

        if (!isValidPassword) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.username || user.firstname,
        }
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
    jwt: async ({ token, trigger, user, session }) => {
      if (trigger === "update") {
        token.user = { ...session }
      }
      user && (token.user = user)
      return token
    },
    session: async ({ session, token }: { session: any, token: any }) => {
      session.user = token.user;
      return session;
    },
    authorized: async ({ request, auth }) => {
      if (request.nextUrl.pathname.startsWith('/account')) return true;
      return !!auth
    },
  },
});