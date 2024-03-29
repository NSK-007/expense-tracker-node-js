let BACKEND_URL = `http://localhost:3000`
let form = document.querySelector('#login-form');
let reset_form = document.querySelector('#reset-form');
document.addEventListener('DOMContentLoaded', checkAuthentication);
form.addEventListener('submit', loginUser);
reset_form.addEventListener('submit', resetPassword);

function showError(err){
    let err_div = document.querySelector('#error');
    err_div.className = 'alert alert-danger';
    err_div.innerHTML = err;

    setTimeout(function () {
        err_div.className = '';
        err_div.innerHTML = '';
    }, 3000);
}

function showSuccess(err){
    let err_div = document.querySelector('#error');
    err_div.className = 'alert alert-success';
    err_div.innerHTML = err;

    setTimeout(function () {
        err_div.className = '';
        err_div.innerHTML = '';
    }, 3000);
}

async function loginUser(e){
    try{
        e.preventDefault();
        let loginObj = {
            email: e.target.email.value,
            password: e.target.password.value
        }
    
        e.target.reset();
        let res = await axios.post(`${BACKEND_URL}/user/loginUser`, loginObj);
        if(res.status!==200){
            // console.log(res);
            throw new Error(res.data.error);
        }
        else{
            localStorage.setItem('token', res.data.token);
            showSuccess(res.data.message);
            window.location.href = '../expenses/add-expense.html'
        }
    }
    catch(err){
        console.log(err.message);
        showError(err.message);
    }
}
function checkAuthentication(){
    const token = localStorage.getItem('token');
    if(token!=null){
        window.location.href = '../expenses/add-expense.html';
    }
}

async function resetPassword(e){
    e.preventDefault();

    try{
        let resetObj = {
            resetEmail: document.forms['reset-form']['reset-email'].value,
        }
        console.log('resetting password...');
        let res = await axios.post(`${BACKEND_URL}/user/password/forgot-password`, resetObj);
        if(res.status!==200)
            throw new Error(res.data.error);
        showSuccess(res.data.message);
    }
    catch(err){
        showError(err.message);
    }
}