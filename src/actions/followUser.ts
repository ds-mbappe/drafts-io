import { toast } from "sonner";

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

    toast.success(``, {
      description: `User followed successfully`,
      duration: 3000,
      action: {
        label: "Close",
        onClick: () => {},
      },
    })
  
    return data
  } else {
    toast.error(``, {
      description: `Error following user`,
      duration: 3000,
      action: {
        label: "Close",
        onClick: () => {},
      },
    })

    return null
  }
}