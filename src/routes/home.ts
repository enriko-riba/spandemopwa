import { Component } from "../decorators";
import * as helper from "../helper";
import * as ko from "knockout";

@Component({
    name: 'home',
    template: require('./home.html')
})
export class Home {
    private imgURL = ko.observable(require('../assets/funny-home.jpg'));
    constructor() {
        helper.checkUser();
    }
}