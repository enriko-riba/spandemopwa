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
    private story = ko.observable<StoryModel>(new StoryModel());
    public firestoreNotesRef = firebase.firestore().collection('notes');
    public saveFunction = ko.observable<Function>();

    constructor() {
        FirebaseHelper.checkUserAndRedirectToSignin();
        this.user = firebase.auth().currentUser;
        console.log(this.user);
        this.getstories();
        this.crateDialog();

    }

    private getstories = () => {
        this.firestoreNotesRef.
            orderBy('date', 'desc').
            limit(15).
            onSnapshot((collection) => {
                this.stories([]);
                collection.docs.forEach((value, idx, array) => {
                    var data = value.data();
                    data.docRefId = value.id;
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
        this.saveFunction(this.shareStory);
        this.dialog.show();
    }

    private showEditDialog = (storyData) => {
        this.dialogTitle('Edit contact');
        this.story(storyData);
        this.saveFunction(this.updateStory);
        //this.Contact = new ContactInfo(contactData);
        this.dialog.show();
    }

    private shareStory = () => {
        //getlocation;
        var newStoryForDb = ko.toJS(this.story());
        newStoryForDb.displayname = this.user.displayName;
        newStoryForDb.email = this.user.email;
        newStoryForDb.date = new Date();
        // TODO -location fix
        newStoryForDb.location = null;
        newStoryForDb.votes = 0;

        console.log(newStoryForDb);
        this.firestoreNotesRef.add(newStoryForDb).then((data) => {
            console.log(data);
            console.log("success");
        }).catch((error) => {
            console.log(error);
        })
    }

    private updateStory = () => {
        var docId = this.story().docRefId;
        var updatedStory = ko.toJS(this.story());
        delete updatedStory.docRefId;
        updatedStory.date = new Date();
        // TODO -location fix
        updatedStory.location = null;
        console.log(updatedStory);
        this.firestoreNotesRef.doc(docId).set(updatedStory)
            .then((data) => {
                console.log(data);
                console.log("success");
            }).catch((error) => {
                console.log(error);
                console.log("error");
            })
    }

    private deleteStory = (storyData) => {
        var docId = storyData.docRefId;
        this.firestoreNotesRef.doc(docId).delete()
            .then((data) => {
                console.log(data);
                console.log("success");
            }).catch((error) => {
                console.log(error);
                console.log("error");
            })
    }


    private updateVote = (storyData)=>{
        var docId = storyData.docRefId;
        var updatedvotes = storyData.votes + 1;
        this.firestoreNotesRef.doc(docId).update({votes:updatedvotes})
        .then((data) => {
            console.log(data);
            console.log("success");
        }).catch((error) => {
            console.log(error);
            console.log("error");
        })
    }

    // private getGeoLocation = ()=>{
    //     navigator.geolocation.getCurrentPosition((geopositio)=>{
    //        console.log(geopositio);
    //     }, (geoerror)=>{
    //         // switch(error.code) {
    //         //     case error.TIMEOUT:
    //         //       // The user didn't accept the callout
    //         //       showNudgeBanner();
    //         //       break;
    //         //   }
    //     });

    // }

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
    public docRefId: string;
    public displayname: string;
    public note: string;
    public email: string;
    public date: Date;
    public location: string;
    public votes: number;
    public globalshare: Boolean;
    constructor(displayname: string = null, note: string = null, emial: string = null, date: Date = null, votes: number = null, globalshare: boolean = false) {
        this.displayname = displayname;
        this.note = note;
        this.email = emial;
        this.date = date;
        this.votes = votes;
        this.globalshare = globalshare;
    }
}
