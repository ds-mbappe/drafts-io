export type DocumentCardTypeprops = {
  id: string,
  private: Boolean,
  locked: Boolean | undefined
  authorFirstname: string,
  authorLastname: string,
  authorAvatar: string,
  createdAt: string,
  updatedAt: string,
  cover: string | undefined,
  topic: string,
  title: string,
  content: string | null,
}