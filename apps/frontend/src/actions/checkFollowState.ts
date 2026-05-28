"use server"

import z from "zod";
import { auth } from "@/auth";
import { ServerActionResult } from "@/lib/types";
import { CheckFollowSchema } from "@/lib/validators/relations";
import { backendUrl } from "@/lib/backend";

export const checkFollowState = async (
  followerId: string,
  followingId: string,
): Promise<ServerActionResult<boolean>> => {
  const parsed = CheckFollowSchema.safeParse({ followerId, followingId });

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
      backendUrl("/api/relations/check_follow"),
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(parsed.data),
      },
    );

    if (!res.ok) {
      return {
        success: false,
        error: { errors: ["Error checking follow state"] },
      };
    }

    const data: { isFollowing: boolean } = await res.json();
    return { success: true, data: data.isFollowing };
  } catch {
    return {
      success: false,
      error: { errors: ["Error checking follow state"] },
    };
  }
};
