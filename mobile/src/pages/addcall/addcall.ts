import { Component } from '@angular/core';
import { ViewController, NavParams } from 'ionic-angular';

@Component({
    selector: 'addcall',
    templateUrl: 'addcall.html'
})
export class AddCall {
    newCall: any;
    constructor(inputData: NavParams, public viewCtrl: ViewController) {
        //var dataFromPage = inputData.get('data');
        this.newCall = {}
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