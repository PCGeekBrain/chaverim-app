import { Component } from '@angular/core';
import { NavController, AlertController, Events } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { Http } from '@angular/http';
import { getToken } from '../../networking/auth';
import { getCalls } from '../../networking/calls'
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
      // storage.get('logged_In').then((res) => {
      //   this.loggedIn = res;
      // });
    });
    this.canEdit = true;
    this.loggedIn = true;
    //Fill up the list
    this.items = [];
    getCalls(http, storage).then((res) => {
      this.items = res;
      console.log(this.items);
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
      subTitle: item.responder.phone,
      buttons: ['OK']
    });
    responder.present();
  }

  takecallPressed(item){
    this.events.publish("item:taken", item);
    let index = this.items.indexOf(item);
    if(index >= 0){
      this.items.splice(index, 1);
    }
  }

  updateData(){
    getCalls(this.http, this.storage).then((res) => {
      this.items = res;
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
            this.items.unshift({
              title: data.title,
              text: data.text,
              name: data.name,
              number: data.number,
              location: data.location,
              taken: false,
              responder: {}
            })
          }
        }
      ]
    });
    prompt.present();
  }

}
