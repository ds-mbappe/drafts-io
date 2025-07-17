// components/CustomDrawer.tsx
import { createPortal } from "react-dom";
import { memo, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@heroui/react";
import Icon from "../ui/Icon";

type Placement = "top" | "bottom" | "left" | "right";

interface CustomDrawerProps {
  open: boolean;
  title?: string,
  children: React.ReactNode;
  placement?: Placement;
  heightPercent?: number; // between 0.0 and 1.0
  onClose: () => void;
}

const placementStyles = {
  top: "top-0 left-0 w-full",
  bottom: "bottom-0 left-0 w-full",
  left: "left-0 tbottom-0 h-[calc(100dvh-128px)]",
  right: "right-0 bottom-0 h-[calc(100dvh-128px)]",
};

const radiusClasses = {
  top: "rounded-b-[12px] border-t border-divider",
  bottom: "rounded-t-[12px] border-t border-divider",
  left: "rounded-r-[12px] border-t border-r border-divider",
  right: "rounded-l-[12px] border-t border-l border-divider",
};

const drawerVariants = {
  top: { hidden: { y: "-100%" }, visible: { y: 0 } },
  bottom: { hidden: { y: "100%" }, visible: { y: 0 } },
  left: { hidden: { x: "-100%" }, visible: { x: 0 } },
  right: { hidden: { x: "100%" }, visible: { x: 0 } },
};

export function CustomDrawer({
  open,
  title,
  children,
  placement = "right",
  heightPercent = 1,
  onClose
}: CustomDrawerProps) {
  const [mounted, setMounted] = useState(false);
  const MemoButton = memo(Button);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isVertical = placement === "top" || placement === "bottom";
  const style = isVertical
    ? { height: `${heightPercent * 100}vh` }
    : { width: `${heightPercent * 100}vw` };

  const content = (
    <AnimatePresence>
      {open && (
        <>
          {/* Transparent backdrop */}
          <div className="fixed inset-0 pointer-events-none bg-transparent z-40" />

          {/* Drawer panel */}
          <motion.div
            className={`fixed flex flex-col z-50 bg-background shadow-xl overflow-hidden ${placementStyles[placement]} ${
              radiusClasses[placement]
            }`}
            style={{
              ...style,
            }}
            initial="hidden"
            animate="visible"
            exit="hidden"
            transition={{ type: "spring", stiffness: 300, damping: 30, duration: 0.1 }}
            variants={drawerVariants[placement]}
          >
            <div className="w-full h-14 p-4 flex justify-between items-center border-b border-divider">
              <p className="text-base font-medium text-foreground">
                {title}
              </p>

              <MemoButton variant="light" size="sm" onPress={onClose} color="default" isIconOnly>
                <Icon name="X" className="text-foreground-500" />
              </MemoButton>
            </div>

            <div className="flex flex-col overflow-y-auto flex-1">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  if (!mounted) return null;

  return createPortal(content, document.body);
}
