"use client";

import { useUser } from "@/context/UserContext";
import { useRouter } from "next/navigation";
import React from "react";
import { useEffect, useMemo, useRef, useState } from 'react'
import './style.css'
import { createSwapy, SlotItemMapArray, Swapy, utils } from "swapy";
import { CardComponent } from "@/components/ui/card";
import { Navigation } from "lucide-react";
import { NavigationMenuComponent } from "@/components/ui/navigation-menu";
import WeatherCard from "@/components/local/weather-card";
import { ChartComponent } from "@/components/local/chart";

export default function Dashboard() {
  const { user, logout } = useUser();
  const router = useRouter();
  const swapyRef = useRef<Swapy | null>(null)

  /*if (user == null || user.email === "") {
    router.push("/pocketbase_example");
  }*/

  useEffect(() => {
    if (typeof window !== "undefined") {
      const containerRef = document.querySelector('.widget-container') as HTMLElement

      swapyRef.current = createSwapy(containerRef!, {
        animation: 'spring',
        swapMode: 'drop',
        autoScrollOnDrag: true,
        enabled: true,
      })
    }
  }, [])
      /*<div className="greeting-text">
        <h1>Welcome, {user?.username || "Guest"}!</h1>
      </div>*/
  return (
    <div className="container">
      <div className="topbar">
        <div className="navbar-menu">
          <NavigationMenuComponent />
        </div>
        <div className="date-time" id="topbar-item">
          <h1>Wednesday May 7 2025</h1>
        </div>
        <div className="right-corner" id="topbar-item">
          <h1>Welcome visitor!!!!!!</h1>
        </div>
      </div>
      <div className="widget-container" id="topbar-item">
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
                <CardComponent />
              </div>
          </div>
          <div id="slot" data-swapy-slot="e">
              <div id="item" data-swapy-item="e">
                <WeatherCard
                    location="New York"
                    temperature={18}
                    description="Cloudy"
                    condition="rainy"
                />
              </div>
          </div>
        </div>
      </div>
    </div>
  )}