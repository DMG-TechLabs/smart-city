"use client";

import React, { SetStateAction, useEffect, useMemo, useRef, useState } from "react";
import "@/styles/dashboard.css";
import { utils, SlotItemMapArray, createSwapy, Swapy } from "swapy";
import WeatherCard from "@/components/local/weather-card";
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
import { useUser } from "@/context/UserContext";
import { useRouter } from "next/navigation";
import { LocalAlertTable } from "@/components/local/alert-history";

type Item = {
  id: string;
  title: string;
  type: "line" | "bar" | "pie" | "weather" | "alertHistory";
  collection: string;
  field: string;
  field2: string;
};

const initialItems: Item[] = [
  // { id: "1", title: "Line Chart", type: "line", collection: "Devices", field: "created", field2: "_temperature"},
  // { id: "2", title: "Bar Chart", type: "bar", collection: "Weather", field: "_location_name", field2: "_current_uv"},
  // { id: "3", title: "Pie Chart", type: "pie", collection: "Devices", field: "_state", field2: ""},
  // { id: "4", title: "Weather", type: "weather", collection:"", field:"", field2:"" }
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
  const [weathererature, setWeatherTemperature] = useState<string | null>(null);
  const [weatherIcon, setWeatherIcon] = useState<string | null>(null);

  function deleteItem(newItemList: SetStateAction<Item[]>) {
    console.log("Items: ", newItemList);
    setItems(newItemList)
    localStorage.setItem('swapy-items', JSON.stringify(newItemList));
  }
  
  useEffect(() => {
    utils.dynamicSwapy(swapyRef.current, items, "id", slotItemMap, setSlotItemMap)
    // localStorage.setItem('swapy-items', JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    const localItems = localStorage.getItem('swapy-items');
    console.log("items", localItems);
    if (localItems) {
      setItems(JSON.parse(localItems));
    }

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
      setWeatherTemperature(d.current.temp_c);
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
    localStorage.setItem('swapy-items', JSON.stringify([...items, newItem]));
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
              <Tabs defaultValue="line" className="w-[430px]">
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="line">Line</TabsTrigger>
                  <TabsTrigger value="bar">Bar</TabsTrigger>
                  <TabsTrigger value="pie">Pie</TabsTrigger>
                  <TabsTrigger value="weather">Weather</TabsTrigger>
                  <TabsTrigger value="alertHistory">Alert History</TabsTrigger>
                </TabsList>
                <TabsContent value="line">
                  <Card className="flex flex-col h-[300px] !max-h-[300px]">
                    <CardHeader className="shrink-0">
                      <CardTitle>Line Chart</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 overflow-auto space-y-2">
                      <CollectionSelector value={selectedCollection} placeholder="Collection" onValueChange={(value) => setSelectedCollection(value)} />
                      <FieldsSelector collectionName={selectedCollection} value={selectedField} placeholder="Field" onValueChange={(value) => setSelectedField(value)} />
                      <FieldsSelector collectionName={selectedCollection} value={selectedField2} placeholder="Field" onValueChange={(value) => setSelectedField2(value)} />
                    </CardContent>
                    <CardFooter className="shrink-0">
                      <Button onClick={() => addWidget("line", "Line Chart", selectedCollection, selectedField, selectedField2)}>Add Line Chart</Button>
                    </CardFooter>
                  </Card>
                </TabsContent>

                <TabsContent value="bar">
                  <Card className="flex flex-col h-[300px] !max-h-[300px]">
                    <CardHeader className="shrink-0">
                      <CardTitle>Bar Chart</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 overflow-auto space-y-2">
                      <CollectionSelector value={selectedCollection} placeholder="Collection" onValueChange={(value) => setSelectedCollection(value)} />
                      <FieldsSelector collectionName={selectedCollection} value={selectedField} placeholder="Field" onValueChange={(value) => setSelectedField(value)} />
                      <FieldsSelector collectionName={selectedCollection} value={selectedField2} placeholder="Field" onValueChange={(value) => setSelectedField2(value)} />
                    </CardContent>
                    <CardFooter className="shrink-0">
                      <Button onClick={() => addWidget("bar", "Bar Chart", selectedCollection, selectedField, selectedField2)}>Add Bar Chart</Button>
                    </CardFooter>
                  </Card>
                </TabsContent>

                <TabsContent value="pie">
                  <Card className="flex flex-col h-[300px] !max-h-[300px]">
                    <CardHeader className="shrink-0">
                      <CardTitle>Pie Chart</CardTitle>
                      <CardDescription>

                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 overflow-auto space-y-2">
                      <CollectionSelector value={selectedCollection} placeholder="Collection" onValueChange={(value) => setSelectedCollection(value)} />
                      <FieldsSelector collectionName={selectedCollection} value={selectedField} placeholder="Field" onValueChange={(value) => setSelectedField(value)} />
                    </CardContent>
                    <CardFooter className="shrink-0">
                      <Button onClick={() => addWidget("pie", "Pie Chart", selectedCollection, selectedField, selectedField2)}>Add Pie Chart</Button>
                    </CardFooter>
                  </Card>
                </TabsContent>

                <TabsContent value="weather">
                  <Card className="flex flex-col h-[300px] !smax-h-[300px]">
                    <CardHeader className="shrink-0">
                      <CardTitle>Weather</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 overflow-auto space-y-2">
                      <Button onClick={() => addWidget("weather", "Weather", selectedCollection, selectedField, selectedField2)}>Add Weather</Button>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="alertHistory">
                  <Card className="flex flex-col h-[300px] !smax-h-[300px]">
                    <CardHeader className="shrink-0">
                      <CardTitle>Alert History</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 overflow-auto space-y-2">
                      <Button onClick={() => addWidget("alertHistory", "Alert History", selectedCollection, selectedField, selectedField2)}>Add History</Button>
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
                    <span
                    className="delete"
                    data-swapy-no-drag
                    onClick={() => {
                        deleteItem(items.filter((i) => i.id !== item.id));
                    }}
                    >
                    <Trash2 />
                    </span>
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
                    {item.type === "alertHistory" && (
                      <div >
                        <LocalAlertTable newClassName={"h-[300px]"} />
                      </div>
                    )}
                  </div>
                )}
              </div>
            )))}
        </div>
      </ScrollArea>
    </div>
  );
}
