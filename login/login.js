let BACKEND_URL = `http://localhost:3000`
let form = document.querySelector('#login-form');

form.addEventListener('submit', loginUser);

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