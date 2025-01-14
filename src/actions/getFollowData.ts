import { errorToast } from "./showToast";

export const getFollowData = async (id: string) => {

  const res = await fetch(`/api/user/${id}/follow_data`, {
    method: 'GET',
  });

  if (res?.ok) {
    const data = await res.json();
  
    return data?.followData
  } else {
    errorToast("Error getting followers/folling data");

    return null
  }
}