import * as ko from "knockout";
import * as $ from "jquery";
import {ServiceWorkerHelper, FirebaseHelper} from "./helper";
import { RouteHelper } from "./routes/routeHelper";
import { Application } from "./SpaApplication";

//  firebase
import * as firebase from "firebase/app";
import "firebase/firestore";


// css 
require('./css/site.scss');

class Main extends Application {
	private userPhotoURL = ko.observable("");
	private userDisplayName = ko.observable("");
	public showUserInfo = ko.observable(false);
	public routeHelper;

	constructor() {
		super();

		ServiceWorkerHelper.registerServiceWorker('sw.js')
		.then(()=> {
			navigator.serviceWorker
			.getRegistration()
			.then((reg: ServiceWorkerRegistration) => {
					ServiceWorkerHelper.getUserSubscription(reg)
					.then( (sub)=> {
						if(!sub){
							ServiceWorkerHelper.subscribeUser();
						}
					})					
			});
		});

		FirebaseHelper.initFirebase();

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

	public navSlideIn = ()=>{
		var navElement = document.getElementById("nav-mobile");
		navElement.classList.remove('slide-out');
		navElement.classList.add('slide-in');
		var dimmer = document.createElement("div");
		dimmer.classList.add('dimmer');
		document.getElementById("app-content").appendChild(dimmer);

		navElement.addEventListener('click',()=>{
			this.navSlideOut();
		})
		
	}

	public navSlideOut = ()=>{
		var navElement = document.getElementById("nav-mobile");
		navElement.classList.remove('slide-in');
		navElement.classList.add('slide-out');
		document.getElementsByClassName("dimmer")[0].remove();
	}
}

export var vm = new Main();

/**
 * start ko binding.
 */
$(document).ready(() => {
	ko.applyBindings(vm);
});