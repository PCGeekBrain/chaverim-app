import { Component } from '@angular/core';
import { NavController, NavParams, Events } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { Http } from '@angular/http';
import { getCallLogs } from '../../networking/calls'

/*
  Generated class for the Logs page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-logs',
  templateUrl: 'logs.html'
})
export class LogsPage {
  loggedIn: boolean;
  items: any;

  constructor(public events: Events, public navCtrl: NavController, public navParams: NavParams,
              public storage: Storage, public http: Http) {
    storage.ready().then(() => {
      storage.get('logged_in').then((res) => {
        this.loggedIn = res;
      });
    });
    this.items = [];

    this.events.subscribe("user:auth", (value) => {
      this.loggedIn = value;
    });
  }

  updateData(refresher?){
    console.log("Updating Data");
    getCallLogs(this.http, this.storage).then((res) => {
      this.items = this.clearTime(res);
      this.items.sort(function(a, b){
        return b.createdAt - a.createdAt;
      })
      if(refresher){
        refresher.complete();
      }
    })
    if(refresher){
      refresher.complete();
    }
  }

  ionViewDidEnter() {
    this.updateData();
  }

  clearTime(list){
    for (let pos = 0; pos < list.length; pos++){
      if (list[pos].createdAt){
        let date = new Date(list[pos].createdAt)
        list[pos].createdAt = date;
        let hours = date.getHours();
        let minutes = date.getMinutes();
        let ampm = hours > 12 ? 'pm' : 'am';
        hours = hours % 12;
        hours = hours ? hours : 12; // the hour '0' should be '12'
        let finalminutes = minutes < 10 ? '0'+minutes : minutes;
        let display_date = (date.getMonth() + 1) + "/" + date.getDate() + "/" + date.getFullYear()
        list[pos].timeStamp = display_date + " " + hours + ":" + finalminutes + " " + ampm;
      }
    }
    return list;
  }

}
