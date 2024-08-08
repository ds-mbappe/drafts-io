import NextAuth from "next-auth";
import type { NextAuthOptions, Session } from "next-auth";
import GitHubProvider from "next-auth/providers/github";
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import FacebookProvider from "next-auth/providers/facebook";
import User from "@/app/models/User";

const authOptions: NextAuthOptions = {
  providers: [
    // CredentialsProvider({
    //   name: 'credentials',
    //   credentials: {
    //     email: {},
    //     password: {},
    //   },
    //   async authorize(credentials, req) {
    //     try {
    //       const response = await fetch(`${process.env.NEXTAUTH_URL as String}/api/account/signin`, {
    //         method: "POST",
    //         headers: { "Content-Type": "application/json" },
    //         body: JSON.stringify(credentials)
    //       });
    //       const user = await response.json();
          
    //       // If no error and we have user data, return it
    //       if (response?.ok) {
    //         return user
    //       }
    //     } catch (error: any) {
    //       return error
    //     }
        
    //     return null
    //   },
    // }),
    GitHubProvider({
      clientId: process.env.GITHUB_ID as string,
      clientSecret: process.env.GITHUB_SECRET as string,
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID as string,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET as string
    })
  ],
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.user = user
      }
      return token;
    },
    session: async ({ session, token }: { session: Session, token: any  }) => {
      if (token) {
        session.user = token.user;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      return baseUrl
    }
    // signIn: async ({ user }: { user: any }) => {
    //   // Check if user exists
    //   const userExists = await User.findOne({ email: user?.email })

    //   if (!userExists) {
    //     const userToCreate = {
    //       email: user?.email,
    //       password: user?.email,
    //     }
    //     const response = await fetch(`${process.env.NEXTAUTH_URL as String}/api/account/signup`, {
    //       method: "POST",
    //       headers: { "Content-Type": "application/json" },
    //       body: JSON.stringify(userToCreate)
    //     });

    //     if (response?.ok) {
    //       return true
    //     } else {
    //       return false
    //     }
    //   }
    //   return true;
    // }
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/account/sign-in",
    error: "/account/sign-in",
  },
  session: {
    strategy: "jwt"
  }
}
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
