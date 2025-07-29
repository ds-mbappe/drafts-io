import { errorToast, successToast } from "./showToast";

export const followUser = async (followerId: string, followingId: string) => {
  const formData = {
    followerId: followerId,
    followingId: followingId
  }

  const res = await fetch(`/api/user/follow`, {
    method: 'POST',
    body: JSON.stringify(formData),
  });

  if (res?.ok) {
    const data = await res.json();

    successToast("User followed successfully");
  
    return data
  } else {
    errorToast("Error following user");

    return null
  }
}