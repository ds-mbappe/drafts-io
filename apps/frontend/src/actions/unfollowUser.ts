import { errorToast, successToast } from "./showToast";

export const unfollowUser = async (followerId: string, followingId: string) => {
  const formData = {
    followerId: followerId,
    followingId: followingId
  }

  const res = await fetch(`/api/user/unfollow`, {
    method: 'DELETE',
    body: JSON.stringify(formData),
  });

  if (res?.ok) {
    const data = await res.json();

    successToast("User unfollowed successfully");
    
    return data
  } else {
    errorToast("Error unfollowing user");

    return null
  }
}