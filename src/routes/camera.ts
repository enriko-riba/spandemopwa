import { Component } from "../decorators";
import { FirebaseHelper } from "../helper";
import * as ko from "knockout";
import * as $ from "jquery";
import { setInterval, clearInterval } from "timers";
import { ViewModelBase, RouteNavigationData } from "../SpaApplication";

@Component({
    name: 'camera',
    template: require('./camera.html')
})
export class CameraVM extends ViewModelBase {
    private canvas = document.querySelector('canvas');
    private video = document.querySelector('video');
    private asciiContainer : HTMLPreElement = document.getElementById("ascii") as HTMLPreElement;
    private handle :number = undefined;
    private ctx : CanvasRenderingContext2D;

    private debugText = ko.observable("");

    constructor() {
        super();

        FirebaseHelper.checkUserAndRedirectToSignin();
        
        var constraints = {
            audio: false,
            video: true
        };
        navigator.mediaDevices.getUserMedia(constraints)
                .then(this.handleSuccess)            
                .catch(this.handleError);

        this.video.onloadedmetadata = this.onOrentationChange;
        window.addEventListener('resize', this.onOrentationChange);
    }

    protected OnDeactivate(data: RouteNavigationData) {
        if(this.handle){
            clearInterval(this.handle as any);
        }
        this.video.onloadedmetadata = null;
        window.removeEventListener('resize', this.onOrentationChange);
    } 

    private onOrentationChange = () => {        
        var ow = w = $("#camera").innerWidth()- 4;
        var oh = h = $("#camera").innerHeight() - $("h1").outerHeight() - $("header").outerHeight()-4;
        var w, h, display;
        if (window.innerWidth > window.innerHeight) { 
            //  landscape           
            w = ow / 2;    
            display = "inline-block";    
        } else {
            //  portrait
            h = oh / 2;
            display = "block";
        }
        if(h && w){
            this.video.removeAttribute("style");
            this.video.setAttribute("style", `height:${h}px;width:${w}px;display:${display};`);
            this.asciiContainer.removeAttribute("style");
            this.asciiContainer.setAttribute("style", `height:${h}px;width:${w}px;display:${display};`); 
        }
        this.debugText("w: " + ow + ", h: " + oh +  ", videoW: " + this.video.width + ", videoH: " + this.video.height);
    }

    private contrastFactor = 180;    
    private contrast = (259 * (this.contrastFactor + 255)) / (255 * (259 - this.contrastFactor)); // calculate contrast factor -> http://www.dfstudios.co.uk/articles/image-processing-algorithms-part-5/
    private asciiChars = (" .,:;i1tfLCG08@").split("");
    
    private createAscii = ()=>{
        var resultChars = "";        
        var canvasWidth = this.canvas.width;
        var canvasHeight = this.canvas.height;        
        this.ctx.drawImage(this.video, 0, 0, canvasWidth, canvasHeight);
        var imageData = this.ctx.getImageData(0, 0, canvasWidth, canvasHeight);
        for (var y = 0; y < canvasHeight; y += 3) { // every other row because letters are not square
			for (var x = 0; x < canvasWidth; x += 2) {
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
    
    private handleSuccess = (stream: any) => {
        this.video.srcObject = stream;

        this.ctx = this.canvas.getContext("2d");
        if(!this.handle){
            this.handle = setInterval( ()=> {
                var str = this.createAscii();
                this.asciiContainer.innerHTML = str;
            }, 100) as any;
        }
    }
    
    private handleError = (error: any) => {
        console.log('navigator.getUserMedia error: ', error);
    }

    
}