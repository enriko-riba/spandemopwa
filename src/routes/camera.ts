import { Component } from "../decorators";
import { FirebaseHelper } from "../helper";
import * as ko from "knockout";

@Component({
    name: 'camera',
    template: require('./camera.html')
})
export class CameraVM {
    private canvas = document.querySelector('canvas');
    private video = document.querySelector('video');
    private snapshotButton: HTMLElement = document.querySelector('button#snapshot');

    constructor() {
     FirebaseHelper.isUserSignedIn();

        this.video.onloadeddata = this.adjustCanvasSize;

        var constraints = {
            audio: false,
            video: true
        };
        navigator.mediaDevices.getUserMedia(constraints)
            .then(this.handleSuccess)
            .catch(this.handleError);

        this.snapshotButton.onclick = this.snapshotClick;
    }

    private snapshotClick = () => {
        this.canvas.width = this.video.videoWidth;
        this.canvas.height = this.video.videoHeight;
        this.canvas.getContext('2d').drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);
    };

    private handleSuccess = (stream: any) => {
        this.video.srcObject = stream;
    }

    private adjustCanvasSize = () => {
        this.canvas.width = this.video.videoWidth;
        this.canvas.height = this.video.videoHeight;
    }

    private handleError = (error: any) => {
        console.log('navigator.getUserMedia error: ', error);
    }
}