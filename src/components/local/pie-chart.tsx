"use client"

import { useEffect, useState } from "react"
import PocketBase from "pocketbase"
import { TrendingUp } from "lucide-react"
import { Pie, PieChart } from "recharts"

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
  field: string
  limit?: number
}

const pb = new PocketBase("http://127.0.0.1:8090") // change to your PocketBase URL

export function LocalPieChart({ collection, field, limit = 5 }: Props) {
  const [data, setData] = useState<any[]>([])
  const [config, setConfig] = useState<ChartConfig>({})

  useEffect(() => {
    async function loadData() {
      try {
        // Fetch up to 100 records from PocketBase collection
        const records = await pb.collection(collection).getFullList(100, {
          sort: "-" + field, // optional sorting by field descending
        })

        // Count occurrences of each unique field value
        const counts: Record<string, number> = {}
        for (const record of records) {
          const key = record[field] ?? "Unknown"
          counts[key] = (counts[key] || 0) + 1
        }

        // Sort and limit to most frequent values
        const sorted = Object.entries(counts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, limit)

        const colors = [
          "--chart-1",
          "--chart-2",
          "--chart-3",
          "--chart-4",
          "--chart-5",
          "--chart-6",
          "--chart-7",
        ]

        const chartData = sorted.map(([key, count], i) => ({
          name: key,
          value: count,
          fill: `hsl(var(${colors[i % colors.length]}))`,
        }))

        const chartConfig: ChartConfig = {
          value: { label: "Count" },
        }

        chartData.forEach((item) => {
          chartConfig[item.name] = {
            label: item.name,
            color: item.fill,
          }
        })

        setData(chartData)
        setConfig(chartConfig)
      } catch (err) {
        console.error("Failed to fetch pie chart data:", err)
      }
    }

    loadData()
  }, [collection, field, limit])

  function capitalize(val) {
      return String(val).charAt(0).toUpperCase() + String(val).slice(1);
  }

  return (
    <Card className="w-90 flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>{collection} Pie Chart</CardTitle>
        <CardDescription>
            {capitalize(field.replaceAll("_", " ").trim())}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={config}
          className="mx-auto aspect-square max-h-[250px] pb-0 [&_.recharts-pie-label-text]:fill-foreground"
        >
          <PieChart>
            <ChartTooltip content={<ChartTooltipContent hideLabel />} />
            <Pie data={data} dataKey="value" nameKey="name" label />
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="leading-none text-muted-foreground">
          Showing top {limit} categories by frequency
        </div>
      </CardFooter>
    </Card>
  )
}
