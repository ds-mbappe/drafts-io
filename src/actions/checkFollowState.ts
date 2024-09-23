export const checkFollowState = async (followerId: string, followingId: string) => {
  const formData = {
    followerId: followerId,
    followingId: followingId
  }

  const res = await fetch(`/api/user/check_follow`, {
    method: 'POST',
    body: JSON.stringify(formData),
  });

  if (res?.ok) {
    const data = await res.json();

    return data?.isFollowing
  } else {

    return null
  }
}