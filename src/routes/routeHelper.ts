import * as ko from "knockout";
import * as $ from "jquery";
import { Route, Router } from "../SpaApplication";
import { currentId } from "async_hooks";

/**
 * Helper class for registering routes and 
 */
export class RouteHelper {
    private r: Router;
    public get menuItems() {
        return this.menuItemList.filter(x => x.addToMenu == true);
    };
    constructor(private vm) {
        this.r = vm.router();
    }

    /**
     * defines application mnu items (urls)
     */
    public menuItemList: Array<LinkItem> = [
        new LinkItem('#/signin', 'Sign-in', 'signin', 'exit_to_app', false, false),
        new LinkItem('#/home', 'Home', 'home', 'home', true),
        new LinkItem('#/notification', 'Notification', 'notification', 'notifications'),
        new LinkItem('#/pushnotification', 'Push notification', 'push-notification', 'vibration'),
        new LinkItem('#/camera', 'Camera access', 'camera', 'videocam'),
        //new LinkItem('#/dbupdate', 'DB update', 'real-time-update', 'sync'),
        new LinkItem('#/images', 'Image stream', 'image-stream', 'sync'),
        new LinkItem('#/speech', 'Speech to text', 'speech', 'mic'),
        new LinkItem('#/about', 'About', 'about', 'info')
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
        require('./notification');
        require('./push-notification');
        require('./camera');
        require('./real-time-update');
        require('./image-stream');
        require('./speech');
        require('./about');
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
        var activeHref = this.r.ActiveRoute().href;
        this.menuItemList.forEach(element => {
            if(element.href == activeHref){
                element.isActive(true);
                $("#page-title").text(element.text);
            }else{
                element.isActive(false);
            }
        });
    };

    public slideToPage = (direction: string) => {
        let newIndex: number;
        
        var routes = this.r.GetRoutes();
        var currentIndex = routes.findIndex(x => x == this.r.ActiveRoute());
        
        if (direction == 'left') {
            newIndex = currentIndex + 1;
        } else if (direction == 'right') {
            newIndex = currentIndex - 1;
        }
        
        if( (newIndex != currentIndex) && (newIndex < routes.length) && (newIndex > 0) )
            window.location.href = routes[newIndex].href;        
    }
}

/**
 * Helper data structure for the menuItemList
 */
class LinkItem {
    constructor(public href: string,
        public text: string,
        public component: string,
        public icon: string,
        isActive: boolean = false,
        public addToMenu = true) {
        this.isActive(isActive);
    }
    public isActive = ko.observable(false);
}