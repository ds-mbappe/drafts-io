"use client"

import { Navbar, NavbarBrand, NavbarContent, NavbarItem, Button, Dropdown, DropdownTrigger, Avatar, DropdownMenu, DropdownItem, Switch, DropdownSection, useDisclosure, Input, Tooltip, Textarea, Select, SelectItem } from "@nextui-org/react";
import EditorInfo from './EditorInfo';
import { memo, useEffect, useState } from 'react';
import { PanelTopClose, PanelLeft, MoonIcon, SunIcon, CircleEllipsisIcon, Trash2Icon, ShareIcon, Share2Icon, PencilIcon, EyeIcon, PencilLineIcon, HomeIcon, BookPlusIcon } from 'lucide-react';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@nextui-org/react";
import HistoryDropdown from '../pannels/HistoryDropdown/HistoryDropdown';
import { signOut, getSession } from "next-auth/react";
import { useTheme } from "next-themes";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CreateNewDocument } from "../pannels/CreateNewDocument";
import ExtensionKit from "../editor/extensions/extension-kit";
import { EditorContent, useEditor } from "@tiptap/react";
import Link from "next/link";

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
  const [docTitle, setDocTitle] = useState("");
  const [docCaption, setDocCaption] = useState("")
  const [docTopic, setDocTopic] = useState("")
  const [docLocked, setDocLocked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { isOpen, onOpen, onClose, onOpenChange } = useDisclosure();
  const { isOpen: isOpenEdit, onOpen: onOpenEdit, onClose: onCloseEdit, onOpenChange: onOpenChangeEdit } = useDisclosure();
  const { isOpen: isOpenPublish, onOpen: onOpenPublish, onClose: onClosePublish, onOpenChange: onOpenChangePublish } = useDisclosure();
  const { isOpen: isOpenPreviewDoc, onOpen: onOpenPreviewDoc, onClose: onClosePreviewDoc, onOpenChange: onOpenChangePreviewDoc } = useDisclosure();

  const topics = [
    "World News",
    "Politics",
    "Business",
    "Technology",
    "Science",
    "Health",
    "Entertainment",
    "Sports",
    "Travel",
    "Lifestyle",
    "Environment",
    "Education",
    "Food & Drink",
    "Culture",
    "Fashion",
    "Finance",
    "Real Estate",
    "Automotive",
    "Gaming",
    "Opinion"
  ]

  const editor = useEditor({
    editable: false,
    immediatelyRender: false,
    shouldRerenderOnTransaction: false,
    content: document?.content,
    extensions: [
      ...ExtensionKit(),
    ],
    editorProps: {
      attributes: {
        autocomplete: 'off',
        autocorrect: 'off',
        autocapitalize: 'off',
        class: 'min-h-full !pt-0 !pr-0 !pb-0 !pl-0 overflow-y-auto',
      },
    },
  });

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

  const onPublishDocument = async() => {
    setIsLoading(true);

    let formData = {
      id: document?._id,
      private: !document?.private,
    }

    const res = await fetch(`/api/documents/${user?.email}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ formData }),
    });

    if (!res.ok) {
      toast.error(`Error`, {
        description: `An error occurred, please try again.`,
        duration: 5000,
        important: true,
      })
    } else {
      toast.success(`Sucess`, {
        description: document?.private ? `Your document is now available for everyone.` : `Your document has been removed from the public space.`,
        duration: 5000,
        action: {
          label: "Close",
          onClick: () => {},
        },
      })
    }
    setIsLoading(false);
    onOpenChangePublish()
  }

  const handleSaveData = async () => {
    setIsLoading(true);

    let formData = {
      id: document?._id,
      title: docTitle,
      topic: docTopic,
      caption: docCaption,
    }

    const response = await fetch("/api/documents", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ formData }),
    })
    const data = await response.json()

    if (!response.ok) {
      toast.error(`Error`, {
        description: `An error occured, please try again !`,
        duration: 5000,
        action: {
          label: "Close",
          onClick: () => {},
        },
      })
    } else {
      toast.success(`Document updated`, {
        description: `Successfully updated document ${docTitle}.`,
        duration: 5000,
        action: {
          label: "Close",
          onClick: () => {},
        },
      })
      onOpenChangeEdit();
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const setDocument = () => {
      setDocTitle(document?.title);
      setDocCaption(document?.caption);
      setDocTopic(document?.topic);
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
          <Button isIconOnly size={"sm"} variant={"light"} onClick={() => router.push('/')}>
            <HomeIcon />
          </Button>

          {/* Sidebar button */}
          {/* <Tooltip
            content={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
            delay={0}
            closeDelay={0}
            motionProps={motionProps}
          >
            <Button isIconOnly size={"sm"} variant={"light"} onClick={toggleSidebar}>
              { isSidebarOpen ? <PanelTopClose className="-rotate-90" /> : <PanelLeft /> }
            </Button>
          </Tooltip> */}

          {/* Document options */}
          { document?._id && document?.creator_email === user?.email ?
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
                  key="publish"
                  startContent={<BookPlusIcon />}
                  onClick={onOpenChangePublish}
                >
                  {document?.private ? 'Publish document' : 'Unpublish document'}
                </DropdownItem>

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
          {document?._id && document?.creator_email === user?.email ?
            <Tooltip
              content={"Preview document"}
              delay={0}
              closeDelay={0}
              motionProps={motionProps}
            >
              <Button isIconOnly size={"sm"} variant={"light"} onClick={onOpenPreviewDoc}>
                <EyeIcon />
              </Button>
            </Tooltip>
            : <></>
          }
        </NavbarBrand>

        <NavbarContent justify="end">
          {/* History dropdown */}
          { provider && document?.creator_email === user?.email ?
            <NavbarItem>
              <HistoryDropdown
                provider={provider}
                historyData={historyData}
              />
            </NavbarItem> : <></>
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

                <Input variant='bordered' id="doc-title" autoComplete="new-password" className="col-span-3" value={docTitle} onChange={(e) => setDocTitle(e?.target?.value)} />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="doc-caption" className="text-right">{'Caption'}</Label>

                <Textarea
                  id="doc-caption"
                  minRows={1}
                  maxRows={10}
                  value={docCaption}
                  variant="bordered"
                  className="col-span-3"
                  placeholder="Document caption"
                  onChange={(e) => setDocCaption(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="doc-topic" className="text-right">{'Topic'}</Label>

                <Select 
                  id="doc-topic"
                  variant="bordered"
                  aria-label="doc-topic"
                  className="col-span-3"
                  value={docTopic}
                  placeholder="Select a topic"
                  onChange={(e) => setDocTopic(e.target.value)}
                >
                  {topics.map((topic) => (
                    <SelectItem key={topic}>
                      {topic}
                    </SelectItem>
                  ))}
                </Select>
              </div>
            </div>
          </ModalBody>

          <ModalFooter>
            <Button color="danger" variant="light" onPress={onOpenChangeEdit}>
              {'Cancel'}
            </Button>

            <Button isLoading={isLoading} isDisabled={!(docTitle && docCaption && docTopic)} color="primary" onPress={handleSaveData}>
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

      {/* Modal Preview Document */}
      <Modal hideCloseButton scrollBehavior="inside" isOpen={isOpenPreviewDoc} placement="center" size="3xl" onOpenChange={onOpenChangePreviewDoc}>
        <ModalContent>
          {(onClosePreviewDoc) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                {"Preview of "} {document?.title}
              </ModalHeader>

              <ModalBody className="!px-4 !py-0 overflow-y-auto">
                <EditorContent editor={editor} />
              </ModalBody>

              <ModalFooter>
                <Button color="primary" variant="light" onPress={onClosePreviewDoc}>
                  {'Close'}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Publish document */}
      <Modal isOpen={isOpenPublish} placement="center" onOpenChange={onOpenChangePublish}>
        <ModalContent>
          {(onClosePublish) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                { document?.private ? "Publish document" : "Unpublish document" }
              </ModalHeader>

              <ModalBody className="flex flex-col gap-4">
                {document?.private ?
                  <p className="text-foreground-500">
                    {"By default, all your documents are private, that means they are only visible to you and you only. If you choose to publish your document, users from around the world will be able to see it."}
                  </p> :
                  <p className="text-foreground-500">
                    {"If you choose to unpublish your document, if will be unavailable to the public."}
                  </p>
                }

                {/* <div className="flex items-center gap-4">
                  <Label htmlFor="doc-locked" className="text-right">{'Locked'}</Label>

                  <Switch id="doc-private" isSelected={docLocked} onValueChange={() => setDocLocked(!docLocked)} />
                </div> */}
              </ModalBody>

              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClosePublish}>
                  {'Cancel'}
                </Button>

                <Button isLoading={isLoading} color="primary" onPress={onPublishDocument}>
                  { document?.private ? "Publish" : "Unpublish" }
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