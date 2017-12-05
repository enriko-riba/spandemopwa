import * as ko from "knockout";
import * as firebase from "firebase/app";
import { Component } from "../decorators";
import { FirebaseHelper } from "../helper";
import { ViewModelBase, RouteNavigationData } from "../SpaApplication";
import { UserMediaHelper, MediaDeviceInfo1 } from "../UserMediaHelper";
import { firestore } from "firebase/app";

@Component({
    name: 'speech',
    template: require('./speech.html')
})
export class SpeechToText extends ViewModelBase {

    private umh: UserMediaHelper;

    private isStreaming = ko.observable<boolean>(false);
    private storage = firebase.storage();
    private firestore = firebase.firestore();

    private streamData;
    constructor() {
        super();
        FirebaseHelper.checkUserAndRedirectToSignin();
        this.umh = new UserMediaHelper();

        this.umh.query().then((info) => {
            console.log(info);
        })

    }

    protected OnDeactivate(data: RouteNavigationData) {
        if (!!this.umh)
            this.umh.stopStreaming();
    }

    private streamAudio = (): Promise<void> => {
        return this.umh.setAudioDevice(this.umh.audioDevices[0])
            .then((s: MediaStream) => {
                this.isStreaming(true);
                console.log(s);
            });
    }

    private stopStream = () => {
        this.umh.stopStreaming();
        this.isStreaming(false);
    }
}


