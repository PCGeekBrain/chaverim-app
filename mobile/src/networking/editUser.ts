import { Http } from '@angular/http'
import { Storage } from '@ionic/storage';
import { authorizedCall, httpTypes } from './authorized';
import { URL } from './constants';
import 'rxjs/add/operator/toPromise';

const profile_url = URL + '/api/profile';

export const getUserInfo = function(http:Http, storage:Storage ){
    return new Promise<{success: boolean, message: string, id?, name?, number?, role?}>((resolve, reject) => {
        authorizedCall(http, storage, httpTypes.GET, profile_url).then((res) => {
            resolve(JSON.parse(res._body));
        }).catch(err => {
            console.error(err);
            resolve({success: false, message: "Internal Error 901 (I'm a teapot!)"});
        });
    });
}

export const updateUserInfo = function(http:Http, storage:Storage, body){
    return new Promise<{success: boolean, message: string}>((resolve, reject) => {
        authorizedCall(http, storage, httpTypes.PUT, URL + '/auth/users', body).then((res) => {
            resolve(JSON.parse(res._body));
        }).catch(err => {
            console.error(err);
            resolve({success: false, message: "Internal Error 902 (Matrix offline)"})
        });
    });
}