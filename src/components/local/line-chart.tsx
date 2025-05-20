"use client"

import { useEffect, useState } from "react"
import PocketBase from "pocketbase"
import { TrendingUp } from "lucide-react"
import { CartesianGrid, Line, LineChart, XAxis } from "recharts"
import { usePocketBase } from "@/context/DatabaseContext.tsx";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

type Props = {
  collection: string
  x: string
  y: string
  limit?: number
}
const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig

export function LocalLineChart({ collection, x, y, limit = 100 }: Props) {
  const pb = usePocketBase();

  const [chartData, setChartData] = useState<any[]>([])

  useEffect(() => {
    async function loadData() {
      try {
        const records = await pb.collection(collection).getFullList(limit, {
          sort: `+${x}`,
        })

        const formattedData = records.map((record) => ({
          [x]: record[x],
          [y]: record[y],
        }))

        setChartData(formattedData)
      } catch (error) {
        console.error("Failed to load chart data:", error)
      }
    }

    loadData()
  }, [collection, x, y, limit])

  function capitalize(val) {
      return String(val).charAt(0).toUpperCase() + String(val).slice(1);
  }

  return (
    <Card className="w-90">
      <CardHeader>
        <CardTitle>{collection} Line Chart</CardTitle>
        <CardDescription>
            {capitalize(y.replaceAll("_", " ").trim())} per {capitalize(x.replaceAll("_", " ").trim())}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <LineChart
            data={chartData}
            margin={{ left: 12, right: 12 }}
          >
            <CartesianGrid vertical={true} />
            <XAxis
              dataKey={x}
              tickLine={true}
              axisLine={true}
              tickMargin={8}
              tickFormatter={(value) =>
                typeof value === "string" ? value.slice(0, 3) : value
              }
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Line
              dataKey={y}
              type="natural"
              stroke="var(--color-desktop)"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="leading-none text-muted-foreground">
        </div>
      </CardFooter>
    </Card>
  )
}
