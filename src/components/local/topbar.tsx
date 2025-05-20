<<<<<<< HEAD
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleUser } from '@fortawesome/free-solid-svg-icons'
=======
"use client";
>>>>>>> 3aceb15c0191348127ac3f4a2317586ec381f94c
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
<<<<<<< HEAD
                    <span>
                        <h1><FontAwesomeIcon icon={faCircleUser} />Welcome visitor!!!!!!</h1>
                    </span>
                </div>
            </div>
            <div className="bottom">
                <div className="navbar-menu">
                    <NavigationMenuComponent />
=======
                    {/* <h1>Welcome {user?.email}</h1> */}
                    <button onClick={logout}>{user?.email}</button>
>>>>>>> 3aceb15c0191348127ac3f4a2317586ec381f94c
                </div>
            </div>
            {/* <div className="bottom">
                
            </div> */}
        </div>
    )
}
