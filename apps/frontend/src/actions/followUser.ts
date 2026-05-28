"use server"

import z from "zod";
import { auth } from "@/auth";
import { ServerActionResult } from "@/lib/types";
import { FollowUserSchema } from "@/lib/validators/relations";
import { backendUrl } from "@/lib/backend";

type FollowUserResponse = {
  followed: boolean;
};

export const followUser = async (
  followerId: string,
  followingId: string,
): Promise<ServerActionResult<FollowUserResponse>> => {
  const parsed = FollowUserSchema.safeParse({ followerId, followingId });

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
      backendUrl("/api/relations/follow"),
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
        error: { errors: ["Error following user"] },
      };
    }

    const data: FollowUserResponse = await res.json();
    return { success: true, data };
  } catch {
    return {
      success: false,
      error: { errors: ["Error following user"] },
    };
  }
};
