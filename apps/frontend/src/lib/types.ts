import { DefaultSession } from "next-auth";

export type DraftProps = {
  id?: string,
  private?: Boolean | null,
  locked?: Boolean | undefined,
  author?: BaseUser,
  createdAt?: string | null,
  updatedAt?: string | null,
  cover?: string | undefined,
  topic?: string,
  title?: string,
  content?: string | null,
  intro?: string,
  word_count?: number,
  hasLiked?: boolean,
  _count?: {
    Comment?: number,
    likes?: number
  }
}

export type CommentCardProps = {
  id?: string,
  createdAt?: string,
  updatedAt?: string,
  text?: string,
  from: number,
  to: number,
  user?: {
    id?: string,
    avatar?: string,
    lastname?: string,
    firstname?: string,
  }
}

export type BaseUser = {
  id?: string,
  email?: string,
  avatar?: string,
  firstname?: string,
  lastname?: string,
  phone?: string,
  followers?: number,
  following?: number,
}

export type EditUser = {
  firstname?: string,
  lastname?: string,
  email?: string,
  phone?: string,
  avatar?: string,
  followers?: number,
  following?: number,
}

export type CharacterCount = {
  words: () => number,
  characters: () => number
}

declare module "next-auth" {
  interface Session {
    accessToken?: string
    refreshToken?: string
    user: {
      refreshToken?: string
    } & DefaultSession["user"]
  }

  interface User {
    id: string
    refreshToken?: string
    accessToken?: string
    name?: string | null
    email?: string | null
    image?: string | null
  }
}

// declare module "next-auth/jwt" {
//   interface JWT {
//     accessToken?: string
//     refreshToken?: string
//   }
// }