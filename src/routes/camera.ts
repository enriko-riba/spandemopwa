import { Component } from "../decorators";
import { FirebaseHelper } from "../helper";
import * as ko from "knockout";
import * as $ from "jquery";

@Component({
    name: 'camera',
    template: require('./camera.html')
})
export class CameraVM {
    private canvas = document.querySelector('canvas');
    private video = document.querySelector('video');

    constructor() {
        FirebaseHelper.checkUserAndRedirectToSignin();

        this.video.onloadeddata = this.adjustCanvasSize;

        var constraints = {
            audio: false,
            video: true
        };
        navigator.mediaDevices.getUserMedia(constraints)
            .then(this.handleSuccess)
            .catch(this.handleError);
    }

    private onSnapshotClick = () => {
        this.canvas.width = this.video.videoWidth;
        this.canvas.height = this.video.videoHeight;
        this.canvas.getContext('2d').drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);
    };
    private onAsciiClick = () => {
    }
    private handleSuccess = (stream: any) => {
        this.video.srcObject = stream;
    }

    private adjustCanvasSize = () => {
        if (window.innerWidth > window.innerHeight) {
            var w = ($("#camera").innerWidth() - 4) / 2;
            this.canvas.width = w;
            this.video.width = w;
            this.canvas.height = this.video.height;
        } else {
            this.canvas.width = this.video.videoWidth;
            this.canvas.height = this.video.videoHeight;
        }
    }

    private handleError = (error: any) => {
        console.log('navigator.getUserMedia error: ', error);
    }
}