let backend_url = 'http://localhost:3000';
let logout = document.querySelector('#logout_btn');

document.addEventListener('DOMContentLoaded', checkAuthentication);
document.addEventListener('DOMContentLoaded', checkPremium);
logout.addEventListener('click', logOut);


let premium_btn = document.querySelector('#premium');
premium_btn.addEventListener('click', takePremium);

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

async function takePremium(e){
    const token = localStorage.getItem('token');
    console.log('premium starting')
    try{
        const res = await axios.get(`${backend_url}/purchase/premium-membership`, {headers: {"Authorization": token}});
        console.log(res);
        if(res.status!==200)
            throw new Error(res.data.error);

        var options = {
            "key": res.data.key_id,
            "order_id": res.data.new_order.orderId,
            "handler": async (res) => {
                // console.log(res);
                await axios.post(`${backend_url}/purchase/update-transaction-status`, {
                    order_id: options.order_id,
                    payment_id: res.razorpay_payment_id,
                }, {headers: {"Authorization": token}});
                
                showSuccess('You are a premium user now');
            }
        }
        const rzp1 = new Razorpay(options);
        rzp1.open();
        e.preventDefault();

        rzp1.on('payment.failed', async function (response){
            await axios.post(`${backend_url}/purchase/update-transaction-status`, {
                order_id: options.order_id,
                payment_id: null,
            }, {headers: {"Authorization": token}})
            showError('Payment Failed');
        })
    }
    catch(err){
        showError(err.message);
    }
   
}

function checkAuthentication(){
    const token = localStorage.getItem('token');
    if(token!=null){
        let logout = document.querySelector('#logout_btn');
        let login = document.querySelector('#login_btn');
        login.style.display = 'none';
        logout.style.display = 'block';
    }
}

async function checkPremium(){
    try{
        const token = localStorage.getItem('token');
        const res = await axios.get(`${backend_url}/user/check-premium`, {headers: {"Authorization": token}});
        // console.log(res);
        if(res.data.success){
            document.querySelector('#premium').innerHTML = 'Premium User';
            document.querySelector('#report').style.display = 'block';
        }
        else{
            document.querySelector('#report').innerHTML = '<h2 class="text-center text" style="color:darkturquoise;">Join Premium to enjoy benefits</h2>'
            document.querySelector('#report').style.display = 'block';
        }
    }
    catch(err){
        console.log(err);
    }
}

async function logOut(){
    console.log('loggin out')
    localStorage.removeItem('token');
    window.location.href = '../login/login.html';
}