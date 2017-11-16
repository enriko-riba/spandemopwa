import * as ko from "knockout";
import * as Sammy from "sammy";
import "knockout-postbox";

export var SPA_VERSION = "2.1.10";

interface ConsoleStyles {
    greenFill: string,
    greenFill_light: string,
    red: string,
    redFill: string,
    yellowFill: string
}
var consoleStyle: ConsoleStyles = {
    greenFill: "color:#222;background:#1c1;border: solid 3px #1c1;",
    greenFill_light: "color:#0;background:#5f5; border: solid 2px #5f5;",
    red: "color:#f11;",
    redFill: "color:#fff;background:#f55; border: solid 3px #f55;",
    yellowFill: "color:#222;background:#cc1;border: solid 3px #cc1;",
};

export interface IRoute {

    /**
    *   The component name. This is the name of the component used for rendering the routes main view.
    */
    component: string;

    /**
    *   Custom data attached to the route.
    */
    tag: any;

    /**
    *   Routes target url (includes named parameter names in route).
    *   Note: this member is set via the route's constructor and must not be changed during runtime.
    */
    href: string;

    /**
    *   Active flag, returns true if the route is active else false.
    *   Note: this observable is set by the router.
    */
    isActive: KnockoutObservable<boolean>;

    /**
    *   Routes hash part of the url (includes parameter values in route).
    *   Note: this member is set by the router.
    */
    hash: string;

    /**
    *   Route parameters collection.
    *   Note: this member is set by the router.
    */
    params: any;

	/**
    *   Route path.
    *   Note: this member is set by the router.
    */
    path: string;
}


/**
*   Basic route implementation
*/
export class Route implements IRoute {

    public isActive: KnockoutObservable<boolean>;
    public href: string;
    public component: string;
    public hash: string;
    public tag: any;
    public path: string;

    /**
    *   Placeholder for route parameters
    */
    public params: any;

    /**
    * Creates a new Route instance.
    *
    * @param href the target url
    * @param component holds the name of the component rendered when the route is active
    * @param tag optional parameter, can hold any application specific value
    */
    constructor(href: string, component: string, tag?: any) {
        this.href = href;
        this.component = component;
        this.tag = tag;
        this.isActive = ko.observable<boolean>(false);

        var start = href.indexOf("#");
        if (start) {
            this.hash = href.substr(start);
        } else {
            this.hash = href;
        }
    }
}

/**
 * The SPA routing component.
 */
export class Router {
    private routes = ko.observableArray<IRoute>();
    public IsDebugToConsoleEnabled = false;

    /**
    *   The route invoked if a requested route is not found
    */
    private notFoundRoute: IRoute;

    /**
    *   Stops the routing system by unloading Sammy.
    */
    public Stop = () => {
        var sammyRouting: Sammy.Application = Sammy();
        sammyRouting.unload();
    }

    /**
    *   Applies the configured routes and starts the routing system.
    *   @param routeUrl an optional route to start the application.
    */
    public Run = (routeUrl?: string) => {
        var sammyRouting: Sammy.Application = Sammy();
        var self = this;

        //  for each route apply a sammy.get route
        ko.utils.arrayForEach(this.routes(), (route: IRoute) => {
            sammyRouting.get(route.href, function () {

                if (self.IsDebugToConsoleEnabled)
                    console.info(`%cactivating route '${route.href}', path: '${this.path}'`, consoleStyle.greenFill);

                var oldRoute = self.ActiveRoute();
                var oldPath = oldRoute ? oldRoute.path : "";

                //	unless its a primitive type ko will mutate the observable 
                //	even if the new value is equal to the old one, a manual 
                //	comparison by reference ensures only changes cause Activate.
                //	We must also take care for same routes but different parameters.
                if ((route !== oldRoute) || (oldPath !== this.path)) {

                    //	allow for canceling the navigation via canContinue parameter
                    if (!self.RouteNavigationCheck(oldRoute, route)) {
                        console.info("%croute deactivation forbidden (canContinue == false)!", consoleStyle.redFill);
                        window.location.hash = oldRoute.hash;
                        return false;
                    }

                    if (self.IsDebugToConsoleEnabled && oldRoute)
                        console.info("%cdeactivated route " + oldRoute.hash, consoleStyle.yellowFill);

                    //	if here, the route change is allowed
                    route.params = this.params;
                    route.path = this.path;

                    //  extract the url's hash part
                    var path = this.path as string;
                    var start = path.indexOf("#");
                    if (start) {
                        route.hash = path.substr(start);
                    } else {
                        route.hash = path;
                    }

                    self.SetActiveRoute(route);

                    //  fire aFterNavigate
                    ko.postbox.publish("route:afternavigate");
                }

                console.info("");
            });
        });

        //  handle notFound route
        sammyRouting.notFound = (verb, route) => {
            console.error("%croute not found:%c " + route, "color:#fff;background:#700;", "color:#fff;background:#707;");

            //	get the current route & fire onDeactivate
            var canContinue = true;
            if (self.ActiveRoute() !== self.notFoundRoute) {
                canContinue = self.RouteNavigationCheck(self.ActiveRoute(), self.notFoundRoute);
            }
            if (!canContinue) {
                if (window.location.hash !== self.ActiveRoute().hash)
                    window.location.hash = self.ActiveRoute().hash;
                return false;
            }

            if (self.notFoundRoute) {
                var params: any = {};
                params['route'] = route;
                self.notFoundRoute.params = params;
                this.UpdateActiveFlags(self.notFoundRoute);
                this.ActiveRoute(self.notFoundRoute);
            }
        };

        //  start routing
        sammyRouting.run(routeUrl);
    }

    /**
    *   Returns the internal routes array.
    */
    public GetRoutes() {
        return this.routes();
    }

