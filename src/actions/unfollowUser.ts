import { toast } from "sonner"

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

    toast.success(``, {
      description: `User unfollowed successfully`,
      duration: 3000,
      action: {
        label: "Close",
        onClick: () => {},
      },
    })
    
    return data
  } else {
    toast.error(``, {
      description: `Error unfollowing user`,
      duration: 3000,
      action: {
        label: "Close",
        onClick: () => {},
      },
    })

    return null
  }
}