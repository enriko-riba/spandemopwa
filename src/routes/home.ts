import { Component } from "../decorators";
import {FirebaseHelper} from "../helper";
import {Howl} from "howler";
import * as ko from "knockout";
import { ViewModelBase, RouteNavigationData } from "../SpaApplication";

@Component({
    name: 'home',
    template: require('./home.html')
})
export class HomeVM extends ViewModelBase {
    private howl : Howl;
    constructor() {
        super();
        
        if(!this.howl) {
            this.howl = new Howl({
                src: ["assets/starwarsintro.mp3"],
                preload: true,
                autoplay: false,
                loop: true,
                volume: 0.9
            });
        }
        this.howl.play();        
        
        FirebaseHelper.checkUserAndRedirectToSignin();
    }
    protected OnDeactivate(data: RouteNavigationData) {
        if(!!this.howl)
            this.howl.stop();
    }
}