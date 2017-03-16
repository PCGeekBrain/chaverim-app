import { Component } from '@angular/core';
import { NavController, AlertController, Events } from 'ionic-angular';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';

@Component({
  selector: 'page-about',
  templateUrl: 'about.html'
})
export class AboutPage {

  constructor(public http: Http, public events: Events,
              public navCtrl: NavController) {
      this.events.subscribe("item:taken", (item) => {
        alert(item);
      })
  }



}
