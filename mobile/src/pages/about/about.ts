import { Component } from '@angular/core';
import { NavController, AlertController, Events } from 'ionic-angular';
import { GetTakenCalls, DropCall, FinishCall } from '../../networking/take'
import { Http } from '@angular/http';
import { Storage } from '@ionic/storage';
import 'rxjs/add/operator/map';

@Component({
  selector: 'page-about',
  templateUrl: 'about.html'
})
export class AboutPage {
  items: any[];
  loggedIn: Boolean;

  constructor(public http: Http, public events: Events,
    public navCtrl: NavController, public storage: Storage,
    public alertCtrl: AlertController) {
      //Get items from storage
    storage.ready().then(() => {
      storage.get('logged_in').then((res) => {
        this.loggedIn = res;
      });
    });
    //update from the server
    this.updateData();
    //set subscriptions
    this.events.subscribe("item:taken", (item) => {
      this.updateData();
    });
    this.events.subscribe("user:auth", (value) => {
      this.loggedIn = value;
    });
  }
  /**
   * Updates the data in the lisst
   */
  updateData(){
    GetTakenCalls(this.http, this.storage).then((res) => {
      console.log(res);
      this.items = this.FormatList(res.reverse());
    });
  }

  finishCall(call){
    FinishCall(this.http, this.storage, call).then((data) => {
      if (data.success){
        this.updateData();
      } else {
        this.alertCtrl.create({
          title: "Error",
          message: data.message
        }).present();
      }
    });
  }

  dropCall(call){
    DropCall(this.http, this.storage, call).then((data) => {
      if (data.success){
        this.updateData();
      } else {
        this.alertCtrl.create({
          title: "Error",
          message: data.message
        }).present();
      }
    })
  }

/**
 * Formats the list for display
 * @param list pass it the list that the server sends us
 */
  FormatList(list) {
    for (let pos = 0; pos < list.length; pos++) {
      if (list[pos].createdAt) {
        let date = new Date(list[pos].createdAt)
        list[pos].createdAt = date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
      }
    }
    return list;
  }
}
