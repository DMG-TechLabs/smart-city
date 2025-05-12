import { NavigationMenuComponent } from "../ui/navigation-menu";

export function TopBarComponent() {
    return(
        <div className="top">
                <div className="topbar">
                <div className="title">
                    <h1>Smart City</h1>
                </div>
                <div className="navbar-menu">
                    <NavigationMenuComponent />
                </div>
                <div className="right-corner">
                    <h1>Welcome visitor!!!!!!</h1>
                </div>
            </div>
            {/* <div className="bottom">
                
            </div> */}
        </div>
    )
}