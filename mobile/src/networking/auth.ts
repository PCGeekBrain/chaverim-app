//import { Http } from '@angular/http';
import { Headers } from '@angular/http';
import { getUserCredentials, setUserLoggedIn } from './userInfo';
import 'rxjs/add/operator/toPromise';

export const getToken = function(http, storage, userInfo?){    //get the http and storage services from the calling application

    let hitServer = function(http, storage, userInfo, resolve){
        let headers = new Headers();
        headers.append('Content-Type', 'application/json');
        console.log({msg: 'Running request', userInfo});
        http.post('/auth/authenticate', {email: userInfo.email, password: userInfo.password}, {headers: headers})
        .toPromise()
        .then(res => {
            let data = JSON.parse(res._body);
            if (data.success){
                storage.ready().then(() => {
                    storage.set('token', data.token);
                    storage.set('name', data.name);
                    storage.set('number', data.number);
                    storage.set('role', data.role);
                    if (['responder', 'dispatcher', 'moderator', 'admin'].indexOf(data.role) !== -1){
                        storage.set('canEdit', true);
                        data.canEdit = true;
                    } else {
                        storage.set('canEdit', false);
                        data.canEdit = true;
                    }
                });
                setUserLoggedIn(storage, true);
            } else {
                setUserLoggedIn(storage, false);
                console.log("TODO let user know his username and password are invalid");
            }
            resolve(data);
        })
        .catch(err => {
            setUserLoggedIn(storage, false);
            resolve({success: false, message: err});
        });
    }

    return new Promise<{success, message, token?, name?, number?, role?}>((resolve, reject) => {   //return a promise so that the other ends of this call will not slow down
        if(!userInfo) {
            getUserCredentials(storage).then((res) => {
                hitServer(http, storage, res, resolve);
            });
        } else {
            hitServer(http, storage, userInfo, resolve);
        }
    });
}

