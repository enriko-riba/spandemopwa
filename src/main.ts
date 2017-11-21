import * as ko from "knockout";
import * as $ from "jquery";
import { ServiceWorkerHelper, FirebaseHelper } from "./helper";
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
	private userPhotoURL = ko.observable("");
	private userDisplayName = ko.observable("");
	public showUserInfo = ko.observable(false);
	public routeHelper;

	private menuItems =[]; 

	constructor() {
		super();

		ServiceWorkerHelper.registerServiceWorker('sw.js')
			.then(() => {
				navigator.serviceWorker
					.getRegistration()
					.then((reg: ServiceWorkerRegistration) => {
						ServiceWorkerHelper.getUserSubscription(reg)
							.then((sub) => {
								if (!sub) {
									ServiceWorkerHelper.subscribeUser();
								}
							})
					});
			});

		FirebaseHelper.initFirebase();
		FirebaseHelper.verifyUserAuthentication();
		this.IsDebugToConsoleEnabled(true);
		this.routeHelper = new RouteHelper(this);
		this.routeHelper.initRouting();

		
	}

	/**
	 * Handles click on user image.
	 */
	private userInfoClick = async () => {
		if (firebase.auth().currentUser)
			this.showUserInfo(true);
	};
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
		document.querySelector('.mdc-list').addEventListener('click',  ()=> {
			document.querySelector('.mdc-temporary-drawer').classList.remove('mdc-temporary-drawer--open');
		  }, false);
	});
	
	// material commponent - tab bar
	const tabBar = new MDCTabBar(document.querySelector('#toolbar-tab-bar'));
});