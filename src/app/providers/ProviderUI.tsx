import { ConfirmationDialog } from "@/components/local/confirmation-dialog.tsx";
import { Api } from "../Api.tsx";

type ProviderUIProps = {
  provider: Api;
  onDelete?: () => void;
};

export function ProviderUI({ provider, onDelete }: ProviderUIProps) {
  return (
    <div className="provider-ui p-4 border rounded shadow bg-white mb-4 flex items-center justify-between text-left">
      <div>
        <h2 className="text-lg font-semibold">{provider.provider}</h2>
        <p>
          Endpoint: {provider.endpoint}
        </p>
      </div>

      <div className="flex flex-col gap-2 ml-4">
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
