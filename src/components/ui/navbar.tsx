"use client"

import { Navbar, NavbarBrand, NavbarContent, NavbarItem, Link, Button, Dropdown, DropdownTrigger, Avatar, DropdownMenu, DropdownItem, Switch, DropdownSection, useDisclosure, Input, Tooltip } from "@nextui-org/react";
import EditorInfo from './EditorInfo';
import { memo, useEffect, useState } from 'react';
import { PanelTopClose, PanelLeft, MoonIcon, SunIcon, CircleEllipsisIcon, Trash2Icon, ShareIcon, Share2Icon, PencilIcon, EyeIcon, PencilLineIcon } from 'lucide-react';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@nextui-org/react";
import HistoryDropdown from '../pannels/HistoryDropdown/HistoryDropdown';
import { signOut, getSession } from "next-auth/react";
import { useTheme } from "next-themes";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CreateNewDocument } from "../pannels/CreateNewDocument";

const NavbarApp = memo(({ characters, words, status, isSidebarOpen, toggleSidebar, historyData, provider, document }: any) => {
  const router = useRouter();
  const motionProps = {
    variants: {
      exit: {
        opacity: 0,
        transition: {
          duration: 0.15,
          ease: "easeIn",
        }
      },
      enter: {
        opacity: 1,
        transition: {
          duration: 0.15,
          ease: "easeOut",
        }
      },
    },
  }
  const { theme, setTheme } = useTheme();
  const [user, setUser] = useState<any>();
  const [docName, setDocName] = useState("");
  const [isViewMode, setIsViewMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [docPassword, setDocPassword] = useState("");
  const [docPrivate, setDocPrivate] = useState(false);
  const { isOpen, onOpen, onClose, onOpenChange } = useDisclosure();
  const { isOpen: isOpenEdit, onOpen: onOpenEdit, onClose: onCloseEdit, onOpenChange: onOpenChangeEdit } = useDisclosure();

  const onLogout = () => {
    signOut({
      callbackUrl: "/account/sign-in"
    });
  }

  const changeTheme = () => {
    if (theme === 'dark') {
      setTheme('light')
    } else if (theme === 'light') {
      setTheme('dark')
    }
  }

  const confirmAction = () => {
    // if (document?.creator_email === user?.email) {
    //   onDocumentDeleted(document)
    // } else {
    //   onDocumentRemoved(document)
    // }
    // onClose()
    // router.push("/app")
  }

  const handleSaveData = async () => {
    setIsLoading(true);

    let formData = {
      id: document?._id,
      name: docName,
      private: docPrivate,
      encrypted_password: docPassword,
    }

    const res = await fetch("/api/documents", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ formData }),
    })
    const data = await res.json()

    if (!res.ok) {
      throw new Error("Failed to update document.")
    }

    toast.success(`Document updated`, {
      description: `Successfully updated document ${docName}.`,
      duration: 5000,
      action: {
        label: "Close",
        onClick: () => {},
      },
    })
    onOpenChangeEdit();
    // onDocumentEdited(data?.document);
    setDocPassword("");
    setIsLoading(false);
  };

  useEffect(() => {
    const setDocument = () => {
      setDocName(document?.name);
      setDocPrivate(document?.private);
      setDocPassword(document?.password);
    }

    setDocument();
  }, [])

  useEffect(() => {
    const fetchSession = async () => {
      const response = await getSession()
      setUser(response?.user)
    }

    fetchSession().catch((error) => {
      console.log(error)
    })
  }, [])

  if (!user) return

  return (
    <>
      <Navbar isBordered maxWidth={"full"} className="bg-content1">
        <NavbarBrand className="flex gap-2">
          {/* Sidebar button */}
          <Tooltip
            content={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
            delay={0}
            closeDelay={0}
            motionProps={motionProps}
          >
            <Button isIconOnly size={"sm"} variant={"light"} onClick={toggleSidebar}>
              { isSidebarOpen ? <PanelTopClose className="-rotate-90" /> : <PanelLeft /> }
            </Button>
          </Tooltip>

          {/* Document options */}
          { document?._id ?
            <Dropdown placement="bottom-start">
              <DropdownTrigger>
                <Button isIconOnly size={"sm"} variant={"light"}>
                  <Tooltip
                    content={"Options"}
                    delay={0}
                    closeDelay={0}
                    motionProps={motionProps}
                  >
                    <CircleEllipsisIcon />
                  </Tooltip>
                </Button>
              </DropdownTrigger>

              <DropdownMenu aria-label="Document Actions" variant="flat">
                <DropdownItem
                  key="share"
                  startContent={<Share2Icon />}
                >
                  {'Share document'}
                </DropdownItem>

                <DropdownItem
                  key="export_document"
                  startContent={<ShareIcon />}
                >
                  {'Export document'}
                </DropdownItem>

                <DropdownItem
                  key="edit_document"
                  showDivider
                  onPress={onOpenEdit}
                  startContent={<PencilIcon />}
                >
                  {'Edit document settings'}
                </DropdownItem>

                <DropdownItem
                  key="delete_document"
                  color="danger"
                  onPress={onOpen}
                  startContent={<Trash2Icon className="text-danger" />}
                >
                  {'Delete document'}
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
            : <CreateNewDocument user={user} onDocumentSaved={() => null} />
          }

          {/* View mode button */}
          <Tooltip
            content={isViewMode ? "Edit mode" : "View mode"}
            delay={0}
            closeDelay={0}
            motionProps={motionProps}
          >
            <Button isIconOnly size={"sm"} variant={"light"} onClick={() => setIsViewMode(prev => !prev)}>
              { isViewMode ? <PencilLineIcon /> : <EyeIcon /> }
            </Button>
          </Tooltip>
        </NavbarBrand>

        <NavbarContent justify="end">
          {/* History dropdown */}
          { provider &&
            <NavbarItem>
              <HistoryDropdown
                provider={provider}
                historyData={historyData}
              />
            </NavbarItem>
          }

          {/* Status */}
          <NavbarItem>
            <div className="flex items-center justify-center gap-5">
              <div className="flex gap-2 items-center justify-center">
                <div className={`w-2 h-2 rounded-full flex gap-1 items-center justify-center ${status === 'Synced' ? 'bg-green-500' : status === 'Not Synced' ? 'bg-red-500' : 'bg-yellow-500'}`} />

                <span className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                  { status }
                </span>
              </div>

              {/* <div className="h-8 border-r" /> */}

              {/* <EditorInfo words={words} characters={characters} /> */}
            </div>
          </NavbarItem>
          
          {/* Avatar */}
          <NavbarItem>
            <Dropdown placement="bottom-end">
              <DropdownTrigger>
                <Avatar
                  isBordered
                  as="button"
                  color="primary"
                  name={user?.email?.split("")?.[0]?.toUpperCase()}
                  size="sm"
                  src={user?.image}
                />
              </DropdownTrigger>

              <DropdownMenu aria-label="Profile Actions" variant="flat">
                <DropdownItem key="profile" className="h-14 gap-2" textValue={`Signed in as ${user?.email}`}>
                  <p className="font-semibold">{'Signed in as'}</p>
                  
                  <p className="font-semibold">{user?.email}</p>
                </DropdownItem>

                <DropdownItem key="dark_mode" textValue={'Dark mode'} onClick={changeTheme}>  
                  <div className="flex gap-1 items-center">
                    <Button isIconOnly size={"sm"} variant={"light"}>
                      {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
                    </Button>
                    
                    <p className="font-semibold">
                      {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                    </p>
                  </div>
                </DropdownItem>

                <DropdownItem key="settings">{'My Settings'}</DropdownItem>

                <DropdownItem key="help_and_feedback">{'Help & Feedback'}</DropdownItem>

                <DropdownItem key="logout" className="text-danger" color="danger" onClick={onLogout}>{'Log Out'}</DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </NavbarItem>
        </NavbarContent>
      </Navbar>

      {/* Edit document settings */}
      <Modal isOpen={isOpenEdit} placement="center" onOpenChange={onOpenChangeEdit}>
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">{'Update document details'}</ModalHeader>

          <ModalBody>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="doc-title" className="text-right">{'Title'}</Label>

                <Input variant='bordered' id="doc-title" autoComplete="new-password" className="col-span-3" value={docName} onChange={(e) => setDocName(e?.target?.value)} />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="doc-private" className="text-right">{'Private'}</Label>

                <Switch id="doc-private" isSelected={docPrivate} onValueChange={() => setDocPrivate(!docPrivate)} className="col-span-3" />
              </div>
              { docPrivate ?
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="doc-password" className="text-right">{'Password'}</Label>
                  
                  <Input variant='bordered' id="doc-password" autoComplete="new-password" type="password" placeholder="Document password" className="col-span-3" value={docPassword} onChange={(e) => setDocPassword(e?.target?.value)} />
                </div> : <></>
              }
            </div>
          </ModalBody>

          <ModalFooter>
            <Button color="danger" variant="light" onPress={onOpenChangeEdit}>
              {'Cancel'}
            </Button>

            <Button isLoading={isLoading} isDisabled={!docName} color="primary" onPress={handleSaveData}>
              {'Update'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Delete document */}
      <Modal isOpen={isOpen} placement="center" onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                { document?.creator_email === user?.email ? "Delete document" : "Remove Document" }
              </ModalHeader>

              <ModalBody>
                <p> 
                  { document?.creator_email === user?.email ?
                    "If you delete this document, other users who have added it will no longer be able to access it" :
                    "If you remove this document, you will need to import it again in the future."
                  }
                </p>
              </ModalBody>

              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  {'Cancel'}
                </Button>

                <Button color="primary" onPress={confirmAction}>
                  { document?.creator_email === user?.email ? "Delete" : "Remove" }
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  )
})

NavbarApp.displayName = 'NavbarApp'

export default NavbarApp