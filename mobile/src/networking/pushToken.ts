import { Http } from '@angular/http'
import { Storage } from '@ionic/storage';
import { authorizedCall, httpTypes } from './authorized';
import { URL } from './constants';
import { PushToken } from '@ionic/cloud-angular';
import 'rxjs/add/operator/toPromise';

const url = URL + '/api/device/register'

/**
 * Call this to get a list of all calls user is backing up
 * @param http angular Http instance
 * @param storage Ionic storage instance
 */
export const SendToken = function(http: Http, storage: Storage, token:PushToken){
    return new Promise<{success:boolean, message?:string, data?:any}>((resolve, reject) => {
        authorizedCall(http, storage, httpTypes.POST, url, {
            token: token.token
        })
        .then(res => {
            if (res.status = 200){
                resolve(JSON.parse(res._body));
            } else {
                var result = 
                resolve({success: false, data: JSON.parse(res._body)});
            }
        })
        .catch(err => {
            console.log('err:');
            console.log(err);
            resolve({success: false, message: "Internal Error"});
        });
    });
}

export const RevokeToken = function(http: Http, storage: Storage, token:String){
    return new Promise<{success:boolean, message:string}>((resolve, reject) => {
        if(token === undefined || token === null){
            resolve({success: false, message: "No token to revoke"});
        }
        authorizedCall(http, storage, httpTypes.DELETE, url, {
            token: token
        })
        .then(res => {
            if (res.status = 200){
                resolve(JSON.parse(res._body));
            } else {
                resolve(JSON.parse(res._body));
            }
        })
        .catch(err => {
            console.log('err:');
            console.log(err);
            resolve({success: false, message: "Internal Error"});
        });
    });
}