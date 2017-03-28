import { NgModule, ErrorHandler } from '@angular/core';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { CloudSettings, CloudModule } from '@ionic/cloud-angular';
import { IonicStorageModule } from '@ionic/storage';
import { MyApp } from './app.component';
import { AboutPage } from '../pages/about/about';
import { ContactPage } from '../pages/contact/contact';
import { LogsPage } from '../pages/logs/logs'
import { HomePage } from '../pages/home/home';
import { TabsPage } from '../pages/tabs/tabs';
import { AddCall } from '../pages/addcall/addcall';
import { SafeUrlPipe } from '../services/safe-url.pipe';

const cloudSettings: CloudSettings = {
  core: {
    app_id: '625f140a'
  },
  'push': {
    'sender_id': '877265351073',
    'pluginConfig': {
      'ios': {
        'badge': true,
        'sound': true
      },
      'android': {
        'iconColor': '#343434'
      }
    }
  }
}


@NgModule({
  declarations: [
    MyApp,
    AboutPage,
    ContactPage,
    LogsPage,
    HomePage,
    TabsPage,
    AddCall,
    SafeUrlPipe
  ],
  imports: [
    IonicModule.forRoot(MyApp),
    CloudModule.forRoot(cloudSettings),
    IonicStorageModule.forRoot()

  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    AboutPage,
    ContactPage,
    HomePage,
    TabsPage,
    LogsPage,
    AddCall
  ],
  providers: [{provide: ErrorHandler, useClass: IonicErrorHandler}]
})

export class AppModule {}
