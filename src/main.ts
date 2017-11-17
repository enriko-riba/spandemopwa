import * as ko from "knockout";
import * as $ from "jquery";
import * as helper from "./helper";
import {RouteHelper} from "./routes/routeHelper";
import { Application } from "./SpaApplication";

//  firebase
import * as firebase from "firebase/app";
import "firebase/firestore";

// css 
require('./css/site.scss');

require('./routes/about');
class Main extends Application {
	private userPhotoURL = ko.observable("");
	private userDisplayName = ko.observable("");
	public showUserInfo = ko.observable(false);
	
	constructor() {
		super();
		
		//helper.registerServiceWorker('sw.js');
		helper.initFirebase();
		
		this.IsDebugToConsoleEnabled(true);
		var rh = new RouteHelper(this);
		rh.initRouting();
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