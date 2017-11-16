import * as ko from "knockout";
import * as $ from "jquery";
import * as helper from "./helper";
import { Router, Route, Application } from "./SpaApplication";
import { list } from "./routes/roteList";
import { LinkItem } from "./routes/LinkItem";

//  firebase
import * as firebase from "firebase/app";
import "firebase/firestore";

require('./css/site.scss');

//-------------------------------------------------
//	TODO: how to dynamic load route components?
require('./routes/route-not-found');
require('./routes/signin');
require('./routes/home');
//-------------------------------------------------


class Main extends Application {
	private userPhotoURL = ko.observable("");
	private userDisplayName = ko.observable("");
	
	constructor() {
		super();
		
		//helper.registerServiceWorker('sw.js');
		helper.initFirebase();
		
		this.IsDebugToConsoleEnabled(true);
		this.initRouting();
	}

	/**
	 * Creates application routes and starts the router 
	 */
	private initRouting() {
		var r = this.router();
		list.forEach((li) => {
			r.AddRoute(new Route(li.href, li.component));
		});
		r.SetNotFoundRoute(new Route('/#/notfound', 'route-not-found'));

		//  TODO: refactor this...
		ko.postbox.subscribe("route:afternavigate", this.afterRouteNavigate, this);
		r.Run(list[0].href);
	}

	/**
	 * Updates the links.isActive observable
	 */
	private afterRouteNavigate = () => {
		var r = this.router();
		list.forEach(element => {
			element.isActive(element.href == r.ActiveRoute().href);
		});

		this.showUserInfo(false);
	};

	/**
	 * Handles click on user image.
	 */
	private userInfoClick = async () => {
		if (firebase.auth().currentUser)
			this.showUserInfo(true);
	};

	public showUserInfo = ko.observable(false);
}

export var vm = new Main();

/**
 * start ko binding.
 */
$(document).ready(() => {
	ko.applyBindings(vm);
});