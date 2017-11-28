/** @module UserMediaHelper */

declare function ImageCapture(mst: MediaStreamTrack): void;

/**
 * Adds textual description of the device
 * @export
 * @interface MediaDeviceInfo1
 * @extends {MediaDeviceInfo}
 */
export interface MediaDeviceInfo1 extends MediaDeviceInfo {
    text: string;
}
/**
 * 
 * 
 * @export
 * @class UserMediaHelper
 */
export class UserMediaHelper {
    private currentStream: MediaStream;
    private currentAudio: MediaDeviceInfo;
    private currentVideo: MediaDeviceInfo;
    private lastError: string;

    /**
     * Holds the discovered video devices.
     * @type {Array<MediaDeviceInfo1>}
     * @memberof UserMediaHelper
     */
    public videoDevices: Array<MediaDeviceInfo1>;

    /**
     * Holds the discovered audio devices.
     * @type {Array<MediaDeviceInfo1>}
     * @memberof UserMediaHelper
     */
    public audioDevices: Array<MediaDeviceInfo1>;

    /**
     * Starts enumerating the device capabilities. On success the results can be obtained in videoDevices and audioDevices.
     * @returns {(Promise<void | MediaDeviceInfo1[]>)} 
     * @memberof UserMediaHelper
     */
    public query(): Promise<void | MediaDeviceInfo1[]> {
        return navigator.mediaDevices
            .enumerateDevices()
            .then(this.gotDevices)
            .catch(this.handleError);
    }

    /**
     * Sets the desired audio devices and obtains its media stream.
     * @param {MediaDeviceInfo} device 
     * @returns {(Promise<void | MediaStream>)} 
     * @memberof UserMediaHelper
     */
    public setAudioDevice(device: MediaDeviceInfo): Promise<void | MediaStream> {
        this.currentAudio = device;
        return this.getStream();
    }

    /**
     * Sets the desired video devices and obtains its media stream.
     * @param {MediaDeviceInfo} device 
     * @returns {(Promise<void | MediaStream>)} 
     * @memberof UserMediaHelper
     */
    public setVideoDevice(device: MediaDeviceInfo): Promise<void | MediaStream> {
        this.currentVideo = device;
        return this.getStream();
    }

    /**
     * Returns the current media stream.
     * @readonly
     * @memberof UserMediaHelper
     */
    public get Stream() {
        return this.currentStream;
    }

    /**
     * Takes a phot based on the the current video stream, track 0.
     * @param {HTMLImageElement} [img] a dom image element displaying the captured image
     * @returns {(Promise<void | Blob>)} the blob with the captured image but only if no img is given 
     * @memberof UserMediaHelper
     */
    public takePhoto(img?: HTMLImageElement): Promise<void | Blob> {
        const mediaStreamTrack = this.Stream.getVideoTracks()[0];
        const imageCapture = new ImageCapture(mediaStreamTrack);

        return imageCapture.takePhoto()
            .then((blob: Blob) => {
                if (img) {
                    img.src = URL.createObjectURL(blob);
                    img.onload = () => { URL.revokeObjectURL(img.src); };
                } else {
                    return blob;
                }
            })
            .catch(error => {
                console.log('error: ', error);
                this.lastError = JSON.stringify(error);
            });
    }
    /**
     * 
     * Captures an image from the current video stream.
     * @returns {(Promise<void|ImageBitmap>)} 
     * @memberof UserMediaHelper
     */
    public grabImage() :Promise<void|ImageBitmap> {
        const mediaStreamTrack = this.Stream.getVideoTracks()[0];
        const imageCapture = new ImageCapture(mediaStreamTrack);
        return imageCapture.grabFrame();
    }
    public stopStreaming = ()=>{
        if (this.currentStream) {
            this.currentStream.getTracks().forEach(function (track) {
                track.stop();
            });
        }
    }
    private gotDevices = (deviceInfos: [MediaDeviceInfo1]) => {
        this.videoDevices = [];
        this.audioDevices = [];

        for (var i = 0; i !== deviceInfos.length; ++i) {
            var deviceInfo = deviceInfos[i];
            if (deviceInfo.kind === 'audioinput') {
                deviceInfo.text = deviceInfo.label || 'microphone ' + (this.audioDevices.length + 1);
                this.audioDevices.push(deviceInfo);
            } else if (deviceInfo.kind === 'videoinput') {
                deviceInfo.text = deviceInfo.label || 'camera ' + (this.videoDevices.length + 1);
                this.videoDevices.push(deviceInfo);
            } else {
                console.log('Found one other kind of source/device: ', deviceInfo);
            }
        }
        return deviceInfos;
    }

    private getStream = (): Promise<void | MediaStream> => {
        this.stopStreaming();

        var constraints = {
            audio: this.currentAudio ? { deviceId: { exact: this.currentAudio.deviceId } } : false,
            video: this.currentVideo ? { deviceId: { exact: this.currentVideo.deviceId } } : false
        };
        return navigator.mediaDevices
            .getUserMedia(constraints)
            .then(this.gotStream)
            .catch(this.handleError);
    }


    private handleError = (error: any) => {
        console.log('error: ', error);
        this.lastError = JSON.stringify(error);
    }

    private gotStream = (stream: MediaStream) => {
        this.currentStream = stream;
        return this.currentStream;
    }
}