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

    private ContactsList = ko.observableArray<any>([]);

    private Contact = new ContactInfo();

    constructor() {
        this.GetContacts();
        this.crateDialog();
    }

    private GetContacts = () => {
        var fsColRef = firebase.firestore().collection('contacts'); //ref().child('contacts');

        fsColRef.onSnapshot((collection)=>{
            collection.docs.forEach((value,idx,array)=>{
                var data = value.data();
                console.log(data);
                // this.ContactsList().push(data);
            })
            this.ContactsList
            console.log(collection.docs[0].data());
        });
        // fsColRef.get().then((data)=>{
        //     console.log(data.docs[0].data());
        // });
    }

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
    public firstname = ko.observable<string>();
    public lastname = ko.observable<string>();
    public email = ko.observable<string>();
    public phonenumeber = ko.observable<string>();
    public favorite = ko.observable<boolean>();
    constructor(name: string = null, lastName: string = null, emial: string = null, phone: string = null, favorite: boolean = false) {
        this.firstname = ko.observable(name);
        this.lastname = ko.observable(lastName);
        this.email = ko.observable(emial);
        this.phonenumeber = ko.observable(phone);
        this.favorite = ko.observable(favorite);
    }
}
