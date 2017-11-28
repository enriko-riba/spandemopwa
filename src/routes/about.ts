import { Component } from "../decorators";
import * as ko from "knockout";

@Component({
    name: 'about',
    template: require('./about.html')
})
export class About {
    private version = ko.observable("0.1.2");
    constructor() {
    }
}