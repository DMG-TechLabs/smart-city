"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import "@/styles/dashboard.css";
import { utils, SlotItemMapArray, createSwapy, Swapy } from "swapy";
import WeatherCard from "@/components/local/weather-card";
import { SheetDemo, WidgetList } from "@/components/local/widget-list";
import { LocalBarChart } from "@/components/local/bar-chart";
import { LocalLineChart } from "@/components/local/line-chart";
import { LocalPieChart } from "@/components/local/pie-chart";
import { Trash, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import "@/styles/swapy.css"
import { ScrollArea } from "@radix-ui/react-scroll-area";

type Item = {
  id: string;
  title: string;
  type: "line" | "bar" | "pie" | "weather";
};

const initialItems: Item[] = [
  { id: "1", title: "Line Chart", type: "line" },
  { id: "2", title: "Bar Chart", type: "bar" },
  { id: "3", title: "Pie Chart", type: "pie" },
  { id: "4", title: "Weather", type: "weather" }
];

export default function Home() {
  const [items, setItems] = useState<Item[]>(initialItems);
  const [slotItemMap, setSlotItemMap] = useState<SlotItemMapArray>(utils.initSlotItemMap(items, "id"));
  const slottedItems = useMemo(() => utils.toSlottedItems(items, "id", slotItemMap), [items, slotItemMap]);
  const swapyRef = useRef<Swapy | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Weather Widget values
  const [dateTime, setDateTime] = useState<string | null>(null);
  const [weatherLocation, setWeatherLocation] = useState<string | null>(null);
  const [weatherDescription, setWeatherDescription] = useState<string | null>(null);
  const [weatherTemperature, setWeatherTemperature] = useState<string | null>(null);
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
      setWeatherTemperature(d.current.temp_c);
      setWeatherLocation(d.location.name);
      setWeatherDescription(d.current.condition.text);
      setWeatherIcon(d.current.condition.icon);
    });
  }, []);

  const addWidget = (type: Item["type"], title: string) => {
    const newItem: Item = {
      id: `${Date.now()}`,
      title,
      type
    };
    setItems([...items, newItem]);
  };

  return (
    <div className="main-content">
      <ScrollArea className="widget-container">
        <WidgetList 
          addLineWidget={() => addWidget("line", "Line Chart")}
          addBarWidget={() => addWidget("bar", "Bar Chart")}
          addPieWidget={() => addWidget("pie", "Pie Chart")}
          addWeatherWidget={() => addWidget("weather", "Weather")}
        />

      <div className="items" ref={containerRef}>
        {slottedItems.map(({ slotId, itemId, item }) => (
          <div className="slot" key={slotId} data-swapy-slot={slotId}>
            {item && (
              <div className="item" data-swapy-item={itemId} key={itemId}>
                {item.type === "line" && <LocalLineChart />}
                {item.type === "bar" && <LocalBarChart />}
                {item.type === "pie" && <LocalPieChart />}
                {item.type === "weather" && (
                  <WeatherCard
                    date={dateTime ?? ""}
                    location={weatherLocation ?? ""}
                    temperature={parseInt(weatherTemperature ?? "0")}
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
        ))}
      </div>
      </ScrollArea>
    </div>
  );
}
