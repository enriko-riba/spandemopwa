import * as ko from "knockout";
import * as $ from "jquery";
import { ServiceWorkerHelper, FirebaseHelper, UserInfo, HREF_SIGNIN } from "./helper";
import { RouteHelper } from "./routes/routeHelper";
import { Application } from "./SpaApplication";

//  firebase
import * as firebase from "firebase/app";
import "firebase/firestore";
import * as mdc from 'material-components-web';
import { MDCTabBar, MDCTabBarFoundation} from '@material/tabs';

const Hammer = require("hammerjs");

// css 
require('./css/site.scss');

class Main extends Application {
	public routeHelper: RouteHelper;
	public userIsSignedIn = ko.observable<boolean>(false);
	private currentUser = ko.observable<UserInfo>(new UserInfo);

	private showLoader = ko.observable<boolean>(true);

	constructor() {
		super();

		ServiceWorkerHelper.registerServiceWorker('sw.js');
		FirebaseHelper.initFirebase();
      
		this.IsDebugToConsoleEnabled(true);
		this.routeHelper = new RouteHelper(this);
		this.routeHelper.initRouting();

		var requestedHref = window.location.hash;
		if (requestedHref == HREF_SIGNIN) requestedHref = '#/home';
		this.trackAuth(requestedHref);
		this.showLoader(false);

		console.log(this.ActiveRoute().href);
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
		// close drawer on item click
		document.querySelector('.first-mdc-list').addEventListener('click', () => {
			document.querySelector('.mdc-temporary-drawer').classList.remove('mdc-temporary-drawer--open');
		}, false);
		document.querySelector('.second-mdc-list').addEventListener('click', () => {
			document.querySelector('.mdc-temporary-drawer').classList.remove('mdc-temporary-drawer--open');
		}, false);

	});

	// material commponent - tab bar
	const tabBar = new MDCTabBar(document.querySelector('#toolbar-tab-bar'));

	let menu = new mdc.menu.MDCSimpleMenu(document.querySelector('.mdc-simple-menu'));
	// Add event listener to some button to toggle the menu on and off.
	document.querySelector('.tab-bar').addEventListener('click', () => menu.open = !menu.open);

	let swipezone = document.querySelector('#swipezone');
	var manager = new Hammer.Manager(swipezone);
	var swipe = new Hammer.Swipe({
		treshold: 6
	});
	manager.add(swipe);

	manager.on('swipe', (e) => {
		var direction = e.offsetDirection;
		if (direction === 4) {
			if (e.srcEvent.clientX > (document.body.clientWidth / 4)) {
				vm.routeHelper.slideToPage('right');
			} else {
				drawer.open = true;
			}
		}
		if (direction === 2) {
			vm.routeHelper.slideToPage('left');
		}
	});
});