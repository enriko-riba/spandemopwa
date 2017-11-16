import * as ko from "knockout";

class Main {
    private test = ko.observable("radi");

    constructor(){
      const config = {
        apiKey: "AIzaSyD0cMNr0yCI-9LCCC7PcbEpOALrSXjCfcg",
        authDomain: "spandemopwa.firebaseapp.com",
        databaseURL: "https://spandemopwa.firebaseio.com",
        projectId: "spandemopwa",
        storageBucket: "spandemopwa.appspot.com",
        messagingSenderId: "805463871698"
      };
    }
}
export var vm = new Main();

/**
 * start ko binding.
 */
$(document).ready(() => {
  ko.applyBindings(vm);
});