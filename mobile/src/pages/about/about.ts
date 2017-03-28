import { Component } from '@angular/core';
import { NavController, AlertController, Events } from 'ionic-angular';
import { GetTakenCalls, DropCall, FinishCall } from '../../networking/take'
import { DropBackupCall, GetBackupCalls, FinishBackupCall } from '../../networking/backup'
import { DomSanitizer } from '@angular/platform-browser';
import { Http } from '@angular/http';
import { Storage } from '@ionic/storage';
import { Push } from '@ionic/cloud-angular';
import 'rxjs/add/operator/map';

@Component({
  selector: 'page-about',
  templateUrl: 'about.html'
})
export class AboutPage {
  items: any[];
  backupcalls: any[];
  loggedIn: Boolean;

  constructor(public http: Http, public events: Events, private push: Push,
    public navCtrl: NavController, public storage: Storage,
    public alertCtrl: AlertController, private sanitizer: DomSanitizer) {
    this.items = [];
    this.backupcalls = [];
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
  updateData(refresher?){
    GetTakenCalls(this.http, this.storage).then((res) => {
      console.log(res);
      this.items = this.FormatList(res);
    });
    GetBackupCalls(this.http, this.storage).then(res => {
      this.backupcalls = this.FormatList(res);
      if(refresher){
        refresher.complete();
      }
    })
  }

  finishCall(call){
    FinishCall(this.http, this.storage, call).then((data) => {
      this.getData(data);
    });
  }

  dropCall(call){
    DropCall(this.http, this.storage, call).then(data => {
      this.getData(data);
    })
  }

  dropBackupCall(call){
    DropBackupCall(this.http, this.storage, call).then(data => {
      this.getData(data);
    })
  }

  finishBackupCall(call){
    FinishBackupCall(this.http, this.storage, call).then(data => {
      this.getData(data);
    })
  }

  getData(data){
    if (data.success){
        this.updateData();
      } else {
        this.alertCtrl.create({
          title: "Error",
          message: data.message
        }).present();
      }
  }

  showBackups(call){
    this.alertCtrl.create({
        title: "Backups",
        message: call.backup.join("\n")
      }).present();
  }

/**
 * Formats the list for display
 * @param list pass it the list that the server sends us
 */
  FormatList(list) {
    for (let pos = 0; pos < list.length; pos++) {
      if (list[pos].createdAt) {
        let date = new Date(list[pos].createdAt)
        list[pos].createdAt = date;
        let hours = date.getHours();
        let minutes = date.getMinutes();
        let ampm = hours > 12 ? 'pm' : 'am';
        hours = hours % 12;
        hours = hours ? hours : 12; // the hour '0' should be '12'
        let finalminutes = minutes < 10 ? '0'+minutes : minutes;
        list[pos].timeStamp = hours + ":" + finalminutes + " " + ampm;
      }
    }
    return list;
  }

  sanitize(url:string){
    return this.sanitizer.bypassSecurityTrustUrl(url);
  }
  replaceSpace(url:string, replacewith:string){
    if(url){
        return url.replace(" ", replacewith);
    } else {
      return url;
    }
  }

  ionViewDidLoad() {
    this.updateData();
  }
}
