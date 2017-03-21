import { Http } from '@angular/http'
import { Storage } from '@ionic/storage';
import { authorizedCall, httpTypes } from './authorized';
import { URL } from './constants';
import 'rxjs/add/operator/toPromise';

const url = URL + '/api/calls/backup'

/**
 * Call this to get a list of all calls user is backing up
 * @param http angular Http instance
 * @param storage Ionic storage instance
 */
export const GetBackupCalls = function(http: Http, storage: Storage){
    return new Promise<Array<{}>>((resolve, reject) => {
        authorizedCall(http, storage, httpTypes.GET, url)
        .then(res => {
            if (res.status = 200){
                resolve(JSON.parse(res._body).calls);
            } else {
                resolve([]);
            }
        })
        .catch(err => {
            console.log('err:');
            console.log(err);
            resolve([]);
        });
    });
}

/**
 * Call this to make the current user backup a call
 * @param http angular Http instance
 * @param storage Ionic storage instance
 * @param call the call that this is operating on
 */
export const BackupCall = function(http: Http, storage: Storage, call){
    console.log(call._id);
    return new Promise<{success: Boolean, message: string}>((resolve, reject) => {
        authorizedCall(http, storage, httpTypes.POST, url, {id: call._id})
        .then((res) => {
            let data = JSON.parse(res._body);
            resolve(data);
        })
        .catch(err => {
            console.warn('Error in TakeCall')
            console.warn(err);
        });
    });
}

/**
 * Call this to Drop a backup that user took
 * @param http angular Http instance
 * @param storage Ionic storage instance
 * @param call the call that this is operating on
 */
export const DropBackupCall = function(http: Http, storage: Storage, call){
    return new Promise<{success: Boolean, message: string}>((resolve, reject) => {
        authorizedCall(http, storage, httpTypes.DELETE, url, {id: call._id})
        .then((res) => {
            let data = JSON.parse(res._body)
            resolve(data);
        })
        .catch(err => {
            console.warn('Error in DropCall')
            console.warn(err);
        });
    });
}

/**
 * Call this to Finish a call backup that user took
 * @param http angular Http instance
 * @param storage Ionic storage instance
 * @param call the call that this is operating on
 */
export const FinishBackupCall = function(http: Http, storage: Storage, call){
    return new Promise<{success: Boolean, message: string}>((resolve, reject) => {
        authorizedCall(http, storage, httpTypes.PUT, url, {id: call._id})
        .then((res) => {
            let data = JSON.parse(res._body);
            resolve(data);
        })
        .catch(err => {
            console.warn('Error in FinishCall');
            console.warn(err);
        });
    });
}