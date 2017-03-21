import { Http } from '@angular/http'
import { Storage } from '@ionic/storage';
import { authorizedCall, httpTypes } from './authorized'
import { URL } from './constants';
import 'rxjs/add/operator/toPromise';

export const getCalls = function(http: Http, storage: Storage){
    let serverGet = function(resolve, reject){

        authorizedCall(http, storage, httpTypes.GET, URL + '/api/calls')
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
        authorizedCall(http, storage, httpTypes.POST, URL + '/api/calls', body)
        .then((res) => {
            let data = JSON.parse(res._body)
            resolve(data);
        })
        .catch(err => {
            console.warn('Error in postCall')
            console.warn(err);
        });
    });
}

export const dropCall = function(http: Http, storage: Storage, call){
    return new Promise<{success: Boolean, message: string}>((resolve, reject) => {
        authorizedCall(http, storage, httpTypes.POST, URL + '/api/calls/cancel', {id: call._id})
        .then(res => {
            let data = JSON.parse(res._body);
            resolve(data);
        })
        .catch(err => {
            console.warn('Error in postCall')
            console.warn(err);
        });
    });
}