import * as ko from "knockout";
import * as firebase from "firebase/app";
import { Component } from "../decorators";
import { FirebaseHelper } from "../helper";
import { ViewModelBase, RouteNavigationData } from "../SpaApplication";
import { UserMediaHelper, MediaDeviceInfo1 } from "../UserMediaHelper";
import { firestore } from "firebase/app";

declare var MediaRecorder: any;
@Component({
    name: 'speech',
    template: require('./speech.html')
})
export class SpeechToText extends ViewModelBase {

    private umh: UserMediaHelper;

    private isStreaming = ko.observable<boolean>(false);
    private storage = firebase.storage();
    private firestore = firebase.firestore();

    private streamData = [];
    private sourceAudio = ko.observable<any>();

    private mediaRecording; // = new MediaRecorder;

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
            .then(this.handleAudioStreamSuccess);
    }

    private handleAudioStreamSuccess = (stream) => {
        this.isStreaming(true);
        
        this.mediaRecording = new MediaRecorder(stream);
        this.mediaRecording.start();
        console.log( this.mediaRecording.state);
        console.log("recorder started");

        this.streamData = [];
        
        this.mediaRecording.ondataavailable = (e)=> {
            console.log(e);
            this.streamData.push(e.data);
        }

        this.mediaRecording.onstop = (e) => {
            console.log("recorder stopped");

            var blob = new Blob(this.streamData, { 'type' : 'audio/ogg; codecs=opus' });
            this.streamData = [];
            var audioURL = window.URL.createObjectURL(blob);
            this.sourceAudio(audioURL);

          }
    }


    private stopStream = () => {
        this.umh.stopStreaming();
        this.isStreaming(false);
        console.log("recorder started");
        this.mediaRecording.stop();
        console.log(this.streamData);
    }
}


