import { Component } from '@angular/core';
import { Storage } from '@ionic/storage';
import { Http } from '@angular/http';
import { NavController, AlertController, Events } from 'ionic-angular';
import { Push, PushToken } from '@ionic/cloud-angular';
import { getToken } from '../../networking/authorized';
import { RevokeToken, SendToken } from '../../networking/pushToken';
import { getUserInfo, updateUserInfo } from '../../networking/editUser';
import { Deploy } from '@ionic/cloud-angular';

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
              public alertCtrl: AlertController, public deploy: Deploy) {
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
          title: "Login Sucessfull",
          message: "So, you have discovered the truth?"
        }).present();
        //Send token to server
        this.sendToken();
      } else {
        this.alertCtrl.create({
          title: "Login Failed",
          message: result.message
        }).present();
      }
    }).catch(err => { //NEO has left the matrix and broken our app :-(
      this.alertCtrl.create({
          title: "Matrix not found",
          message: "I heard a thousand voices screaming in terror, and then suddenly silenced."
      }).present();
    });
  }
  logout() {
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
            title: "Notification Error",
            message: "There seems to have been an error setting up notifications.\nPlease contact admin@chaverimch.com so we may contact the provider"
          }).present();
          console.log(res.data)
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
                title: "Goodbye",
                message: "Why does it take a minute to say hello and forever to say goodbye?"
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

  update(){
    this.deploy.check().then((snapshotAvailable: boolean) => {
      if (snapshotAvailable) {
        this.alertCtrl.create({
          title: "Downloading",
          message: "Downloading latest version on production channel.. \nPlease stay a while so the download my compleate. \nThe update will install next time you open the app."
        }).present();
        // When snapshotAvailable is true, you can apply the snapshot
        this.deploy.download().then(() => {
          return this.deploy.extract();
        });
      }
      else {
        this.alertCtrl.create({
          title: "No Updates available",
          message: "Sadly, it seems they have fallen to the dark side of the force."
        }).present();
      }
    });
  }
}
