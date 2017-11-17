import * as ko from "knockout";
import { Route, Router } from "../SpaApplication";

/**
 * Helper class for registering routes and 
 */
export class RouteHelper {
    private r: Router
    constructor(private vm){   
        this.r = vm.router();     
    }

    /**
     * defines application mnu items (urls)
     */
    public menuItemList: Array<LinkItem> = [
        new LinkItem('#/home', 'Home', 'home', true),
        new LinkItem('#/signin', 'Sign-in', 'signin', false, false),
    ];

    /**
     * Creates application routes and starts the router 
     */
    public initRouting() {       
        //-------------------------------------------------
        //	TODO: how to dynamic load route components?
        require('./route-not-found');
        require('./signin');
        require('./home');
        //-------------------------------------------------
        
        this.menuItemList.forEach((li) => {
            this.r.AddRoute(new Route(li.href, li.component));
        });
        this.r.SetNotFoundRoute(new Route('/#/notfound', 'route-not-found'));

        //  TODO: refactor this...
        ko.postbox.subscribe("route:afternavigate", this.afterRouteNavigate, this);
        this.r.Run(this.menuItemList[0].href);
    }

    /**
     * Updates the links.isActive observable
     */
    private afterRouteNavigate = () => {
        this.menuItemList.forEach(element => element.isActive(element.href == this.r.ActiveRoute().href));
        this.vm.showUserInfo(false);
    };
}

/**
 * Helper data structure for the menuItemList
 */
class LinkItem {
    constructor(public href: string, 
                public text: string, 
                public component: string, 
                isActive: boolean = false, 
                public addToMenu = true) {
        this.isActive(isActive);
    }    
    public isActive = ko.observable(false);
}