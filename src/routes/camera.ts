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
        const contrastFactor = 128;
        const asciiChars = (" .,:;i1tfLCG08@").split("");

        var resultChars: string;
        var context = this.canvas.getContext("2d");
        var canvasWidth = this.canvas.width;
        var canvasHeight = this.canvas.height;
        // calculate contrast factor -> http://www.dfstudios.co.uk/articles/image-processing-algorithms-part-5/
        var contrast = (259 * (contrastFactor + 255)) / (255 * (259 - contrastFactor));
        var imageData = context.getImageData(0, 0, canvasWidth, canvasHeight);
        for (var y = 0; y < canvasHeight; y += 2) { // every other row because letters are not square
			for (var x = 0; x < canvasWidth; x++) {
				// get each pixel's brightness and output corresponding character

				var offset = (y * canvasWidth + x) * 4;

				var color = this.getColorAtOffset(imageData.data, offset);
	
				// increase the contrast of the image so that the ASCII representation looks better
				// http://www.dfstudios.co.uk/articles/image-processing-algorithms-part-5/
				var contrastedColor = {
					red: this.bound(Math.floor((color.red - 128) * contrast) + 128, [0, 255]),
					green: this.bound(Math.floor((color.green - 128) * contrast) + 128, [0, 255]),
					blue: this.bound(Math.floor((color.blue - 128) * contrast) + 128, [0, 255]),
					alpha: color.alpha
				};

				// calculate pixel brightness
				// http://stackoverflow.com/questions/596216/formula-to-determine-brightness-of-rgb-color
				var brightness = (0.299 * contrastedColor.red + 0.587 * contrastedColor.green + 0.114 * contrastedColor.blue) / 255;

				var character = asciiChars[(asciiChars.length - 1) - Math.round(brightness * (asciiChars.length - 1))];

				resultChars += character;
			}
			resultChars += "\n";
		}
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
    
    private handleSuccess = (stream: any) => {
        this.video.srcObject = stream;
    }

    private adjustCanvasSize = () => {
        // if (window.innerWidth > window.innerHeight) {
        //     var w = ($("#camera").innerWidth() - 4) / 2;
        //     this.canvas.width = w;
        //     this.video.width = w;
        //     this.canvas.width = this.video.videoWidth;
        //     this.canvas.height = this.video.videoHeight;
        // } else {
        //     this.canvas.width = this.video.videoWidth;
        //     this.canvas.height = this.video.videoHeight;
        // }
        this.canvas.width = this.video.videoWidth;
        this.canvas.height = this.video.videoHeight;
    }

    private handleError = (error: any) => {
        console.log('navigator.getUserMedia error: ', error);
    }

    
}