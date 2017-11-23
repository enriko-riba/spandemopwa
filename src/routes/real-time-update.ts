import { Component } from "../decorators";
import { FirebaseHelper } from "../helper";
import * as firebase from "firebase/app";
import * as ko from "knockout";
import { MDCDialog } from '@material/dialog';
require('firebaseui/dist/firebaseui.css');

@Component({
    name: 'real-time-update',
    template: require('./real-time-update.html')
})
export class DbUpdate {

    public dialog;
    private dialogTitle = ko.observable<string>('');

    private stories = ko.observableArray<any>([]);
    private user;
    private newStory = ko.observable<StoryModel>(new StoryModel());

    constructor() {
        this.user = firebase.auth().currentUser;
        console.log(this.user);
        this.getstories();
        this.crateDialog();
    }

    private getstories = () => {
        var fsColRef = firebase.firestore().collection('notes'); //ref().child('contacts');

        fsColRef.
            orderBy('date').
            limit(1).
            onSnapshot((collection) => {
                collection.docs.forEach((value, idx, array) => {
                    var data = value.data();
                    console.log(data);
                    this.stories().push(data);
                })
                this.stories.notifySubscribers();
                console.log(this.stories());
                // console.log(collection.docs[0].data());
            });
        // fsColRef.get().then((data)=>{
        //     console.log(data.docs[0].data());
        // });
    }

    private crateDialog = () => {
        this.dialog = new MDCDialog(document.querySelector('#my-mdc-dialog'));

    }
    private showAddDialog = () => {
        this.dialogTitle('Add new contact');
        this.dialog.show();
    }

    // private showEditDialog = (contactData) => {
    //     this.dialogTitle('Edit contact');
    //     //this.Contact = new ContactInfo(contactData);
    //     this.dialog.show();
    // }

    private shareStory = () => {
        //getlocation;
        var newStoryForDb = ko.toJS(this.newStory());
        // newStoryForDb.displayname = this.user.displayName;
        // newStoryForDb.email = this.user.email;
        newStoryForDb.date = new Date();
        newStoryForDb.location = this.getGeoLocation();
        console.log(newStoryForDb);
    }

    private getGeoLocation = ()=>{
        navigator.geolocation.getCurrentPosition((geopositio)=>{
           console.log(geopositio);
        }, (geoerror)=>{
            // switch(error.code) {
            //     case error.TIMEOUT:
            //       // The user didn't accept the callout
            //       showNudgeBanner();
            //       break;
            //   }
        });
        
    }

    // this.dialog.listen('MDCDialog:accept', function () {
    //     console.log('accepted');
    // })

    // this.dialog.listen('MDCDialog:cancel', function () {
    //     console.log('canceled');
    // })

    // document.querySelector('#dialog-activation').addEventListener('click', function (evt) {
    //     dialog.lastFocusedTarget = evt.target;
    //     dialog.show();
    // })
}

class StoryModel {
    public displayname = ko.observable<string>();
    public note = ko.observable<string>();
    public email = ko.observable<string>();
    public date = ko.observable<Date>();
    public location = ko.observable<string>();
    public votes = ko.observable<string>();
    public globalshare = ko.observable<boolean>();
    constructor(displayname: string = null, note: string = null, emial: string = null, date: Date = null, votes: string = null, globalshare: boolean = false) {
        this.displayname = ko.observable(displayname);
        this.note = ko.observable(note);
        this.email = ko.observable(emial);
        this.date = ko.observable(date);
        this.votes = ko.observable(votes);
        this.globalshare = ko.observable(globalshare);
    }
}
