import { Component } from '@angular/core';
import { Storage } from '@ionic/storage';
import { Http } from '@angular/http';
import { NavController, AlertController, Events } from 'ionic-angular';
import { getToken } from '../../networking/authorized'

@Component({
  selector: 'page-contact',
  templateUrl: 'contact.html'
})
export class ContactPage {
  userInfo: any;
  loggedIn: Boolean;
  userData: any;
  editInfo: any;

  constructor(public events: Events, public http: Http,
              public navCtrl: NavController, public storage: Storage,
              public alertCtrl: AlertController) {
    this.userInfo = {email: null, password: null}
    this.userData = {}
    this.editInfo = {}
    this.getUserData();
    storage.ready().then(() => {
      storage.get('logged_in').then((res) => {
        this.loggedIn = res;
      });
    });
  }

  login() {
    console.log(this.userInfo);
    getToken(this.http, this.storage, this.userInfo).then(result => {
      if(result.success){
        this.events.publish("user:auth", true);
        this.loggedIn = true;
        this.storage.ready().then(() => {
          this.storage.set('email', this.userInfo.email);
          this.storage.set('password', this.userInfo.password);
        });
        this.getUserData();
        this.alertCtrl.create({
          title: "Success!",
          message: "Login sucessfull"
        }).present();
      } else {
        this.alertCtrl.create({
          title: "Error",
          message: result.message
        }).present();
      }
    }).catch(err => {
      this.alertCtrl.create({
          title: "Matrix Error 404",
          message: "Matrix not found. Please make sure the matrix is plugged in."
      }).present();
    });
  }
  logout() {
    console.log("Logging Out");
    this.events.publish("user:auth", false);
    this.loggedIn = false;
    this.storage.ready().then(() => {
      this.storage.set('token', null);
      this.storage.set('number', null);
      this.storage.set('role', null);
      this.storage.set('email', null);
      this.storage.set('password', null);
    });
  }
  editData(){
    console.log(this.editInfo);
  }

  getUserData() {
    this.storage.ready().then(() => {
      this.storage.get('name').then((value) => {
        this.userData.name = value;
      });
      this.storage.get('number').then((value) => {
        this.userData.number = value;
      });
      this.storage.get('role').then((value) => {
        this.userData.role = value;
      });
    });
  }
}
