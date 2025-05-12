"use client";
import { NavigationMenuComponent } from "../ui/navigation-menu";
import { useUser } from "@/context/UserContext";

export function TopBarComponent() {
    const { user, logout } = useUser();
    
    return(
        <div className="top">
                <div className="topbar">
                <div className="title">
                    <h1>Smart City</h1>
                </div>
                {/* <div className="navbar-menu"> */}
                    <NavigationMenuComponent />
                {/* </div> */}
                <div className="right-corner">
                    <h1>Welcome {user?.email}</h1>
                </div>
            </div>
            {/* <div className="bottom">
                
            </div> */}
        </div>
    )
}