import * as ko from "knockout";
import * as $ from "jquery";
import { Router, Route, Application } from "./SpaApplication";
import { links } from "./links";
import { LinkItem } from "./LinkItem";

//  firebase
import * as firebase from "firebase/app";
import "firebase/firestore";


class Main extends Application {
	private userPhotoURL = ko.observable("");
	private userDisplayName = ko.observable("");
	
	constructor() {
		super();

		const config = {
			apiKey: "AIzaSyD0cMNr0yCI-9LCCC7PcbEpOALrSXjCfcg",
			authDomain: "spandemopwa.firebaseapp.com",
			databaseURL: "https://spandemopwa.firebaseio.com",
			projectId: "spandemopwa",
			storageBucket: "spandemopwa.appspot.com",
			messagingSenderId: "805463871698"
		};

		this.IsDebugToConsoleEnabled(true);
		this.initRouting();
	}

	/**
	 * Creates application routes and starts the router 
	 */
	private initRouting() {
		var r = this.router();
		links.forEach((li) => {
			r.AddRoute(new Route(li.href, li.component));
		});
		r.SetNotFoundRoute(new Route('/#/notfound', 'route-not-found'));

		//  TODO: refactor this...
		ko.postbox.subscribe("route:afternavigate", this.afterRouteNavigate, this);
		r.Run(links[0].href);
	}

	/**
	 * Updates the links.isActive observable
	 */
	private afterRouteNavigate = () => {
		var r = this.router();
		links.forEach(element => {
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