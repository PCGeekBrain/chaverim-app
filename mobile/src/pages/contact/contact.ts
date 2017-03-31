import { Component } from '@angular/core';
import { Storage } from '@ionic/storage';
import { Http } from '@angular/http';
import { NavController, AlertController, Events } from 'ionic-angular';
import { Push, PushToken } from '@ionic/cloud-angular';
import { getToken } from '../../networking/authorized';
import { RevokeToken, SendToken } from '../../networking/pushToken';
import { getUserInfo, updateUserInfo } from '../../networking/editUser';

@Component({
  selector: 'page-contact',
  templateUrl: 'contact.html'
})
export class ContactPage {
  userInfo: any;
  loggedIn: Boolean;
  userData: any;
  editInfo: any;

  constructor(public events: Events, public http: Http, public push: Push,
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
        this.events.publish("user:edit", result.canEdit);
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
        //Send token to server
        this.sendToken();
      } else {
        this.alertCtrl.create({
          title: "Error",
          message: result.message
        }).present();
      }
    }).catch(err => { //NEO has left the matrix and broken our app :-(
      this.alertCtrl.create({
          title: "Matrix not found",
          message: "Neo, Please make sure the matrix is plugged in."
      }).present();
    });
  }
  logout() {
    console.log("Logging Out");
    this.events.publish("user:auth", false);
    this.loggedIn = false;
    this.revokeToken();
  }

  sendToken = function(){
    this.push.register().then((t: PushToken) => {
      return this.push.saveToken(t);
    }).then((t: PushToken) => {
      this.storage.ready().then(() => {
        this.storage.set('pushToken', t.token);
      });
      console.log('Token Saved => ', t.token); //log the token that was saved
      SendToken(this.http, this.storage, t).then((res) => { //send it to server
        if(res.success === false){
            this.alertCtrl.create({
            title: "Error",
            message: "Could not set up notifications"
          }).present();
        }
      });
    })
  }

  revokeToken = function(){ //Revoke the token that we have
    this.push.unregister().then(() => {   //Notify Ionic that the app is unregistered.
      this.storage.ready().then(() =>{  //get the token from storage
        this.storage.set('number', "");
        this.storage.set('role', "");
        this.storage.set('email', "");
        this.storage.set('password', "");
        this.storage.set('logged_in', false);
        this.storage.get('pushToken').then(token => {
          console.log('Revokeing Token => ', token);  // log the token.
          RevokeToken(this.http, this.storage, token).then((res) => {
            if(res.success === false){
              this.alertCtrl.create({
                title: "Token Invalidation Error",
                message: res.message
              }).present();
            } else {
              this.alertCtrl.create({
                title: "Success",
                message: "Successfull logout"
              }).present();
            }
          });
        })
      });
    });
  }

  editData(){
    console.log(this.editInfo);
    updateUserInfo(this.http, this.storage, this.editInfo).then((res) => {
      if(res.success){
        this.refreshUserData();
        if (this.editInfo.field === 'password'){
          this.storage.ready().then(() => {
            this.storage.set('password', this.editInfo.value);
          })
        }
      } else {
        this.alertCtrl.create({
          title: "Error",
          message: res.message
        }).present();
      }
    });
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

  refreshUserData(){
    getUserInfo(this.http, this.storage).then((res) => {
      this.storage.ready().then(() => {
        this.storage.set('name', res.name);
        this.storage.set('number', res.number);
        this.storage.set('role', res.role);
      });
      this.userData.name = res.name;
      this.userData.number = res.number;
      this.userData.role = res.role;
    });
  }
}
