import { ConfirmationDialog } from "@/components/local/confirmation-dialog.tsx";
import { Alert } from "../Alert.tsx";
import { CustomDialog } from "../../components/local/custom-dialog.tsx";
import { ReactNode, useState } from "react";
import { Switch } from "@/components/ui/switch.tsx"; // adjust path if needed

type AlertUIProps = {
  alert: Alert;
  onDelete?: () => void;
  onEdit?: () => void;
};

function AlertEdit(alert: Alert, onEdit?: () => void): ReactNode {
  const [enabled, setEnabled] = useState(alert.enabled);
  const [name, setName] = useState(alert.name);

  return (
    <form
      className="flex flex-col gap-3 w-full"
      onSubmit={(e) => {
        e.preventDefault();
        alert.enabled = enabled;
        alert.name = name;
        onEdit?.();
      }}
    >
      <label className="text-sm w-full">
        Name:
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 block w-full border rounded px-2 py-1"
        />
      </label>

      <label className="text-sm w-full">
        Condition:
        <input
          type="text"
          value={alert.condition?.toString() ?? ""}
          disabled
          className="mt-1 block w-full border rounded px-2 py-1 bg-gray-100 text-gray-500 cursor-not-allowed"
        />
      </label>

      <div className="flex items-center gap-2">
        <Switch
          id="enabled"
          checked={enabled}
          onCheckedChange={setEnabled}
        />
        <label htmlFor="enabled" className="text-sm">
          Enabled
        </label>
      </div>

      <button
        type="submit"
        className="mt-2 bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded"
        onClick={() => {
            alert.name = name;
            alert.enabled = enabled;
        }}
      >
        Save
      </button>
    </form>
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
        <CustomDialog
          title="Edit Alert"
          desc="Update the alert fields below"
          onClose={onEdit}
          trigger={
            <button className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600">
              Edit
            </button>
          }
        >
          {AlertEdit(alert, onEdit)}
        </CustomDialog>

        <ConfirmationDialog
          title="Are you sure?"
          desc="This action cannot be reversed"
          onContinue={onDelete}
        >
          <button className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600">
            Delete
          </button>
        </ConfirmationDialog>
      </div>
    </div>
  );
}
