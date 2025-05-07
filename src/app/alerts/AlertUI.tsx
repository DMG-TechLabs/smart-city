import { Alert } from "../Alert.tsx";

type AlertUIProps = {
    alert: Alert;
};

export function AlertUI({ alert }: AlertUIProps) {
    return (
        <div className="alert-ui p-4 border rounded shadow bg-white mb-4">
            <h2 className="text-lg font-semibold">{alert.name}</h2>
            <p>Status: <span className={alert.enabled ? "text-green-600" : "text-red-600"}>
                {alert.enabled ? "Enabled" : "Disabled"}
            </span></p>
            <p>
                Last Triggered:{" "}
                {alert.lastTriggered
                    ? new Date(alert.lastTriggered).toLocaleString()
                    : "Never"}
            </p>
            <p>
                Condition:{" "}
                <span className="text-gray-700">
                    {alert.condition.toString()}
                </span>
            </p>
        </div>
    );
}
