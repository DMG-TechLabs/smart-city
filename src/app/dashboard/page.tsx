"use client";

import { useUser } from "@/context/UserContext";
import { useRouter } from "next/navigation";
import React, { useEffect, useMemo, useRef, useState } from 'react';
import './style.css';
import { createSwapy, SlotItemMapArray, Swapy, utils } from "swapy";
import { CardComponent } from "@/components/ui/card";
import { NavigationMenuComponent } from "@/components/ui/navigation-menu";
import WeatherCard from "@/components/local/weather-card";

type Item = {
    id: string;
    title: string;
    render: () => React.ReactNode;
};

const initialItems: Item[] = [
    { id: '1', 
        title: '1',
        render: () => (
            <WeatherCard
            location="New York"
            temperature={18}
            description="Cloudy"
            condition="rainy"
            />
        )
    },
    { id: '2', 
        title: '2',
        render: () => (
            <CardComponent />
        )
    }
];

export default function Dashboard() {
    const { user, logout } = useUser();
    const router = useRouter();
    const [items, setItems] = useState<Item[]>(initialItems);
    const [slotItemMap, setSlotItemMap] = useState<SlotItemMapArray>(utils.initSlotItemMap(items, 'id'));
    const slottedItems = useMemo(() => utils.toSlottedItems(items, 'id', slotItemMap), [items, slotItemMap]);
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

            swapyRef.current.onSwap((event) => {
                setSlotItemMap(event.newSlotItemMap.asArray);
            });
        }

        fetchTime().then(data => {
            setDateTime(data.formatted.split(' ')[0]);
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
                            <CardComponent />
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
