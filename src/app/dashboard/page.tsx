"use client";

import { useUser } from "@/context/UserContext";
import { useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import "./style.css";
import { createSwapy, Swapy } from "swapy";
import { CardComponent } from "@/components/ui/card";
import { NavigationMenuComponent } from "@/components/ui/navigation-menu";
import WeatherCard from "@/components/local/weather-card";
import { ChartComponent } from "@/components/local/chart";
import { Sheet } from "lucide-react";
import { SheetDemo } from "@/components/local/widget-list";

export default function Dashboard() {
  const { user, logout } = useUser();
  const router = useRouter();

  if (user == null || user.email === "") {
      router.push("/login");
  }

  const swapyRef = useRef<Swapy | null>(null);

  const [dateTime, setDateTime] = useState<string | null>(null);
  const [weatherLocation, setWeatherLocation] = useState<string | null>(null);
  const [weatherDescription, setWeatherDescription] = useState<string | null>(
    null
  );
  const [weatherTemperature, setWeatherTemperature] = useState<string | null>(
    null
  );
  const [weatherIcon, setWeatherIcon] = useState<string | null>(null);

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

    if (typeof window !== "undefined") {
      const containerRef = document.querySelector(
        ".widget-container"
      ) as HTMLElement;
      swapyRef.current = createSwapy(containerRef!, {
        animation: "spring",
        swapMode: "drop",
        autoScrollOnDrag: true,
        enabled: true,
      });
      
    }

    fetchTime().then((data) => {
      if (data && "timestamp" in data) {
        const unixSeconds = data.timestamp;
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

      setWeatherTemperature(data.current.temp_c);
      setWeatherLocation(data.location.name);
      setWeatherDescription(data.current.condition.text);
      setWeatherIcon(data.current.condition.icon);
    });
  }, []);

  return (
    <div className="main-content">
      <div className="widget-container">
        <SheetDemo />
          <div className="items">
              <div id="slot" data-swapy-slot="a">
                  <div id="item" data-swapy-item="a">
                      <ChartComponent />
                  </div>
              </div>
              <div id="slot" data-swapy-slot="b">
                  <div id="item" data-swapy-item="b">
                      <CardComponent />
                  </div>
              </div>
              <div id="slot" data-swapy-slot="c">
                  <div id="item" data-swapy-item="c">
                      <CardComponent />
                  </div>
              </div>
              <div id="slot" data-swapy-slot="d">
                  <div id="item" data-swapy-item="d">
                      <WeatherCard
                          date={dateTime}
                          location={weatherLocation}
                          temperature={weatherTemperature}
                          description={weatherDescription}
                          icon={weatherIcon}
                      />
                  </div>
              </div>
          </div>
      </div>
    </div>
  );
}
