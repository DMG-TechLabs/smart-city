
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ReactNode } from "react";
import { Button } from "../ui/button.tsx";

type CustomDialogProps = {
    title: string;
    desc: string;
    onClose?: () => void;
    children: ReactNode;
    trigger: ReactNode;
};

export function CustomDialog({ title, desc, onClose, children, trigger }: CustomDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {desc}
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center space-x-2">
            {children}
        </div>
        <DialogFooter className="sm:justify-start">
          <DialogClose onClick={onClose} asChild>
            <Button type="button" variant="secondary">
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
