let form = document.querySelector('#form-id');
let backend_url = 'http://localhost:3000';
let itemList = document.querySelector('#items');
let logout = document.querySelector('#logout_btn');
let leaderboard = document.querySelector('#leader-board');

document.addEventListener('DOMContentLoaded', checkAuthentication);
document.addEventListener('DOMContentLoaded', checkPremium);
document.addEventListener('DOMContentLoaded', getExpenses);

itemList.addEventListener('click', deleteExpense);
logout.addEventListener('click', logOut);
leaderboard.addEventListener('click', showLeaderBoard);

let premium_btn = document.querySelector('#premium');
premium_btn.addEventListener('click', takePremium);

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

function showSuccess(err){
    let err_div = document.querySelector('#error');
    err_div.className = 'alert alert-success';
    err_div.innerHTML = err;

    setTimeout(function () {
        err_div.className = '';
        err_div.innerHTML = '';
    }, 3000);
}

form.addEventListener('submit', addExpense);

function createNewLi(id, amount, type, desc){
    let li = document.createElement('li');
    li.className  = 'list-group-item';
    li.style.border = '2px solid'
    li.style.borderStyle = 'outset';

    //delete button
    var deleteBtn = document.createElement('button');
    deleteBtn.className = 'btn btn-danger btn-sm delete'; 
    deleteBtn.id = 'delete'+id;
    deleteBtn.appendChild(document.createTextNode('delete expense'));

    //edit button
    // var editBtn = document.createElement('button');
    // editBtn.className = 'btn btn-primary btn-sm';
    // editBtn.id = 'edit'+id;
    // editBtn.appendChild(document.createTextNode('edit expense'));

    //creating a div to enclose them;
    var div = document.createElement('div');
    div.className = 'row-2 float-right';

    div.appendChild(deleteBtn);
    // div.append(' '); // to space the delete and edit
    // div.appendChild(editBtn); 

    li.appendChild(document.createTextNode(`${amount} - ${type} - ${desc}`));
    li.appendChild(div);
    li.appendChild(document.createElement('br'));
    return li;
}

async function addExpense(e){
    e.preventDefault();
    const expense = {
        amount : e.target.amount.value,
        description: e.target.description.value,
        type: e.target.type.value
    }
    // console.log(typeof expense.amount);
    if (containsOnlySpaces(expense.amount) || containsOnlySpaces(expense.description) || expense.description == null || expense.description == '' || expense.amount == null || expense.amount == '' || expense.type == null || expense.type == '') {
        showError('Please enter the fields properly');
        return;
     }
     try{
        const token = localStorage.getItem('token');
        // console.log(token);
        let res = await axios.post(`${backend_url}/user/add-expense`,expense, {headers: {"Authorization": token}});
        // console.log(res);
        if(res.status!==200)
            throw new Error(res.data.error);
        form.reset();
        let li = createNewLi(res.data.id, res.data.amount, res.data.type, res.data.description);
        itemList.appendChild(li);
        let lb_section = document.querySelector('#leader-board-section');
        lb_section.style.display = 'none';
     }
     catch(err){
        console.log(err.message);
        showError(err.message);
     }
}

async function getExpenses(){
    try{
        const token = localStorage.getItem('token');
        let items = await axios.get(`${backend_url}/user/get-expenses`, {headers: {"Authorization": token}});
        if(items.status !== 200)
            throw new Error(items.data.error);
        for(let i=0;i<items.data.length;i++){
            let li = createNewLi(items.data[i].id, items.data[i].amount, items.data[i].type, items.data[i].description);
            itemList.appendChild(li);
        }
    }
    catch(err){
        showError(err.message);
    }
}

async function deleteExpense(e){
    if(e.target.classList.contains('delete')){
        let li = e.target.parentElement.parentElement;
        const id = e.target.id.substring(6);
        // console.log(id);
        itemList.removeChild(li);
        const token = localStorage.getItem('token');
        try{
            await axios.delete(`${backend_url}/user/expense/delete-expense/${id}`, {headers: {"Authorization": token}});
            let lb_section = document.querySelector('#leader-board-section');
            lb_section.style.display = 'none';
        }
        catch(err){
            showError('delete didn\'t happen');
        }
    }
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
            leaderboard.style.display = 'block';
        }
    }
    catch(err){
        console.log(err);
    }
}

function createNewTableRows(user){
    let table_body = document.querySelector('#table-body');
    let tr = document.createElement('tr');
    let td1 = document.createElement('td');
    let td2 = document.createElement('td');
    let value1 = document.createTextNode(`${user.name}`);
    let value2 = document.createTextNode(`${user.totalExpense}`);
    td1.appendChild(value1);
    td2.appendChild(value2);
    tr.appendChild(td1);
    tr.appendChild(td2);

    table_body.appendChild(tr);
}

async function showLeaderBoard(){
    try{
        console.log('leaderboard')
        let lb_section = document.querySelector('#leader-board-section');
        let t_body = document.querySelector('#table-body');
        t_body.innerHTML = '';
        const token = localStorage.getItem('token');
        let leaderboard_details = await axios.get(`${backend_url}/premium/getLeaderboard`, {headers: {"Authorization": token}});
        // console.log(leaderboard_details.data.expense_user);
        let users = leaderboard_details.data.expense_user;
        for(let i=0;i<users.length;i++){
            createNewTableRows(users[i])
        }

        lb_section.style.display = 'block';
    }
    catch(err){
        showError(err.message);
    }
}

async function logOut(){
    localStorage.removeItem('token');
    window.location.href = '../login/login.html';
}