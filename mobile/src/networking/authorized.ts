import { Headers, Http } from '@angular/http'
import { getUserCredentials, setUserLoggedIn, getUserLoggedIn } from './userInfo';
import { Storage } from '@ionic/storage';
import 'rxjs/add/operator/toPromise';

export enum httpTypes {
    GET,
    POST,
    PUT,
    DELETE,
}

/**
 * Function to authenticate user with server and get token
 * @param http angular Http object to make the call with
 * @param storage Storage object to save results to system
 * @param userInfo Optional userInfo to use for the request
 */
export const getToken = function(http: Http, storage: Storage, userInfo?){
    //function to call server so we can handle getting the info from storage later on
    let callServer = function(http, storage, userInfo, resolve, reject) {
        let headers = new Headers();
        headers.append('Content-Type', 'application/json');
        console.log({msg: "Getting user token", userInfo});
        //Post the server for some authentication info
        http.post('/auth/authenticate', {email: userInfo.email, password: userInfo.password}, {headers: headers})
        .toPromise().then((res) => {
            let data = JSON.parse(res._body);
            if (data.success){
                //Save the user info to storage, brodcast updates, and resolve
                //TODO notify ui with events
                storage.ready().then(() => {
                    storage.set('token', data.token);
                    storage.set('name', data.name);
                    storage.set('number', data.number);
                    storage.set('role', data.role);
                    //Permissions UI things
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
        }).catch((err) => {
            setUserLoggedIn(storage, false);
            reject({success: false, message: err});
        });
    }
    //The meat of the function. update the tokens with a promise based on either storage or passed in values
    return new Promise<{success: Boolean, message: String, 
        token?:String, name?:String, number?:String, role?:String}>((resolve, reject) => {
        if(!userInfo){  //no user info was manually passed in
            getUserCredentials(storage).then((res) => {
                callServer(http, storage, res, resolve, reject);
            });
        } else {    //it was passed in manually. run that
            callServer(http, storage, userInfo, resolve, reject);
        }
    });
}

/**
 * Function to handle authorized calls to the server
 * @param http Angular http object to make the call with
 * @param storage Storage object to pass to getToken()
 * @param type httpTypes object for request type
 * @param url the url to hit
 * @param body the body to send to the server
 */
export const authorizedCall = function(http: Http, storage: Storage, type:httpTypes, url, body?){
    //Call once we have a token
    let preAuthorizedCall = function(token){
        console.log('running call on token: ' + token)
        return new Promise<{status, _body}>((resolve, reject) => {   //use a promise for standardization
            let httpCall = null;   //balnk call
            let headers = new Headers();    //start the headers
            headers.append('Content-Type', 'application/json');     //json so we don't have that angular bug
            headers.append('Authorization', token);     //pass the token
            //Create the call
            console.log(body);
            if (type === httpTypes.POST) {
                httpCall = http.post(url, body, {headers: headers});
            } else if (type === httpTypes.PUT) {
                httpCall = http.put(url, body, {headers: headers});
            } else if (type === httpTypes.DELETE) {
                // Put the body into the header becuse angular will not send a body
                for (let key in body){
                    headers.append(key, body[key]);
                }
                httpCall = http.delete(url, {headers: headers});
            } else if (type === httpTypes.GET){
                httpCall = http.get(url, {headers: headers});
            }
            //cast it to a promise
            httpCall.toPromise()
            .then((result) => { //if we get a good response from server:
                console.log(result);
                resolve(result);
            }).catch((err) => { //if we do not get a good result from server
                console.log(err);
                resolve(err);
            });
        });
    }
    // Authorize and make a call
    let authorizeCall = function(){
        return new Promise<{status, _body}>((resolve, reject) => {
            getToken(http, storage, {email: 'mendelh1537@gmail.com', password: 'password'}).then((res) => {
                if(res.success){
                    resolve(preAuthorizedCall(res.token));
                } else {
                    reject(res)
                }
            });
        });
    }

    //Meat of authorizedCall function. check if logged in and run, then hande expired token. 
    //if not logged in skip the first attempt
    return new Promise<{status, _body}>((resolve, reject) => {
        getUserLoggedIn(storage).then((logged_in) => {
            if(logged_in){
                storage.ready().then(() => {
                    storage.get('token').then((token) => {
                        preAuthorizedCall(token).then((res) => {
                            if (res._body === 'Unauthorized'){  //I have no idea where this is being called. you are free to experiment
                                resolve(authorizeCall())
                            } else{
                                resolve(res);
                            }
                        }).catch((err) => {
                            if (err._body === 'Unauthorized'){  //it might not be called here at all or only here. still do not know
                                resolve(authorizeCall())
                            } else{
                                reject(err);
                            }
                        });
                    });
                });
            } else {
                authorizeCall()
                .then((res) => {
                    console.log('Got new Token');
                    console.log(res);
                    resolve(res);
                }).catch((err) => {
                    console.log('err came in');
                    console.log(err);
                    reject(err);
                })
            }
        });
    });
}