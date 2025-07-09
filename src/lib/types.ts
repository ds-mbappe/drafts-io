export type DocumentCardTypeprops = {
  id: string,
  private: Boolean | null,
  locked: Boolean | undefined
  authorFirstname: string,
  authorLastname: string,
  authorAvatar: string,
  createdAt: string | null,
  updatedAt: string | null,
  cover: string | undefined,
  topic: string,
  title: string,
  content: string | null,
}