    /**
    *   Adds a new route.
    *   @param route the route to be added
    */
    public AddRoute = (route: IRoute) => {
        this.routes.push(route);
    }

    /**
    *   Sets the route that gets invoked if a requested route is not found.
    */
    public SetNotFoundRoute = (route: IRoute) => {
        var start = route.href.indexOf("#");
        if (start) {
            route.hash = route.href.substr(start);
        } else {
            route.hash = route.href;
        }
        this.notFoundRoute = route;
    }

    /**
    *   Returns the active route.
    */
    public ActiveRoute = ko.observable<IRoute>();

	/**
    *   Notifies subscribers of route navigation.
	*	Returns true if the navigation is allowed.
    */
    private RouteNavigationCheck = (oldRoute: IRoute, newRoute: IRoute): boolean => {
        var navigationData = {
            canContinue: true,
            nextRoute: newRoute,
            currentRoute: oldRoute
        };
        ko.postbox.publish("route:navigation", navigationData);

        //  special case handling for navigation check on app entry where no previous route exists,
        //  here we allow assigning the previous route inside the postbox handler and thus update oldRoute
        if (!oldRoute && navigationData.currentRoute) {
            oldRoute = navigationData.currentRoute;
            this.SetActiveRoute(oldRoute);
        }
        return navigationData.canContinue;
    }

    /**
    *   Activates the given route.
    */
    private SetActiveRoute = (route: IRoute) => {
        if (route) {
            this.UpdateActiveFlags(route);

            if (window.location.hash !== route.hash)
                window.location.hash = route.hash;
            this.ActiveRoute(route);
        }
        else {
            window.location.hash = "#";
        }

        if (this.IsDebugToConsoleEnabled)
            console.info(`%cactivated route '${route.href}', path: '${route.path}', component name: '${route.component}', params: ${ko.toJSON(route.params)}`, consoleStyle.greenFill);
    }

    /**
    *   Removes the active flag from all routes except the newRoute.
    */
    private UpdateActiveFlags = (newActiveRoute: IRoute) => {
        ko.utils.arrayForEach(this.routes(), (currentRoute: IRoute) => {
            currentRoute.isActive(currentRoute === newActiveRoute);
        });

        if (this.notFoundRoute) {
            this.notFoundRoute.isActive(this.notFoundRoute === newActiveRoute)
        }
    }
}

/**
*   The base for the SPA application, extend your main vm from this class.
*   The Application object exposes a router object of type KnockoutObservable<Router>. 
*/
export class Application {
    /**
    *   The router component is basically a dictionary of registered routes. 
    */
    public router: KnockoutObservable<Router>;

    public ActiveRoute = ko.pureComputed(() => {
        return this.router().ActiveRoute();
    });

    private isDebugToConsoleEnabled = false;

    /**
    *   Creates a new Application instance.
    */
    constructor() {
        this.router = ko.observable(new Router());
        console.info("%c⚡⚡⚡ SPA Application created! ⚡⚡⚡\t", consoleStyle.redFill);
        console.info("%cFramework version:%c\t" + SPA_VERSION + "\t\t", consoleStyle.greenFill_light, consoleStyle.red);
    }

    /**
    *   Enables or disables most console log messages.
    */
    protected IsDebugToConsoleEnabled = (isEnabled: boolean) => {
        this.isDebugToConsoleEnabled = isEnabled;
        this.router().IsDebugToConsoleEnabled = this.isDebugToConsoleEnabled;
    }

    /**
    * Helper for easy component registration.
    * You can override this to setup custom rules for template/vm folder locations.
    *
    * @param componentName the name of the component to be registered
    */
    protected registerComponent = (componentNameOrOptions: string | ComponentOptions) => {
        var templateName = "text!app/";
        var vmName = "./app/";
        var componentName: string;

        if (typeof componentNameOrOptions === "string") {
            componentName = componentNameOrOptions as string;
            templateName += "_templates/" + componentName + "/" + componentName + ".html";
            vmName += componentName + "/" + componentName;
        } else {
            componentName = componentNameOrOptions.componentName;

            //  if not explicitly set the default path is <ComponentName>/<ComponentName>
            var defaultPath = componentName + '/' + componentName;
            templateName += (componentNameOrOptions.templatePath || defaultPath) + ".html";
            vmName += componentNameOrOptions.vmPath || defaultPath;
        }

        ko.components.register(componentName, {
            template: { require: templateName },
            viewModel: { require: vmName }
        });
    }
}

export interface ComponentOptions {
    componentName: string;
    templatePath?: string;
    vmPath?: string
}

export interface RouteNavigationData {
    canContinue: boolean;
    nextRoute: IRoute;
    currentRoute: IRoute;
}

/**
*	Base class for route viewmodels.
*	Note: this class just takes care of correct OnDeactivate() handling and disposing postbox subscription.
*/
export class ViewModelBase {
    private postboxSubscription: any;

    constructor() {
        this.SubscribeOnDeactivate();
    }

    private OnDeactivateHandler(data: RouteNavigationData) {
        this.OnDeactivate(data);
        if (data.canContinue)
            this.UnsubscribeOnDeactivate();
    }

	/**
	 *	Stops listening to on deactivate messages.
	 */
    private UnsubscribeOnDeactivate() {
        if (this.postboxSubscription) {
            this.postboxSubscription.dispose();
            this.postboxSubscription = undefined;
        }
    }

	/**
	 *	Starts listening to deactivate messages.
	 */
    private SubscribeOnDeactivate = () => {
        this.postboxSubscription = ko.postbox.subscribe("route:navigation", this.OnDeactivateHandler, this);
    }

	/**
	 *	Triggered when on deactivate messages arrives, override to implement behavior.
	 */
    protected OnDeactivate(data: RouteNavigationData) {
    }
}