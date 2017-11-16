import {vm} from "../main";
import { Component } from "../decorators";
import * as ko from "knockout";

/**
 * VM for route not found page.
 */
@Component({
    name: 'route-not-found',
    template: require('./route-not-found.html')
  })
export class Route404 {
    private notFoundRouteName = ko.observable("");
    private notFoundImgURL = ko.observable(require('../assets/master.jpg'));
    constructor() {
        var router = vm.router();
        this.notFoundRouteName(`"${router.ActiveRoute().params['route']}"`);        
    }
}
