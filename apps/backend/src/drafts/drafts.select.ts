// drafts.select.ts
export const authorSelect = {
  id: true,
  username: true,
  avatar: true,
  firstname: true,
  lastname: true,
};

export const draftListSelect = {
  id: true,
  cover: true,
  title: true,
  topics: true,
  private: true,
  createdAt: true,
  updatedAt: true,
  word_count: true,
  author: { select: authorSelect },
};

export const draftDetailSelect = {
  ...draftListSelect,
  intro: true,
  content: true,
  _count: {
    select: {
      Comment: true,
      likes: true,
    },
  },
};
