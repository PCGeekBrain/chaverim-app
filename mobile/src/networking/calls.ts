import { Http } from '@angular/http'
import { getUserLoggedIn } from './userInfo'
import { Storage } from '@ionic/storage';
import { authorizedCall, httpTypes } from './authorized'
import 'rxjs/add/operator/toPromise';

export const getCalls = function(http: Http, storage: Storage){
    let serverGet = function(resolve, reject){

        authorizedCall(http, storage, httpTypes.GET, '/api/calls')
        .then(res => {
            if (res.status = 200){
                resolve(JSON.parse(res._body).calls)
            } else {
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

export const postCall = function(http: Http, storage: Storage, body){
    return new Promise<{success: Boolean, message: string}>((resolve, reject) => {
        authorizedCall(http, storage, httpTypes.POST, '/api/calls', body)
        .then((res) => {
            let data = JSON.parse(res._body)
            resolve(data);
        })
        .catch(err => {
            console.warn('Error in postCall')
            console.warn(err);
        })
    })
}