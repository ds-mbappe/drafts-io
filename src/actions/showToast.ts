import { toast } from "sonner"

const successToast = (text: string) => {
  toast.success(``, {
    position: "top-right",
    description: text,
    duration: 3000,
    action: {
      label: "Close",
      onClick: () => {},
    },
  })
}

const infoToast = (text: string) => {
  toast.info(``, {
    position: "top-right",
    description: text,
    duration: 3000,
    action: {
      label: "Close",
      onClick: () => {},
    },
  })
}

const errorToast = (text: string) => {
  toast.error(`Error`, {
    position: "top-right",
    description: text,
    duration: 3000,
    action: {
      label: "Close",
      onClick: () => {},
    },
  })
}

export { infoToast, successToast, errorToast }