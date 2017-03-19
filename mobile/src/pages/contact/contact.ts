import { Component } from '@angular/core';

import { NavController } from 'ionic-angular';

@Component({
  selector: 'page-contact',
  templateUrl: 'contact.html'
})
export class ContactPage {
  userInfo: any;

  constructor(public navCtrl: NavController) {
    this.userInfo = {email: null, password: null}
  }
  login() {
    console.log(this.userInfo);
  }

}
