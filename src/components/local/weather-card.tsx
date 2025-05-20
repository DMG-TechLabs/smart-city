import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DeleteButton } from "./delete-button"
import { AlertComponent } from "./delete-dialog"
import { ConfirmationDialog } from "./confirmation-dialog"

interface WeatherCardProps {
    date: string,
    location: string
    temperature: number
    description: string
    icon: string
}

export default function WeatherCard({
    date,
    location,
    temperature,
    description,
    icon,
}: WeatherCardProps) {
    return (
        <Card className="w-72 shadow-lg rounded-2xl p-4 bg-white dark:bg-gray-900">
            <div className="date-container">
                {date}
            </div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg font-semibold">{location}</CardTitle>
                <img src={icon} alt="icon"></img>
            </CardHeader>
            <CardContent className="space-y-1">
                <div className="text-4xl font-bold">{temperature}°C</div>
                <div className="text-sm text-muted-foreground">{description}</div>
            </CardContent>
        </Card>
    )
}
