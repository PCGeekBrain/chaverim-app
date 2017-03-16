//import { Http } from '@angular/http';
import { Headers } from '@angular/http';
import { getUserCredentials, setUserLoggedIn } from './userInfo';
import 'rxjs/add/operator/toPromise';

export const getToken = function(http, storage){    //get the http and storage services from the calling application
    return new Promise((resolve, reject) => {   //return a promise so that the other ends of this call will not slow down
        let headers = new Headers();
        headers.append('Content-Type', 'application/x-www-form-urlencoded');
        http.post('/auth/authenticate', {email: "", password: ""}, {headers: headers})
        .toPromise()
        .then(res => {
            let data = JSON.parse(res._body);
            if (data.success){
                storage.ready().then(() => {
                    storage.set('token', data.token);
                    storage.set('name', data.name);
                    storage.set('number', data.number);
                    storage.set('role', data.role);
                });
                setUserLoggedIn(storage, true);
            } else {
                setUserLoggedIn(storage, false);
                console.log("TODO let user know his username and password are invalid");
            }
            console.log(data);
            resolve(data);
        })
        .catch(err => {
            setUserLoggedIn(storage, false);
            resolve({success: false, message: err});
        });
    });
}
