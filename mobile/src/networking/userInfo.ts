import { Events } from 'ionic-angular';

export const getUserCredentials = function(storage){
    return getMultiple(storage, ['email', 'password']);
}

export const getUserLoggedIn = function(storage) {
    return storage.get('logged_in').then((val) => {
        return val
    });
}

export const setUserLoggedIn = function(storage, value, events?:Events){
    storage.ready().then(() => {
        storage.set('logged_in', value).then((val) => {
            if(events){
                events.publish('loggedIn', value);
            }
        });
    });
}

// I have no clue how this works becuas promises are a broken overused concept without await
// Lets start the Promises are too damed overused party
export const getMultiple = function(storage, keys: string[]) {
    const promises = [];    //Arrays I love arrays. these make sense
    keys.forEach(   //for every key
        key => promises.push(   //push
            storage.get(key).then(  //an async result (hit this is dumb)
                result => { //and now the result is set with magic (a.k.a is returned too late becuase reasons)
                    return result
                }
            )
        )
    );
    return Promise.all(promises).then( values => {
        const result = {};
        values.map( (value, index) => { 
            result[keys[index]] = value; 
        });
        return result;
    });
}