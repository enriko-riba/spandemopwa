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
	public routeHelper;
	public userIsSignedIn = ko.observable<boolean>(false);
	private currentUser = ko.observable<UserInfo>(new UserInfo);


	constructor() {
		super();

		ServiceWorkerHelper.registerServiceWorker('sw.js');
			// .then(() => {
			// 	navigator.serviceWorker
			// 		.getRegistration()
			// 		.then((reg: ServiceWorkerRegistration) => {
			// 			ServiceWorkerHelper.getUserSubscription(reg)
			// 				.then((sub) => {
			// 					if (!sub) {
			// 						ServiceWorkerHelper.subscribeUser();
			// 					}
			// 				})
			// 		});
			// });

		FirebaseHelper.initFirebase();
		// FirebaseHelper.verifyUserAuthentication();
		this.verifyUserAuthentication();


		this.IsDebugToConsoleEnabled(true);
		this.routeHelper = new RouteHelper(this);
		this.routeHelper.initRouting();
	}

	/**
	* Checks if the current user is signed-in and redirects to HREF_SIGNIN
	*/
	public verifyUserAuthentication() {
		var oldUser = firebase.auth().currentUser;
		var routeHash = window.location.hash;
		firebase.auth().onAuthStateChanged((user) => {
			if (oldUser == null) {
				FirebaseHelper.isUserSignedIn(routeHash);
			}
			if (user) {
				this.userIsSignedIn(true);
				this.currentUser(new UserInfo(user.displayName, user.email, user.emailVerified, user.photoURL, user.uid));

				console.log("sign in");
				console.log('current user:', user.email);
			} else {
				this.userIsSignedIn(false);
				window.location.href = HREF_SIGNIN;
				console.log("signed out");
				FirebaseHelper.isUserSignedIn();
			}
		},
			(error) => {
				console.log(error);
			});

	}

	public signOut() {
		FirebaseHelper.signOutWithFirebaseUi();
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

	//USAGE:

	var el = document.getElementById('swipezone');
	SwipeDetect.swipedetect(el, function (swipedir) {
		// swipedir contains either "none", "left", "right", "top", or "down"
		if (swipedir === "right") {
			drawer.open = true;
		}
	});

});