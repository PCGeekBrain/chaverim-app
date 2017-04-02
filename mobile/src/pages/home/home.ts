import { Component } from '@angular/core';
import { NavController, AlertController, Events, ModalController } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { Http } from '@angular/http';
import { AddCall } from '../addcall/addcall';
import { getCalls, postCall, dropCall, editCall } from '../../networking/calls'
import { TakeCall } from '../../networking/take'
import { BackupCall } from '../../networking/backup'
import { Push } from '@ionic/cloud-angular';
import 'rxjs/add/operator/map';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  items: any[];
  canEdit: Boolean;
  loggedIn: Boolean;

  constructor(public events: Events, public http: Http, public push: Push,
              public navCtrl: NavController, public storage: Storage,
              public alertCtrl: AlertController, public modalCtrl: ModalController) {
    // Get all the items from storage
    storage.ready().then(() => {
      storage.get('canEdit').then((res) => {
        this.canEdit = res;
      });
      storage.get('logged_in').then((res) => {
        this.loggedIn = res;
      });
    });
    //Fill up the list
    this.items = [];
    this.updateData();
    console.log(this.items);

    this.events.subscribe("user:auth", (value) => {
      this.loggedIn = value;
    });
    this.events.subscribe("user:edit", value => {
      this.canEdit = value;
    });
  }

  joinCall(item){
    BackupCall(this.http, this.storage, item).then(res => {
      this.showResult(res);
    });
  }

  responderPressed(item, type){
    if (type === 'responder'){
      this.alertCtrl.create({
        title: item.responder.name,
        subTitle: item.responder.number,
        buttons: ['OK']
      }).present();
    } else if (type === 'backup'){
      this.alertCtrl.create({
        title: item.backup.name,
        subTitle: item.backup.number,
        buttons: ['OK']
      }).present();
    }
  }

  takecallPressed(item){
    TakeCall(this.http, this.storage, item).then((data) => {
      if (data.success){
        this.updateData();
        this.events.publish("item:taken", item);
      } else {
        this.alertCtrl.create({
          title: "Error",
          message: data.message
        }).present();
      }
    });
  }

  updateData(refresher?){
    getCalls(this.http, this.storage).then((res) => {
      this.items = this.clearTime(res);
      this.items.sort(function(a, b){
        return b.createdAt - a.createdAt;
      })
      if(refresher){
        refresher.complete();
      }
    });
  }

  cancelCall(item){
    dropCall(this.http, this.storage, item).then((res) => {
      this.showResult(res);
    })
  }

  editACall(call){
    let modal = this.modalCtrl.create(AddCall, {call: call});
    modal.onDidDismiss(data => {
      editCall(this.http, this.storage, data);
    });
    modal.present();
  }

  showResult(data){
      if(data.success){
        this.updateData();
      } else {
        this.alertCtrl.create({
        title: "Error",
        message: data.message
      }).present();
    }
  }

  addItem(){
    var modal = this.modalCtrl.create(AddCall);
    modal.onDidDismiss((data) => {
      if(data.submit){
        console.log(data);   
        let body = {
          title: data.title,  details: data.details,
          name: data.caller.name,  number: data.caller.number,
          location: data.caller.location,  taken: false, responder: {}
        }
        postCall(this.http, this.storage, body)
        .then((data) => {
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
    });
    modal.present();
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
        list[pos].timeStamp = hours + ":" + finalminutes + " " + ampm;
      }
    }
    return list;
  }

  ionViewDidEnter() {
    this.updateData();
  }

  testClick(){
    alert("Fuck you!")
  }
}
