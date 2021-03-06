import * as ko from "knockout";
import * as $ from "jquery";
import * as firebase from "firebase/app";
import { Component } from "../decorators";
import { FirebaseHelper, generateUUID, imgToCanvas } from "../helper";
import { setInterval, clearInterval } from "timers";
import { ViewModelBase, RouteNavigationData } from "../SpaApplication";
import { UserMediaHelper, MediaDeviceInfo1 } from "../UserMediaHelper";

@Component({
    name: 'camera',
    template: require('./camera.html')
})
export class CameraVM extends ViewModelBase {
    private canvas = document.querySelector('canvas');
    private video = document.querySelector('video');
    private asciiContainer = document.getElementById("ascii") as HTMLPreElement;

    private cameraIndex = 0;
    private umh: UserMediaHelper;
    private asciiRenderer: AsciiRenderer;


    private isCanvasVisible = ko.observable(false);
    private isAsciiVisible = ko.observable(false);
    private isVideoVisible = ko.observable(false);

    private storage = firebase.storage();
    private firestore = firebase.firestore();

    constructor() {
        super();

        FirebaseHelper.checkUserAndRedirectToSignin();
        this.umh = new UserMediaHelper();
        this.umh.query()
            .then(() => {
                $("#videoBtn").trigger("click");
                $("#videoBtn").focus();
            });
    }

    protected OnDeactivate(data: RouteNavigationData) {
        if (this.asciiRenderer) {
            this.asciiRenderer.stopRendering();
        }
        if (!!this.umh)
            this.umh.stopStreaming();
    }

    private onAsciiClick = () => {
        this.hideElements();
        var promise = Promise.resolve();
        if (this.isStreamBroken) {
            promise = promise.then(this.recreateStream);
        }
        promise = promise.then(this.startAscii);
    }
    private startAscii = () => {
        this.asciiRenderer = new AsciiRenderer(this.video, this.canvas);
        this.asciiRenderer.startRendering(this.asciiContainer);
        this.isAsciiVisible(true);
    }

    private perfTime: PerfData;

    private onSnapshotClick = () => {      
        //this.hideElements();
        // this.umh.takePhoto()
        //     .then((blob : Blob)=>{
        //         this.isCanvasVisible(true);
        //         var bytes = new Uint8Array(blob as any);
        //         var ctx = this.canvas.getContext('2d');
        //         var imageData = ctx.createImageData(this.video.videoWidth, this.video.videoHeight);
        //         for (var i=0; i<imageData.data.length; i++) {
        //             imageData.data[i] = bytes[i];
        //         }
        //         ctx.putImageData(imageData, 0, 0);
        //     });
        $("#capture-photo").trigger("click");
    }
    private onFileSelect = (vm, e) => {
        this.perfTime = {
            start: performance.now(),
            t: performance.now()
        };
        
        this.hideElements();
        this.fitCanvas();        

        var ctx = this.canvas.getContext('2d');
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        ctx.fillText("uploading...", 50, 50);
        this.isCanvasVisible(true);
        
        var img = new Image();
        img.onload = () => {
            ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            imgToCanvas(ctx, img);
            URL.revokeObjectURL(img.src);
            this.perfLog('image to canvas time', this.perfTime);

            this.uploadImage(file)
                .then(() => {
                    this.perfLog('image upload time', this.perfTime);
                    this.renderCompletedText(ctx);
                    console.log('finished in: ',this.perfTime.t - this.perfTime.start);
                });
        }

        var file = e.target.files[0];
        img.src = URL.createObjectURL(file);
        this.perfLog('image preparation time', this.perfTime);
    }

    private onGrabClick = () => {
        this.hideElements();
        var promise = Promise.resolve();
        if (this.isStreamBroken) {
            promise = promise.then(this.recreateStream);
        }
        promise = promise.then(() => {
            this.umh.grabImage()
                .then((bmp: ImageBitmap) => {
                    this.fitCanvas();
                    var ctx = this.canvas.getContext('2d');
                    imgToCanvas(ctx, bmp)
                    this.isCanvasVisible(true);
                    ctx.canvas.toBlob(blob => 
                        this.uploadImage(blob)
                            .then(()=> this.renderCompletedText(ctx)));
                });
        });
    }

    private onVideoClick = () => {
        this.hideElements();
        var promise = Promise.resolve();
        if (this.isStreamBroken) {
            promise = promise.then(this.recreateStream);
        }
        promise = promise.then(() => this.isVideoVisible(true));
    }

    private onChangeCameraClick = () => {
        if (++this.cameraIndex >= this.umh.videoDevices.length)
            this.cameraIndex = 0;

        this.recreateStream().then(() => {
            $("#videoBtn").trigger("click");
            $("#videoBtn").focus();
        });
    }

    private hideElements() {
        this.isVideoVisible(false);
        this.isCanvasVisible(false);
        this.isAsciiVisible(false);
        if (!!this.asciiRenderer) {
            this.asciiRenderer.stopRendering();
        }
    }

