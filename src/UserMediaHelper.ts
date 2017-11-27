export interface MediaDeviceInfo1 extends MediaDeviceInfo{
    text: string;
}

export class UserMediaHelper {
    private currentStream: MediaStream;
    private currentAudio : MediaDeviceInfo;
    private currentVideo : MediaDeviceInfo;
    
    public videoDevices : Array<MediaDeviceInfo1>;
    public audioDevices : Array<MediaDeviceInfo1>;

    public query() {
        return navigator.mediaDevices
                .enumerateDevices()
                .then(this.gotDevices)                
                .catch(this.handleError);
    }
    public setAudioDevice(device: MediaDeviceInfo){
        this.currentAudio = device;
        return this.getStream();
    }
    public setVideoDevice(device: MediaDeviceInfo){
        this.currentVideo = device;
        return this.getStream();
    }
    public get Stream() {
        return this.currentStream;
    }

    private gotDevices = (deviceInfos: [MediaDeviceInfo1])=> {
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

    public getStream = ()=> {
        if (this.currentStream) {
            this.currentStream.getTracks().forEach(function(track) {
                track.stop();
          });
        }
      
        var constraints = {
            audio: this.currentAudio ? { deviceId: {exact: this.currentAudio.deviceId}} : false,
            video: this.currentVideo ? { deviceId: {exact: this.currentVideo.deviceId}} : false
        };      
        return navigator.mediaDevices
                    .getUserMedia(constraints)
                    .then(this.gotStream)
                    .catch(this.handleError);
    }


    private handleError = (error: any) => {
        console.log('navigator.getUserMedia error: ', error);
        alert(JSON.stringify(error));
    }

    private gotStream=(stream: MediaStream)=> {
        this.currentStream = stream; // make stream available to console
        //videoElement.srcObject = stream;
        return this.currentStream;
      }
}