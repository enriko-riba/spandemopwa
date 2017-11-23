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

    private Contact = new ContactInfo();

    constructor() {
        // this.SubscribeToDbCahnges();
        this.crateDialog();
    }

    // private SubscribeToDbCahnges = () => {
    //     var fsColRef = firebase.firestore().collection('contacts'); //ref().child('contacts');

    //     fsColRef.get().then();
    // }

    private crateDialog = () => {
        this.dialog = new MDCDialog(document.querySelector('#my-mdc-dialog'))

    }
    private showAddDialog = () => {
        this.dialogTitle('Add new contact');
        this.Contact = new ContactInfo();
        this.dialog.show();
    }

    private showEditDialog = (contactData) => {
        this.dialogTitle('Edit contact');
        //this.Contact = new ContactInfo(contactData);
        this.dialog.show();
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

class ContactInfo {
    public Name = ko.observable<string>();
    public LastName = ko.observable<string>();
    public Email = ko.observable<string>();
    public Phone = ko.observable<string>();
    public Favorite = ko.observable<boolean>();
    constructor(name: string = null, lastName: string = null, emial: string = null, phone: string = null, favorite: boolean = false) {
        this.Name = ko.observable(name);
        this.LastName = ko.observable(lastName);
        this.Email = ko.observable(emial);
        this.Phone = ko.observable(phone);
        this.Favorite = ko.observable(favorite);
    }
}
