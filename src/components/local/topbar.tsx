"use client";
import { NavigationMenuComponent } from "../ui/navigation-menu";
import { useUser } from "@/context/UserContext";
// import { useRouter } from "next/navigation";
import { usePathname } from 'next/navigation'
export function TopBarComponent() {
    const { user, logout } = useUser();
    // const router = useRouter();
    const noHeaderPages = ['/login', '/register'];
    const pathname = usePathname()
    
    return(
        <div className="top">
                <div className="topbar">
                <div className="title">
                    <h1>Smart City</h1>
                </div>
                {/* <div className="navbar-menu"> */}
                {!noHeaderPages.includes(pathname) && <NavigationMenuComponent />}
                    {/* <NavigationMenuComponent /> */}
                {/* </div> */}
                <div className="right-corner">
                    {/* <h1>Welcome {user?.email}</h1> */}
                    <button onClick={logout}>{user?.email}</button>
                </div>
            </div>
            {/* <div className="bottom">
                
            </div> */}
        </div>
    )
}
