import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleUser } from '@fortawesome/free-solid-svg-icons'
import { NavigationMenuComponent } from "../ui/navigation-menu";

export function TopBarComponent() {
    return(
        <div className="topbar">
            <div className="top">
                <div className="title">
                    <h1>Smart City</h1>
                </div>
                <div className="right-corner">
                    <span>
                        <h1><FontAwesomeIcon icon={faCircleUser} />Welcome visitor!!!!!!</h1>
                    </span>
                </div>
            </div>
            <div className="bottom">
                <div className="navbar-menu">
                    <NavigationMenuComponent />
                </div>
            </div>
        </div>
    )
}