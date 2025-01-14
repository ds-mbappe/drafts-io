const getDocument = async (documentId: String) => {
  const res = await fetch(`/api/document/${documentId}`, {
    method: 'GET',
    headers: { "content-type": "application/json" },
  });

  return res;
}

const updateDocument = async (documentId: String, formData?: Object, ) => {
  const res = await fetch(`/api/document/${documentId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ formData }),
  });

  return res;
}

const deleteDocument = async (documentId: String) => {
  const res = await fetch(`/api/document/${documentId}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
  })

  return res;
}


export { getDocument, updateDocument, deleteDocument }
