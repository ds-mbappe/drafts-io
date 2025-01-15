const getLikes = async (documentId: String, userId: String) => {
  const res = await fetch(`/api/document/${documentId}/like?userId=${userId}`, {
    method: 'GET',
    headers: { "content-type": "application/json" },
  });

  return res;
}

const likeDocument = async (documentId: String, userId?: String) => {
  const res = await fetch(`/api/document/${documentId}/like`, {
    method: 'POST',
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ userId }),
  });

  return res;
}

const dislikeDocument = async (documentId: String, userId?: String) => {
  const res = await fetch(`/api/document/${documentId}/like`, {
    method: 'DELETE',
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ userId }),
  });

  return res;
}

export { getLikes, likeDocument, dislikeDocument }