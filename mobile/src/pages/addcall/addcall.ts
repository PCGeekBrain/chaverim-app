import { Component } from '@angular/core';
import { ViewController, NavParams } from 'ionic-angular';

@Component({
    selector: 'addcall',
    templateUrl: 'addcall.html'
})
export class AddCall {
    newCall: any;
    buttonText: String;
    title: String;
    constructor(inputData: NavParams, public viewCtrl: ViewController) {
        let call = inputData.get('call');
        this.title = inputData.get('title');
        this.buttonText = "Create"
        if (call){
            this.newCall = call;
            this.buttonText = "Edit"
        } else {
            console.log(call);
            this.newCall = {
                caller: {
                    name: ""
                }
            }
        }
        if (!this.title){
            this.title = "Create New Call"
        }
    }
    createCall(newCall){
        this.newCall = newCall;
        this.newCall.submit = true;
        this.dismiss()
    }
    dismiss() {
        this.viewCtrl.dismiss(this.newCall);
    }
}