"use client";

import { useUser } from "@/context/UserContext";
import { useRouter } from "next/navigation";
import React, { useEffect, useMemo, useRef, useState } from 'react';
import './style.css';
import { createSwapy, SlotItemMapArray, Swapy, utils } from "swapy";
import { CardComponent } from "@/components/ui/card";
import { NavigationMenuComponent } from "@/components/ui/navigation-menu";
import WeatherCard from "@/components/local/weather-card";
import { ChartComponent } from "@/components/local/chart";

export default function Dashboard() {
    const { user, logout } = useUser();
    const router = useRouter();
    const swapyRef = useRef<Swapy | null>(null);

    const [dateTime, setDateTime] = useState<string | null>(null);

    useEffect(() => {
        async function fetchTime(): Promise<object | null> {
            const response = await fetch("/api/time");
            if (!response.ok) return null;
            return await response.json();
        }

        if (typeof window !== "undefined") {
            const containerRef = document.querySelector('.widget-container') as HTMLElement;
            swapyRef.current = createSwapy(containerRef!, {
                animation: 'spring',
                swapMode: 'drop',
                autoScrollOnDrag: true,
                enabled: true,
            });
        }

        fetchTime().then(data => {
            if (data && typeof data === "object" && "date" in data && "time" in data) {
                const dateParts = data.date.split('/');
                const formattedDate = new Date(`${dateParts[1]}/${dateParts[0]}/${dateParts[2]}`);

                const formatted = formattedDate.toLocaleDateString("en-GB", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                });


                setDateTime(formatted);
            }
        });
    }, []);

    return (
        <div className="container">
            <div className="topbar">
                <div className="navbar-menu">
                    <NavigationMenuComponent />
                </div>

                <div className="date-time">
                    <h1>{dateTime}</h1>
                </div>

                <div className="right-corner">
                    <h1>Welcome visitor!!!!!!</h1>
                </div>
            </div>

            <div className="widget-container">
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
    );
}
