import { Http } from '@angular/http'
import { Storage } from '@ionic/storage';
import { authorizedCall, httpTypes } from './authorized'
import 'rxjs/add/operator/toPromise';

export const getUserInfo = function(http:Http, storage:Storage ){
    return new Promise((resolve, reject) => {
        authorizedCall(http, storage, httpTypes.GET, '/api/profile').then((res) => {
            resolve(JSON.parse(res._body));
        }).catch(err => {
            console.log('err:')
            console.log(err);
            resolve({success: false, message: 'Internal Error 901'});
        });
    });
}