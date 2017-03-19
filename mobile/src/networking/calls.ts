import { Headers, Http } from '@angular/http'
import { getUserLoggedIn } from './userInfo'
import { Storage } from '@ionic/storage';
import { authorizedCall, httpTypes } from './authorized'
import 'rxjs/add/operator/toPromise';

export const getCalls = function(http: Http, storage: Storage){
    let serverGet = function(resolve, reject){

        authorizedCall(http, storage, httpTypes.GET, '/api/calls')
        .then(res => {
            if (res.status = 200){
                console.log(res);
                resolve(JSON.parse(res._body).calls)
            } else {
                console.log(res);
                resolve([]);
            }
        })
        .catch(err => {
            console.log('err:')
            console.log(err);
            resolve([]);
        });
    }

    return new Promise<Array<{}>>((resolve, reject) => {
        serverGet(resolve, reject);
    });
}