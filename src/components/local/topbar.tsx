"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";               
import { faCircleUser } from '@fortawesome/free-solid-svg-icons'                
import { NavigationMenuComponent } from "../ui/navigation-menu";                
import { useUser } from "@/context/UserContext";
import { usePathname } from "next/navigation";
import { Button } from "../ui/button";
import { useEffect, useState } from "react";

export function TopBarComponent() {
    const [ email, setEmail ] = useState("");
    // const [ username, setUsername ] = useState(""); 
    const { user, logout } = useUser();
    // const router = useRouter();
    const noHeaderPages = ['/login', '/register'];
    const pathname = usePathname()        
    
    useEffect(() => {
        if (user) {
            setEmail(user.email);
            // setUsername(user.username);
        }
    }, [email, user]);
    
    return(                                                                     
        <div className="topbar">                                                
            <div className="top">                                               
                <div className="title">                                         
                    <h1>Smart City</h1>                                         
                </div>                                                         
                <div className="right-corner">  
                    <h1>Welcome {email}</h1>
                    <Button id="btn-destructive" onClick={logout}>Logout</Button>                                                                               
                </div>                                                          
            </div>                                                              
            <div className="bottom">    
                {/* <div className="navbar-menu"> */}
                {!noHeaderPages.includes(pathname) && <NavigationMenuComponent />}
                    {/* <NavigationMenuComponent /> */}
                {/* </div> */}                                                                                                 
            </div>                                                              
        </div>                                                                  
    )                                                                           
}            
