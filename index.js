const backend_url = 'http://localhost:3000'
let form = document.querySelector('#registration-form');
form.addEventListener('submit', registerUser);

function containsOnlySpaces(str) {
    return str.trim().length === 0;
  }

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
            name: e.target.name.value.trim(),
            email: e.target.email.value.trim(),
            password: e.target.password.value
        }
        e.target.reset();

        if (containsOnlySpaces(signUpObj.email) || containsOnlySpaces(signUpObj.name) || signUpObj.name == null || signUpObj.name == '' || signUpObj.email == null || signUpObj.email == '' || signUpObj.password == null || signUpObj.password == '') {
           showError('Please enter the fields properly');
           return;
        }

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