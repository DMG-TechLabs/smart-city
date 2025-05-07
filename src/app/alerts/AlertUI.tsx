import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

import { Alert } from "../Alert.tsx";
import { ReactNode } from "react";

type AlertUIProps = {
  alert: Alert;
  onDelete?: () => void;
  onEdit?: () => void;
};

type AlertDialogProps = {
  title: string;
  desc: string;
  onCancel?: () => void;
  onContinue?: () => void;
  children: ReactNode;
};

export function AlertConfirmation({
  title,
  desc,
  onCancel,
  onContinue,
  children,
}: AlertDialogProps) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{desc}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onContinue}>Continue</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function AlertUI({ alert, onDelete, onEdit }: AlertUIProps) {
  return (
    <div className="alert-ui p-4 border rounded shadow bg-white mb-4 flex items-center justify-between text-left">
      <div>
        <h2 className="text-lg font-semibold">{alert.name}</h2>
        <p>
          Status:{" "}
          <span className={alert.enabled ? "text-green-600" : "text-red-600"}>
            {alert.enabled ? "Enabled" : "Disabled"}
          </span>
        </p>
        <p>
          Last Triggered:{" "}
          {alert.lastTriggered
            ? new Date(alert.lastTriggered).toLocaleString()
            : "Never"}
        </p>
        <p>
          Condition:{" "}
          <span className="text-gray-700">{alert.condition?.toString()}</span>
        </p>
      </div>

      <div className="flex flex-col gap-2 ml-4">
        <button
          onClick={onEdit}
          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Edit
        </button>

        <AlertConfirmation
          title="Are you sure?"
          desc="This action cannot be reversed"
          onContinue={onDelete}
        >
          <button className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600">
            Delete
          </button>
        </AlertConfirmation>
      </div>
    </div>
  );
}