    private renderCompletedText(ctx: CanvasRenderingContext2D){
        const s = "done, tap to continue!";
        const x = 10;
        const y = ctx.canvas.height - 50;
        ctx.font = 'italic 12pt Calibri';
        ctx.fillStyle = "gray";
        var tm = ctx.measureText(s);
        ctx.fillRect(x, y, tm.width + 30, 40);

        ctx.fillStyle = "blue";
        ctx.fillText(s, x+10, y + 30);
    }
    private fitCanvas = () =>{
        var h = window.innerHeight;
        var w = window.innerWidth;
        var hdrH = $('header').outerHeight();
        var tlbH =$('.toolbar').outerHeight();
        var maxH = h - hdrH - tlbH;
        this.canvas.height = maxH;
        this.canvas.width = w;
    }
    private get isStreamBroken() {
        return !this.umh.Stream || !this.umh.Stream.active;
    }

    private recreateStream = (): Promise<void> => {
        return this.umh.setVideoDevice(this.umh.videoDevices[this.cameraIndex])
            .then((s: MediaStream) => {
                this.video.srcObject = s;
            });
    }

    private handleError = (error: any) => {
        console.log('navigator.getUserMedia error: ', error);
    }

    /**
     * Uploads the image blob to storage and inserts metadata to firestore DB.
     */
    private uploadImage = (img: Blob | ImageBitmap) => {
        var fileName = generateUUID();
        var uid = firebase.auth().currentUser.uid;
        var storageRef = this.storage.ref().child(uid).child(fileName);
        return storageRef.put(img).catch(error => {
            alert(error);
        });
    }

   
    private perfLog(text: string, data: PerfData) {
        data.t = performance.now() - data.t;
        console.log(text + ': ', data.t);
        data.t = performance.now();
    }
}

type PerfData = { 
    start: number,
    t: number
}

class AsciiRenderer {
    constructor(
        private video: HTMLVideoElement,
        private canvas: HTMLCanvasElement) { }

    private contrastFactor = 100;
    private contrast = (259 * (this.contrastFactor + 255)) / (255 * (259 - this.contrastFactor)); // calculate contrast factor -> http://www.dfstudios.co.uk/articles/image-processing-algorithms-part-5/
    private asciiChars = (" ¸.-:;=+x#!1TF%8@").split("");
    private ctx: CanvasRenderingContext2D;

    private handle: number = undefined;

    public startRendering = (asciiContainer: HTMLPreElement) => {
        if (!this.handle) {
            this.ctx = this.canvas.getContext("2d");
            this.handle = setInterval(() => {
                var str = this.createAscii();
                asciiContainer.innerHTML = str;
            }, 150) as any;
        }
    }
    public stopRendering = () => {
        if (!!this.handle) {
            clearInterval(this.handle as any);
            this.handle = undefined;
        }
    }

    private createAscii = () => {
        var resultChars = "";
        var canvasWidth = this.canvas.width;
        var canvasHeight = this.canvas.height;
        this.ctx.drawImage(this.video, 0, 0, canvasWidth, canvasHeight);
        var imageData = this.ctx.getImageData(0, 0, canvasWidth, canvasHeight);
        for (var y = 0; y < canvasHeight; y += 2) { // every other row because letters are not square
            for (var x = 0; x < canvasWidth; x += 1) {
                // get each pixel's brightness and output corresponding character

                var offset = (y * canvasWidth + x) * 4;
                var color = this.getColorAtOffset(imageData.data, offset);
                // increase the contrast of the image so that the ASCII representation looks better
                // http://www.dfstudios.co.uk/articles/image-processing-algorithms-part-5/
                var contrastedColor = {
                    red: this.bound(Math.floor((color.red - 128) * this.contrast) + 128, [0, 255]),
                    green: this.bound(Math.floor((color.green - 128) * this.contrast) + 128, [0, 255]),
                    blue: this.bound(Math.floor((color.blue - 128) * this.contrast) + 128, [0, 255]),
                    alpha: color.alpha
                };
                // calculate pixel brightness
                // http://stackoverflow.com/questions/596216/formula-to-determine-brightness-of-rgb-color
                var brightness = (0.299 * contrastedColor.red + 0.587 * contrastedColor.green + 0.114 * contrastedColor.blue) / 255;
                var character = this.asciiChars[(this.asciiChars.length - 1) - Math.round(brightness * (this.asciiChars.length - 1))];
                resultChars += character;
            }
            resultChars += "\n";
        }
        return resultChars;
    }

    private bound(value, interval) {
        return Math.max(interval[0], Math.min(interval[1], value));
    }
    private getColorAtOffset(data, offset) {
        return {
            red: data[offset],
            green: data[offset + 1],
            blue: data[offset + 2],
            alpha: data[offset + 3]
        };
    }
}