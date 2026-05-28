import React from 'react';
import { Button, Avatar, Skeleton } from "@heroui/react";

const UserItemInList = ({ avatar, username, firstname, lastname, loading }: {
  avatar: string | undefined,
  username: string | undefined,
  firstname: string | undefined,
  lastname: string | undefined
  loading: boolean
}) => {
  return (
    <div className="w-full">
      {
        loading ?
        <div className="max-w-[350px] w-full flex items-center gap-3">
        <div>
          <Skeleton className="flex rounded-full w-8 h-8" />
        </div>
        <div className="w-full flex flex-col gap-2">
          <Skeleton className="h-3 w-3/5 rounded-lg" />
          <Skeleton className="h-3 w-4/5 rounded-lg" />
        </div>
      </div> :
      <Button variant="ghost" className="w-full h-fit px-3 py-1 justify-start rounded-none">
        <div className="flex items-center gap-2 w-full min-w-0">
          <Avatar
            color="accent"
            className="w-8 h-8 shrink-0"
          >
            <Avatar.Image src={avatar} />
            <Avatar.Fallback>{firstname?.split("")?.[0]?.toUpperCase()}</Avatar.Fallback>
          </Avatar>

          <div className="flex flex-col items-start min-w-0 text-left">
            <p className="font-semibold text-sm truncate w-full">{`${firstname} ${lastname}`}</p>
            <p className="text-sm text-foreground-500 truncate w-full">@{username}</p>
          </div>
        </div>
      </Button>
      }
    </div>
  )
}

UserItemInList.displayName = 'UserItemInList'

export default UserItemInList