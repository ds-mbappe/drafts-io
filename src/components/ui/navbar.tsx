"use client"

import { ExitIcon, PersonIcon } from '@radix-ui/react-icons'
import { useUser, useAuth } from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";
import { DragHandleHorizontalIcon } from "@radix-ui/react-icons";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export default function Navbar() {
  const { user } = useUser();
  const { signOut } = useAuth();

  const onUserLogout = () => {
    signOut();
  };

  return (
    <nav className="w-full h-14 flex items-center justify-between sticky top-0 z-40 bg-white px-4 border-b">
      <Sheet>
        <SheetTrigger asChild>
          <Button size={"sm"} variant={"ghost"} >
            <DragHandleHorizontalIcon />
          </Button>
        </SheetTrigger>
        <SheetContent className="w-72" side={"left"}>
          Hehehe
        </SheetContent>
      </Sheet>
      
      { user?.imageUrl ?
        <>
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Avatar className="border-2 border-black cursor-pointer">
                <AvatarImage src={user?.imageUrl} />
                <AvatarFallback>
                  { `${user?.firstName || "A" + user?.lastName}` }
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent className='w-56'>
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="gap-4 cursor-pointer">
                {/* <PersonIcon/> */}
                Profile
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="gap-4 hover:!bg-red-100 hover:!text-red-500 cursor-pointer" onClick={onUserLogout}>
                <ExitIcon/>
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </> : <></>
      }
    </nav>
  )
}
