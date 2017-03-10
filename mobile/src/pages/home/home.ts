import { Component } from '@angular/core';
import { NavController, AlertController, Events } from 'ionic-angular';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  items: any[];

  constructor(public events: Events, public http: Http,
              public navCtrl: NavController, 
              public alertCtrl: AlertController) {
    this.items = [];
    this.items.push({
        title: "Title",
        text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam pretium quam at est porta fringilla.",
        name: "Sam",
        number: "(555) 555-5555",
        location: "55 Arbor Way",
        taken: true,
        responder: {
          name: "Bob",
          phone: "(666) 666-6666"
        }
      });
      this.items.push({
        title: "Stuff",
        text: "Take Now",
        name: "Sam",
        number: "(555) 555-5555",
        taken: false,
        responder: {}
      });
  }

  buttonPressed(item){
    alert(item.title);
  }

  smsPressed(item){
    alert(item.number);
  }

  phonePressed(item){
    alert(item.number);
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
    this.items.unshift({
      title: "Added",
      text: "Take Now",
      name: "Sam",
      number: "(555) 555-5555",
      taken: false,
      responder: {}
    })
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
