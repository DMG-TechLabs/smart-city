"use client"

import { useEffect, useState } from "react"
import PocketBase from "pocketbase"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"

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
import { usePocketBase } from "@/context/DatabaseContext"

const chartConfig = {
  value: {
    label: "Value",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig

type LocalBarChartProps = {
  collection: string
  x: string
  y: string
  limit?: number // Optional: defaults to 10
}

export function LocalBarChart({ collection, x, y, limit = 10 }: LocalBarChartProps) {
  const [data, setData] = useState<any[]>([])

  useEffect(() => {
    const pb = usePocketBase();

    pb.collection(collection)
      .getList(1, limit, { sort: `-${x}` })
      .then((result) => {
        const mapped = result.items.map((r) => ({
          [x]: r[x],
          [y]: r[y],
        }))
        setData(mapped)
      })
      .catch((err) => {
        console.error("Failed to fetch chart data:", err)
      })
  }, [collection, x, y, limit])

  function capitalize(val: string) {
      return String(val).charAt(0).toUpperCase() + String(val).slice(1);
  }
  return (
    <Card className="w-90">
      <CardHeader>
        <CardTitle>{collection} Bar Chart</CardTitle>
        <CardDescription>
            {capitalize(y.replaceAll("_", " ").trim())} per {capitalize(x.replaceAll("_", " ").trim())}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart 
            accessibilityLayer 
            data={data}
            margin={{
              left: -45,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis dataKey={x} tickLine={false} tickMargin={10} />
            <YAxis />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Bar dataKey={y} fill="var(--color-value)" radius={8} />
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="leading-none text-muted-foreground">
          Showing {limit} most recent entries
        </div>
      </CardFooter>
    </Card>
  )
}
