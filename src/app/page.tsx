"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import "@/styles/dashboard.css";
import { utils, SlotItemMapArray, createSwapy, Swapy } from "swapy";
import WeatherCard from "@/components/local/weather-card";
import { WidgetList } from "@/components/local/widget-list";
import { LocalBarChart } from "@/components/local/bar-chart";
import { LocalLineChart } from "@/components/local/line-chart";
import { LocalPieChart } from "@/components/local/pie-chart";
import { Trash, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import "@/styles/swapy.css"
import { ScrollArea } from "@radix-ui/react-scroll-area";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CollectionSelector } from "@/components/local/collection-selector";
import { FieldsSelector } from "@/components/local/fields-selector";

type Item = {
  id: string;
  title: string;
  type: "line" | "bar" | "pie" | "weather";
  collection: string;
  field: string;
  field2: string;
};

const initialItems: Item[] = [
  // { id: "1", title: "Line Chart", type: "line" },
  // { id: "2", title: "Bar Chart", type: "bar" },
  // { id: "3", title: "Pie Chart", type: "pie" },
  // { id: "4", title: "Weather", type: "weather" }
];

export default function Home() {
  const [selectedCollection, setSelectedCollection] = useState("");
  const [selectedField, setSelectedField] = useState("");
  const [selectedField2, setSelectedField2] = useState("");

  const [items, setItems] = useState<Item[]>(initialItems);
  const [slotItemMap, setSlotItemMap] = useState<SlotItemMapArray>(utils.initSlotItemMap(items, "id"));
  const slottedItems = useMemo(() => utils.toSlottedItems(items, "id", slotItemMap), [items, slotItemMap]);
  const swapyRef = useRef<Swapy | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Weather Widget values
  const [dateTime, setDateTime] = useState<string | null>(null);
  const [weatherLocation, setWeatherLocation] = useState<string | null>(null);
  const [weatherDescription, setWeatherDescription] = useState<string | null>(null);
  const [weathererature, setWeathererature] = useState<string | null>(null);
  const [weatherIcon, setWeatherIcon] = useState<string | null>(null);

  useEffect(() => utils.dynamicSwapy(swapyRef.current, items, "id", slotItemMap, setSlotItemMap), [items]);
  useEffect(() => {
    swapyRef.current = createSwapy(containerRef.current!, {
      manualSwap: true,
      animation: "dynamic",
      swapMode: "drop",
      autoScrollOnDrag: true,
      enabled: true,
      dragAxis: "xy",
      dragOnHold: false
    });

    swapyRef.current.onSwap((event) => {
      setSlotItemMap(event.newSlotItemMap.asArray);
    });

    return () => {
      swapyRef.current?.destroy();
    };
  }, []);

  useEffect(() => {
    async function fetchTime(): Promise<object | null> {
      const response = await fetch("/api/time");
      if (!response.ok) return null;
      return await response.json();
    }

    async function fetchWeather(): Promise<object | null> {
      const response = await fetch("/api/weather");
      if (!response.ok) return null;
      return await response.json();
    }

    fetchTime().then((data) => {
      if (data && "timestamp" in data) {
        const unixSeconds = (data as any).timestamp;
        const date = new Date(unixSeconds * 1000);
        const weekday = date.toLocaleDateString("en-US", { weekday: "long" });
        const day = date.getDate();
        const month = date.toLocaleDateString("en-US", { month: "long" });
        const year = date.getFullYear();
        const formatted = `${weekday} ${day} ${month} ${year}`;
        setDateTime(formatted);
      }
    });

    fetchWeather().then((data) => {
      if (!data) return;
      const d = data as any;
      setWeathererature(d.current._c);
      setWeatherLocation(d.location.name);
      setWeatherDescription(d.current.condition.text);
      setWeatherIcon(d.current.condition.icon);
    });
  }, []);

  const addWidget = (type: Item["type"], title: string, collection: string, field: string, field2: string) => {
    const newItem: Item = {
      id: `${Date.now()}`,
      title,
      type,
      collection,
      field,
      field2
    };
    setItems([...items, newItem]);
  };

  return (
    <div className="main-content">
      <ScrollArea className="widget-container">
        <Sheet>
          <SheetTrigger asChild>
            <Button id="widget-button">Available Widgets</Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[450px] !max-w-[500px]">
            <SheetHeader>
              <SheetTitle>Available widgets</SheetTitle>
              <SheetDescription>
                Here are all the available widgets to show in the dashboard.
              </SheetDescription>
            </SheetHeader>
            {/* <div className="available-widgets"> */}
          <div className="add-buttons">
          <Tabs defaultValue="line" className="w-[400px]">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="line">Line</TabsTrigger>
        <TabsTrigger value="bar">Bar</TabsTrigger>
        <TabsTrigger value="pie">Pie</TabsTrigger>
        <TabsTrigger value="weather">Weather</TabsTrigger>
      </TabsList>
      <TabsContent value="line">
        <Card className="flex flex-col h-[300px] !max-h-[300px]">
          <CardHeader>
            <CardTitle>Line Chart</CardTitle>
            <CardDescription>
              
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 overflow-auto space-y-2">
            <CollectionSelector value={selectedCollection} placeholder="Collection" onValueChange={(value) => setSelectedCollection(value)}/>
            <FieldsSelector collectionName={selectedCollection} value={selectedField} placeholder="Field" onValueChange={(value) => setSelectedField(value)}/>
            <FieldsSelector collectionName={selectedCollection} value={selectedField2} placeholder="Field" onValueChange={(value) => setSelectedField2(value)}/>
          </CardContent>
          <CardFooter>
            <Button onClick={() => addWidget("line", "Line Chart", selectedCollection, selectedField, selectedField2)}>Add Line Chart</Button>
          </CardFooter>
        </Card>
      </TabsContent>
      <TabsContent value="bar">
        <Card className="flex flex-col h-[300px] !max-h-[300px]">
          <CardHeader>
            <CardTitle>Bar Chart</CardTitle>
            <CardDescription>
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <CollectionSelector value={selectedCollection} placeholder="Collection" onValueChange={(value) => setSelectedCollection(value)} />
                      <FieldsSelector collectionName={selectedCollection} value={selectedField} placeholder="Field" onValueChange={(value) => setSelectedField(value)} />
                      <FieldsSelector collectionName={selectedCollection} value={selectedField2} placeholder="Field" onValueChange={(value) => setSelectedField2(value)} />
                    </CardContent>
                    <CardFooter>
                      <Button onClick={() => addWidget("line", "Line Chart", selectedCollection, selectedField, selectedField2)}>Add Line Chart</Button>
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
                      <CollectionSelector value={selectedCollection} placeholder="Collection" onValueChange={(value) => setSelectedCollection(value)} />
                      <FieldsSelector collectionName={selectedCollection} value={selectedField} placeholder="Field" onValueChange={(value) => setSelectedField(value)} />
                      <FieldsSelector collectionName={selectedCollection} value={selectedField2} placeholder="Field" onValueChange={(value) => setSelectedField2(value)} />
                    </CardContent>
                    <CardFooter>
                      <Button onClick={() => addWidget("bar", "Bar Chart", selectedCollection, selectedField, selectedField2)}>Add Bar Chart</Button>
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
                      <CollectionSelector value={selectedCollection} placeholder="Collection" onValueChange={(value) => setSelectedCollection(value)} />
                      <FieldsSelector collectionName={selectedCollection} value={selectedField} placeholder="Field" onValueChange={(value) => setSelectedField(value)} />
                    </CardContent>
                    <CardFooter>
                      <Button onClick={() => addWidget("pie", "Pie Chart", selectedCollection, selectedField, selectedField2)}>Add Pie Chart</Button>
                    </CardFooter>
                  </Card>
                </TabsContent>
                <TabsContent value="weather">
                  <Card>
                    <CardHeader>
                      <CardTitle>Weather</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <Button onClick={() => addWidget("weather", "Weather", selectedCollection, selectedField, selectedField2)}>Add Weather</Button>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>

            </div>
          </SheetContent>
        </Sheet>

        <div className={`items ${slottedItems.length === 0 ? "empty" : ""}`} ref={containerRef}>
          {slottedItems.length === 0 ? (
            <span className="empty-message">
              <img src="/arrow.svg" className="arrow-image" />
              <span className="text-message">
                They aren't any widgets displayed at the moment.<br></br>
                Add some from the Available Widgets
              </span>
            </span>
          ) : (
            slottedItems.map(({ slotId, itemId, item }) => (
              <div className="slot" key={slotId} data-swapy-slot={slotId}>
                {item && (
                  <div className="item" data-swapy-item={itemId} key={itemId}>
                    {item.type === "line" && (
                      <LocalLineChart
                        collection={item.collection}
                        x={item.field}
                        y={item.field2}
                      />
                    )}
                    {item.type === "bar" && (
                      <LocalBarChart
                        collection={item.collection}
                        x={item.field}
                        y={item.field2}
                        limit={10}
                      />
                    )}
                    {item.type === "pie" && (
                      <LocalPieChart
                        collection={item.collection}
                        field={item.field}
                        limit={10}
                      />
                    )}
                    {item.type === "weather" && (
                      <WeatherCard
                        date={dateTime ?? ""}
                        location={weatherLocation ?? ""}
                        temperature={parseInt(weathererature ?? "0")}
                        description={weatherDescription ?? ""}
                        icon={weatherIcon ?? " "}
                      />
                    )}
                    <span
                      className="delete"
                      data-swapy-no-drag
                      onClick={() => {
                        setItems(items.filter((i) => i.id !== item.id));
                      }}
                    >
                      <Trash2 />
                    </span>
                  </div>
                )}
              </div>
            )))}
        </div>
      </ScrollArea>
    </div>
  );
}
