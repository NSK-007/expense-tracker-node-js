const backend_url = 'http://localhost:3000'
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


async function registerUser(e){
    e.preventDefault();
    try{
        let signUpObj = {
            name: e.target.name.value,
            email: e.target.email.value,
            password: e.target.password.value
        } 
        e.target.reset();
        let res = await axios.post(`${backend_url}/user/signup`, signUpObj);
        console.log(res);
        if(res.status===200)
            window.location.href = '../login/login.html';
        else{
            // console.log(res.data.error);
            throw new Error(res.data.error);
        }
    }
    catch(err){
        // console.log(err.message);
        showError(err.message);
    }
}