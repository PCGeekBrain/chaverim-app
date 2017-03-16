export const getUserCredentials = function(storage){
    storage.ready().then(() => {
        let email = "";
        let password = "";
        storage.get('email').then((val) => {
            email = val;
            storage.get('password').then((val) => {
                password = val;
                return {email: email, password: password}
            });
        });
    });
}

export const getUserLoggedIn = function(storage){
    storage.ready().then(() => {
        storage.get('logged_in').then((val) => {
            console.log(val);
            return val
        })
    })
}

export const setUserLoggedIn = function(storage, value){
    storage.ready().then(() => {
        storage.set('logged_in', value).then((val) => {
            console.log(val);
        })
    })
}