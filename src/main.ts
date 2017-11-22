import * as ko from "knockout";
import * as $ from "jquery";
import { ServiceWorkerHelper, FirebaseHelper, UserInfo, SwipeDetect, HREF_SIGNIN } from "./helper";
import { RouteHelper } from "./routes/routeHelper";
import { Application } from "./SpaApplication";

//  firebase
import * as firebase from "firebase/app";
import "firebase/firestore";

import * as mdc from 'material-components-web';
import { MDCTabBar, MDCTabBarFoundation } from '@material/tabs';

// css 
require('./css/site.scss');

class Main extends Application {
	public routeHelper : RouteHelper;
	public userIsSignedIn = ko.observable<boolean>(false);
	private currentUser = ko.observable<UserInfo>(new UserInfo);

	constructor() {
		super();

		ServiceWorkerHelper.registerServiceWorker('sw.js');
		FirebaseHelper.initFirebase();
		
		this.IsDebugToConsoleEnabled(true);
		this.routeHelper = new RouteHelper(this);
		this.routeHelper.initRouting();

		var requestedHref = window.location.hash;
        if(requestedHref == HREF_SIGNIN) requestedHref = '#/home';
		this.trackAuth(requestedHref);
	}

	private signOut() {
		FirebaseHelper.signOut();
	}

	/**
	 * Handles authentication changes
	 * @param routeHash route to which the user is redirected to after sign in
	 */
	private trackAuth(routeHash) {
		var oldUser = firebase.auth().currentUser;
		firebase.auth().onAuthStateChanged((user) => {			
			if (user) {
				this.userIsSignedIn(true);
				this.currentUser(new UserInfo(user.displayName, user.email, user.emailVerified, user.photoURL, user.uid));				
				console.log('current user:', user.email);
				window.location.href = routeHash;
			} else {
				this.userIsSignedIn(false);
				console.log("signed out");
				window.location.href = HREF_SIGNIN;
			}
		},
		(error) => {
			console.log(error);
		});		
    }
}

export var vm = new Main();

/**
 * start ko binding.
 */
$(document).ready(() => {
	ko.applyBindings(vm);

	// material commponent - drawer
	let drawer = new mdc.drawer.MDCTemporaryDrawer(document.querySelector('.mdc-temporary-drawer'));
	document.querySelector('.menu').addEventListener('click', () => {
		drawer.open = true;
		// close drawe on item click
		document.querySelector('.mdc-list').addEventListener('click', () => {
			document.querySelector('.mdc-temporary-drawer').classList.remove('mdc-temporary-drawer--open');
		}, false);
	});

	// material commponent - tab bar
	const tabBar = new MDCTabBar(document.querySelector('#toolbar-tab-bar'));

	// let menu = new mdc.menu.MDCSimpleMenu(document.querySelector('.mdc-simple-menu'));
	// // Add event listener to some button to toggle the menu on and off.
	// document.querySelector('.tab-bar').addEventListener('click', () => menu.open = !menu.open);

	//swipe USAGE :
	var el = document.getElementById('swipezone');
	SwipeDetect.swipedetect(el, function (swipedir) {
		// swipedir contains either "none", "left", "right", "top", or "down"
		if (swipedir === "right") {
			drawer.open = true;
		}
	});

});