"use client";

import { NavigationMenuComponent } from "../ui/navigation-menu";
import { useUser } from "@/context/UserContext";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "../ui/button";
import { useEffect, useState } from "react";

export function TopBarComponent() {
    const [email, setEmail] = useState("");
    const { user, logout } = useUser();
    const router = useRouter();
    const noHeaderPages = ['/login', '/register'];
    const pathname = usePathname()

    useEffect(() => {
        if (user) {
            setEmail(user.email);
            // setUsername(user.username);
        }
        if (email == "" || email == null || email == undefined) {
            router.push("/login");
        }
    }, [email, user]);

    function userLogout() {
        logout();
        router.push("/login");
    }

    function userLogin() {
        router.push("/login");
    }

    return (
        <>
            {!noHeaderPages.includes(pathname) && (
                <div className="topbar">
                    <div className="top">
                        <div className="title">
                            <h1>Smart City</h1>
                        </div>
                        <div className="right-corner">
                            {email ? (
                                <>
                                    <h1>Welcome {email}</h1>
                                    <Button id="btn-destructive" onClick={userLogout}>Logout</Button>
                                </>
                            ) : (
                                <Button id="btn-destructive" onClick={userLogin}>Login</Button>
                            )}
                        </div>
                    </div>
                    <div className="bottom">
                        <NavigationMenuComponent />
                    </div>
                </div>
            )}
        </>
    )
}
