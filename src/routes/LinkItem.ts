import * as ko from "knockout";

export class LinkItem {

    constructor(href: string, text: string, componentName: string, isActive: boolean = false, addToMenu = true) {
        this.isActive(isActive);
        this.addToMenu = addToMenu;
        this.href = href;
        this.text = text;
        this.component = componentName;
    }

    public isActive = ko.observable(false);
    public addToMenu: boolean;
    public href = "";
    public text = "";
    public component = "";
}