let backend_url = 'http://localhost:3000';
let logout = document.querySelector('#logout_btn');
let month_list = document.querySelector('#monthlist');
let year_list = document.querySelector('#yearlist2');
let monthly_report = document.querySelector('#monthly');
let yearly_report = document.querySelector('#yearly');
const token = localStorage.getItem('token');

monthly_report.addEventListener('click', download);
yearly_report.addEventListener('click', download);
document.addEventListener('DOMContentLoaded', checkAuthentication);
document.addEventListener('DOMContentLoaded', checkPremium);
document.addEventListener('DOMContentLoaded', getExpensesMonthly);
document.addEventListener('DOMContentLoaded', getYearlyExpenses);
logout.addEventListener('click', logOut);
month_list.addEventListener('click', getExpensesMonthly);
year_list.addEventListener('click', getYearlyExpenses);

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

//to initiate premium
async function takePremium(e){
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

//checking authentication
function checkAuthentication(){
    if(token!=null){
        let logout = document.querySelector('#logout_btn');
        let login = document.querySelector('#login_btn');
        login.style.display = 'none';
        logout.style.display = 'block';
    }
}

//checking if the user got premium membership
async function checkPremium(){
    try{
        const res = await axios.get(`${backend_url}/user/check-premium`, {headers: {"Authorization": token}});
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

//getting monthly expenses
async function getExpensesMonthly(e){
    let year_list = document.querySelector('#yearlist');
    let year = year_list.value;

    let currMonth = new Date().getMonth()+1;
    document.querySelector('#tbody-monthly').innerHTML = ``;
    await new Promise((res, rej) => {
        setTimeout(() => {
            res('timer');
        }, 800);
    });
    if(e.type!='DOMContentLoaded')
    {
        currMonth = e.target.attributes.value.nodeValue
        console.log(currMonth);
    }
    var month;
    try{
        const res = await axios.get(`${backend_url}/user/expenses/monthly-expenses/${currMonth}/${year}`, {headers: {"Authorization": token}});
        month = moment().month(res.data.month-1).format('MMMM');
        if(res.status!==200)
            throw new Error(res.data.error);
        if(res.data.expenses.length==0)
            throw new Error('No expenses for '+month);
            document.querySelector('#tbody-monthly').innerHTML = ''
        fillTables(res.data.expenses, '#tbody-monthly', 3);
    }
    catch(err){
        showError(err.message)
    }
    finally{
        document.querySelector('#cap_month').innerHTML =month;
    }
}

function logOut(){
    localStorage.removeItem('token');
    window.location.href = '../login/login.html';
}

//getting yearly expenses
async function getYearlyExpenses(e){
    let currYear = moment().year();
    console.log(currYear)
    document.querySelector('#tbody-yearly').innerHTML = ``;
    await new Promise((res, rej) => {
        setTimeout(() => {
            res('timer');
        }, 800);
    });
    if(e.type!='DOMContentLoaded')
    {
        currYear = e.target.attributes.value.nodeValue
        console.log(currYear);
    }
    try{
        const res = await axios.get(`${backend_url}/user/expenses/yearly-expenses/${currYear}`, {headers: {"Authorization": token}});
        year = moment().year(currYear).format('YYYY');
        if(res.status!==200)
            throw new Error(res.data.error);
        if(res.data.expenses.length===0)
            throw new Error(`No Expenses for year ${currYear}`);

        document.querySelector('#tbody-yearly').innerHTML = '';
        fillTables(res.data.expenses, '#tbody-yearly', 1);
    }
    catch(err){
        console.log(err);
        showError(err.message)
    }
    finally{
        document.querySelector('#cap-year').innerHTML = currYear;
    }

}

//filling tables
function fillTables(expenses, tbody_id, span_num){
    let tbody = document.querySelector(tbody_id);
    let obj_keys = Object.keys(expenses[0]);
    let sum=0;
    for(let i=0;i<expenses.length;i++){
        let tr = document.createElement('tr');
        for(let j=0;j<obj_keys.length;j++){
            let td = document.createElement('td');
            let value;
            if(obj_keys[j]==='createdAt')
                value = document.createTextNode(`${moment(expenses[i][obj_keys[j]]).format('DD-MM-YYYY')}`);
            else if(obj_keys[j]==='month')
                value = document.createTextNode(`${moment().month(expenses[i][obj_keys[j]]-1).format('MMMM')}`);
            else
                value = document.createTextNode(`${expenses[i][obj_keys[j]]}`);

            td.appendChild(value);
            tr.appendChild(td);

            if(obj_keys[j]==='amount' || obj_keys[j]==='total_expense')
                sum += Number(expenses[i][obj_keys[j]]);
        }
        tbody.appendChild(tr);
    }

        let t_body_monthly = document.querySelector(tbody_id);
        let tr = document.createElement('tr');

        let td = document.createElement('td');
        td.setAttribute('colspan', span_num);

        let td2 = document.createElement('td');
        td2.style.fontWeight = 'bold';
        let value = document.createTextNode(`Total: ${sum}`);
        td2.appendChild(value);
        tr.appendChild(td);
        tr.appendChild(td2);
        t_body_monthly.appendChild(tr); 
}

async function download(e){
    try{
        let type = e.target.id;
        let res = await axios.get(`${backend_url}/user/expenses/download/${type}`, {headers: {"Authorization": token}});
        if(res.status===200){
            var a = document.createElement('a');
            a.href = res.data.fileURL,
            // a.download = 'myexpenses.csv';
            a.click();
        }
        else{
            throw new Error(res.data.error)
        }
    }
    catch(err){
        console.log(err);
        showError(err);
    }
}