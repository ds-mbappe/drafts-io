const search = async (text: String, token: string) => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/global_search?text=${text}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      "content-type": "application/json"
    },
  });

  return res;
}

export { search }