import * as ko from "knockout";
import * as firebase from "firebase/app";
import { Component } from "../decorators";
import { FirebaseHelper, generateUUID } from "../helper";
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

        var fileName = generateUUID();
        this.mediaRecording = new MediaRecorder(stream);
        this.mediaRecording.start(1000); // return result after every 1000 miliseconds
        console.log( this.mediaRecording.state);
        console.log("recorder started");

        this.streamData = [];
        
        this.mediaRecording.ondataavailable = (e)=> {
            this.streamData.push(e.data);
            var blob = new Blob([e.data], { 'type' : 'audio/ogg; codecs=opus' });
            console.log(blob);
            // send data to google speech api
        }

        this.mediaRecording.onstop = (e) => {
            console.log("recorder stopped");

            var blob = new Blob(this.streamData, { 'type' : 'audio/ogg; codecs=opus' });
            this.uploadAudio(blob, fileName);
            // console.log(this.blobToBase64(blob));
            this.streamData = [];
            var audioURL = window.URL.createObjectURL(blob);
            this.sourceAudio(audioURL);

          }
    }

    private blobToBase64 = (data:Blob)=> {
        var reader = new FileReader();
        var base64; 
        reader.readAsDataURL(data); 
        reader.onloadend = function() {
           base64 = reader.result;
           base64 = base64.split(',')[1];
           console.log(base64);
        }
    }

    private stopStream = () => {
        this.umh.stopStreaming();
        this.isStreaming(false);
        console.log("recorder started");
        this.mediaRecording.stop();
        console.log(this.streamData);
    }


    /**
     * Uploads the image blob to storage and inserts metadata to firestore DB.
     */
    private uploadAudio = (audio: Blob, fileName) => {
        // var fileName = generateUUID();
        var uid = firebase.auth().currentUser.uid;
        var storageRef = this.storage.ref().child('audio').child(fileName);
        return storageRef.put(audio).catch(error => {
            alert(error);
        });
    }
}


