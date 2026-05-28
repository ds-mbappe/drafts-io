import { backendUrl } from "@/lib/backend";

const search = async (
  text: string,
  token: string,
  type?: 'users' | 'drafts',
  skip = 0,
) => {
  const params = new URLSearchParams({ text });
  if (type) params.set('type', type);
  if (skip > 0) params.set('skip', String(skip));

  return fetch(backendUrl(`/api/global_search?${params}`), {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      'content-type': 'application/json',
    },
  });
};

export { search };
