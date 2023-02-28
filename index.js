let form = document.querySelector('#registration-form');
form.addEventListener('submit', registerUser);

function showError(err){
    let err_div = document.querySelector('#error');
    err_div.className = 'alert alert-danger';
    err_div.innerHTML = err;

    setTimeout(function () {
        err_div.className = '';
        err_div.innerHTML = '';
    }, 3000);
}


function registerUser(e){
    e.preventDefault();
    try{
        let signUpObj = {
            name: e.target.name.value,
            email: e.target.email.value,
            password: e.target.password.value
        } 
        e.target.reset();
        console.log(signUpObj);

        const res = axios.post('http:localhost:300/user/signup', signUpObj);
        console.log(res.status)
        if(res.status===201)
            window.location.href = '../login/login.html';
        else
            throw new Error('Failed to register');
    }
    catch(err){
        console.log(err);
        showError('Failed to register');
    }
}