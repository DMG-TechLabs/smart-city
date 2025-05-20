"use client"

import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"

import { cn } from "@/lib/utils"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./card"
import { Label } from "recharts"
import { Button } from "./button"
import { Input } from "./input"
import { CheckboxDemo } from "./checkbox"
import { title } from "process"
import { CollectionSelector } from "../local/collection-selector"
import { FieldsSelector } from "../local/fields-selector"
import { useState } from "react"

function Tabs({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      className={cn("flex flex-col gap-2", className)}
      {...props}
    />
  )
}

function TabsList({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={cn(
        "bg-muted text-muted-foreground inline-flex h-9 w-fit items-center justify-center rounded-lg p-[3px]",
        className
      )}
      {...props}
    />
  )
}

function TabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        "data-[state=active]:bg-background dark:data-[state=active]:text-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:outline-ring dark:data-[state=active]:border-input dark:data-[state=active]:bg-input/30 text-foreground dark:text-muted-foreground inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-md border border-transparent px-2 py-1 text-sm font-medium whitespace-nowrap transition-[color,box-shadow] focus-visible:ring-[3px] focus-visible:outline-1 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:shadow-sm [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    />
  )
}

function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn("flex-1 outline-none", className)}
      {...props}
    />
  )
}

type WidgetListProps = {
  selectedCollection: string;
  selectedField: string;
  selectedField2: string;
  addLineWidget?: () => void;
  addBarWidget?: () => void;
  addPieWidget?: () => void;
  addWeatherWidget?: () => void;
};

export { Tabs, TabsList, TabsTrigger, TabsContent }

export function TabsDemo({
  selectedCollection,
  selectedField,
  selectedField2,
  addLineWidget,
  addBarWidget,
  addPieWidget,
  addWeatherWidget
}: WidgetListProps) {
    const [selectedCollectionTemp, setSelectedCollectionTemp] = useState("");
    const [selectedFieldTemp, setSelectedFieldTemp] = useState("");
    const [selectedField2Temp, setSelectedField2Temp] = useState("");

    function updateSelectedCollection(collection: string) {
        setSelectedCollectionTemp(collection);
        selectedCollection = collection;
    }

    function updateSelectedField(field: string) {
        setSelectedFieldTemp(field);
        selectedField = field;
    }

    function updateSelectedField2(field: string) {
        setSelectedField2Temp(field);
        selectedField2 = field;
    }
  
  return (
    <Tabs defaultValue="line" className="w-[400px]">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="line">Line</TabsTrigger>
        <TabsTrigger value="bar">Bar</TabsTrigger>
        <TabsTrigger value="pie">Pie</TabsTrigger>
        <TabsTrigger value="weather">Weather</TabsTrigger>
      </TabsList>
      <TabsContent value="line">
        <Card>
          <CardHeader>
            <CardTitle>Line Chart</CardTitle>
            <CardDescription>
              
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <CollectionSelector value={selectedCollectionTemp} placeholder="Collection" onValueChange={(value) => setSelectedCollectionTemp(value)}/>
            <FieldsSelector collectionName={selectedCollectionTemp} value={selectedFieldTemp} placeholder="Field" onValueChange={(value) => setSelectedFieldTemp(value)}/>
            <FieldsSelector collectionName={selectedCollectionTemp} value={selectedField2Temp} placeholder="Field" onValueChange={(value) => setSelectedField2Temp(value)}/>
          </CardContent>
          <CardFooter>
            <Button onClick={addLineWidget}>Add Line Chart</Button>
          </CardFooter>
        </Card>
      </TabsContent>
      <TabsContent value="bar">
        <Card>
          <CardHeader>
            <CardTitle>Bar Chart</CardTitle>
            <CardDescription>

            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <CollectionSelector value={selectedCollectionTemp} placeholder="Collection" onValueChange={(value) => setSelectedCollectionTemp(value)}/>
            <FieldsSelector collectionName={selectedCollectionTemp} value={selectedFieldTemp} placeholder="Field" onValueChange={(value) => setSelectedFieldTemp(value)}/>
            <FieldsSelector collectionName={selectedCollectionTemp} value={selectedField2Temp} placeholder="Field" onValueChange={(value) => setSelectedField2Temp(value)}/>
          </CardContent>
          <CardFooter>
            <Button onClick={addBarWidget}>Add Bar Chart</Button>
          </CardFooter>
        </Card>
      </TabsContent>
      <TabsContent value="pie">
        <Card>
          <CardHeader>
            <CardTitle>Pie Chart</CardTitle>
            <CardDescription>
              
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <CollectionSelector value={selectedCollectionTemp} placeholder="Collection" onValueChange={(value) => setSelectedCollectionTemp(value)}/>
            <FieldsSelector collectionName={selectedCollectionTemp} value={selectedFieldTemp} placeholder="Field" onValueChange={(value) => setSelectedFieldTemp(value)}/>
          </CardContent>
          <CardFooter>
            <Button onClick={addPieWidget}>Add Pie Chart</Button>
          </CardFooter>
        </Card>
      </TabsContent>
      <TabsContent value="weather">
        <Card>
          <CardHeader>
            <CardTitle>Weather</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button onClick={addWeatherWidget}>Add Weather</Button>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
