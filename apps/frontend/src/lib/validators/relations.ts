import { z } from "zod";

export const FollowUserSchema = z.object({
  followerId: z.string().min(1, "Follower id is required"),
  followingId: z.string().min(1, "Following id is required"),
});

export const CheckFollowSchema = FollowUserSchema;

export const FollowDataSchema = z.object({
  id: z.string().min(1, "User id is required"),
});
