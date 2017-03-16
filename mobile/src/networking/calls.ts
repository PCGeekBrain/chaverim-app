import { Headers } from '@angular/http'
import 'rxjs/add/operator/toPromise';

export const getToken = function(http){
    return new Promise((resolve, reject) => {
        let headers = new Headers();
        headers.append('Content-Type', 'application/x-www-form-urlencoded');
        headers.append('Authorization', 'JWT eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjU4Yzg1MmI1YmQ1NjE1MGJkMDAxZWEzNyIsImlhdCI6MTQ4OTY4NzE3MCwiZXhwIjoxNDg5NjkwNzcwfQ.LfOqliU_mhbOwj5dU0AvjbqJmudoTUM1tZk0vmOAzo0');
        http.get('/auth/users', {headers: headers})
        .toPromise()
        .then(res => resolve(res))
        .catch(err => console.log(err));
    });
}