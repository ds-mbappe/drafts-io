const search = async (text: String) => {
  const res = await fetch(`/api/search?text=${text}`, {
    method: 'GET',
    headers: { "content-type": "application/json" },
  });

  return res;
}

export { search }