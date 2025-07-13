export type DocumentCardTypeprops = {
  id: string,
  private: Boolean | null,
  locked: Boolean | undefined,
  author: {
    id?: string,
    avatar?: string,
    lastname?: string,
    firstname?: string,
  },
  createdAt: string | null,
  updatedAt: string | null,
  cover: string | undefined,
  topic: string,
  title: string,
  content: string | null,
}

export type CommentCardProps = {
  id?: string,
  createdAt?: string,
  updatedAt?: string,
  text?: string,
  user?: {
    id?: string,
    avatar?: string,
    lastname?: string,
    firstname?: string,
  }
}