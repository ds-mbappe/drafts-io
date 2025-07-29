export type DocumentCardTypeprops = {
  id?: string,
  private?: Boolean | null,
  locked?: Boolean | undefined,
  author?: {
    id: string,
    avatar?: string,
    lastname?: string,
    firstname?: string,
  },
  createdAt?: string | null,
  updatedAt?: string | null,
  cover: string | undefined,
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
  id: string,
  email?: string,
  avatar: string,
  firstname: string,
  lastname: string,
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