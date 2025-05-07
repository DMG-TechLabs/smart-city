
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Sun, CloudRain, Snowflake } from "lucide-react"

interface WeatherCardProps {
    location: string
    temperature: number
    description: string
    condition: "sunny" | "rainy" | "snowy"
}

const WeatherIcon = ({ condition }: { condition: WeatherCardProps["condition"] }) => {
    switch (condition) {
      case "sunny":
        return <Sun className="w-8 h-8 text-yellow-500" />
      case "rainy":
        return <CloudRain className="w-8 h-8 text-blue-500" />
      case "snowy":
        return <Snowflake className="w-8 h-8 text-sky-300" />
      default:
        return null
    }
}

export default function WeatherCard({
    location,
    temperature,
    description,
    condition,
  }: WeatherCardProps) {
    return (
      <Card className="w-72 shadow-lg rounded-2xl p-4 bg-white dark:bg-gray-900">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg font-semibold">{location}</CardTitle>
          <WeatherIcon condition={condition} />
          <h1>here</h1>
        </CardHeader>
        <CardContent className="space-y-1">
          <div className="text-4xl font-bold">{temperature}°C</div>
          <div className="text-sm text-muted-foreground">{description}</div>
        </CardContent>
      </Card>
    )
}
