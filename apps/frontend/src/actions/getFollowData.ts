"use server"

import z from "zod";
import { auth } from "@/auth";
import { ServerActionResult } from "@/lib/types";
import { FollowDataSchema } from "@/lib/validators/relations";
import { backendUrl } from "@/lib/backend";

type FollowData = {
  followers_count: number;
  following_count: number;
};

export const getFollowData = async (
  id: string,
): Promise<ServerActionResult<FollowData>> => {
  const parsed = FollowDataSchema.safeParse({ id });

  if (!parsed.success) {
    return {
      success: false,
      error: z.treeifyError(parsed.error),
    };
  }

  const session = await auth();
  const accessToken = session?.accessToken;

  if (!accessToken) {
    return { success: false, error: { errors: ["Unauthorized"] } };
  }

  try {
    const res = await fetch(
      backendUrl(`/api/relations/${parsed.data.id}/follow_data`),
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (!res.ok) {
      return {
        success: false,
        error: { errors: ["Error getting followers/following data"] },
      };
    }

    const data: { followData: FollowData } = await res.json();
    return { success: true, data: data.followData };
  } catch {
    return {
      success: false,
      error: { errors: ["Error getting followers/following data"] },
    };
  }
};
