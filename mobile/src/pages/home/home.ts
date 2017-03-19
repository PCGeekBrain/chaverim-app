import { Component } from '@angular/core';
import { NavController, AlertController, Events } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { Http } from '@angular/http';
import { getToken } from '../../networking/auth';
import { getCalls, postCall } from '../../networking/calls'
import 'rxjs/add/operator/map';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  items: any[];
  canEdit: Boolean;
  loggedIn: Boolean;

  constructor(public events: Events, public http: Http,
              public navCtrl: NavController, public storage: Storage,
              public alertCtrl: AlertController) {
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
    getCalls(http, storage).then((res) => {
      this.items = this.clearTime(res.reverse());
    })
  }

  joinCall(item){
    //Working import
    //getToken(this.http, this.storage).then((res) => {
    //  alert('res =>' + res);
    //});
  }

  responderPressed(item){
    let responder = this.alertCtrl.create({
      title: item.responder.name,
      subTitle: item.responder.number,
      buttons: ['OK']
    });
    responder.present();
  }

  takecallPressed(item){
    //this.events.publish("item:taken", item);
    console.log(item._id);
  }

  updateData(){
    getCalls(this.http, this.storage).then((res) => {
      this.items = this.clearTime(res.reverse());
    });
  }

  addItem(){
    let prompt = this.alertCtrl.create({
      title: 'Add Call',
      message: "Enter the details for the call you want to add",
      inputs: [
        { name: 'title',  placeholder: 'Title'},
        { name: 'text',  placeholder: 'Details'},
        { name: 'name',  placeholder: 'Name'},
        { name: 'number',  placeholder: 'Number'},
        { name: 'location',  placeholder: 'Location'},
      ],
      buttons: [
        { text: 'Cancel',handler: data => {}},
        { text: 'Save',handler: data => {
            let body = {
              title: data.title,  text: data.text,
              name: data.name,  number: data.number,
              location: data.location,  taken: false, responder: {}
            }
            postCall(this.http, this.storage, body)
            .then((data) => {
              if (data.success){
                this.updateData();
              } else {
                this.alertCtrl.create({
                  title: "Error",
                  message: data.message
                });
              }
            });
          }
        }
      ]
    });
    prompt.present();
  }

  clearTime(list){
    for (let pos = 0; pos < list.length; pos++){
      if (list[pos].createdAt){
        let date = new Date(list[pos].createdAt)
        list[pos].createdAt = date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
      }
    }
    return list;
  }
}
