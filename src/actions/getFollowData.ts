import { toast } from "sonner";

export const getFollowData = async (id: string) => {

  const res = await fetch(`/api/user/${id}/follow_data`, {
    method: 'GET',
  });

  if (res?.ok) {
    const data = await res.json();
  
    return data?.followData
  } else {
    toast.error(``, {
      description: `Error getting followers/folling data`,
      duration: 3000,
      action: {
        label: "Close",
        onClick: () => {},
      },
    })

    return null
  }
}