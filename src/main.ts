import * as ko from "knockout";
import * as $ from "jquery";
import * as helper from "./helper";
import { RouteHelper } from "./routes/routeHelper";
import { Application } from "./SpaApplication";

import * as materialize from "materialize-css/dist/js/materialize";
// import "materialize-loader";

//  firebase
import * as firebase from "firebase/app";
import "firebase/firestore";


// css 
require('./css/site.scss');
require('../node_modules/materialize-css/dist/css/materialize.min.css');
// require('materialize-loader');

class Main extends Application {
	private userPhotoURL = ko.observable("");
	private userDisplayName = ko.observable("");
	public showUserInfo = ko.observable(false);
	public routeHelper;

	constructor() {
		super();

		helper.registerServiceWorker('sw.js')
		.then(()=> {
			navigator.serviceWorker
			.getRegistration()
			.then((reg: ServiceWorkerRegistration) => {
					helper.getUserSubscription(reg)
					.then( (sub)=> {
						if(!sub){
							helper.subscribeUser();
						}
					})					
			});
		});

		helper.initFirebase();

		this.IsDebugToConsoleEnabled(true);
		this.routeHelper = new RouteHelper(this);
		this.routeHelper.initRouting();
	
		$(document).ready(() => {
		// TODO: fix this
		console.log(materialize); // necessary for materialize functions to work!!  
		($(".button-collapse") as any).sideNav(
			{draggable: true}
		);
		});
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
});