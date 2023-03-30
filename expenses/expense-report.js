let backend_url = 'http://localhost:3000';
document.addEventListener('DOMContentLoaded', getUser);
let logout = document.querySelector('#logout_btn');
let month_list = document.querySelector('#monthlist');
let year_list = document.querySelector('#yearlist2');
let monthly_report = document.querySelector('#monthly');
let yearly_report = document.querySelector('#yearly');
const history = document.querySelector('#downloads');
const token = localStorage.getItem('token');
let user;
let id;

//month page buttons
let m_pg_btn_1 = document.querySelector('#m_pg_btn_1');
let m_pg_btn_2 = document.querySelector('#m_pg_btn_2');
let m_pg_btn_next = document.querySelector('#m_pg_btn_next');
let m_pg_btn_last = document.querySelector('#m_pg_btn_last');

m_pg_btn_1.addEventListener('click', getExpensesMonthly);
m_pg_btn_2.addEventListener('click', getExpensesMonthly);
m_pg_btn_next.addEventListener('click', getExpensesMonthly);
m_pg_btn_last.addEventListener('click', getExpensesMonthly);

//year page buttons
let y_pg_btn_1 = document.querySelector('#y_pg_btn_1');
let y_pg_btn_2 = document.querySelector('#y_pg_btn_2');
let y_pg_btn_next = document.querySelector('#y_pg_btn_next');
let y_pg_btn_last = document.querySelector('#y_pg_btn_last');

y_pg_btn_1.addEventListener('click', getYearlyExpenses);
y_pg_btn_2.addEventListener('click', getYearlyExpenses);
y_pg_btn_next.addEventListener('click', getYearlyExpenses);
y_pg_btn_last.addEventListener('click', getYearlyExpenses);

//history page buttons
let h_pg_btn_1 = document.querySelector('#h_pg_btn_1');
let h_pg_btn_2 = document.querySelector('#h_pg_btn_2');
let h_pg_btn_next = document.querySelector('#h_pg_btn_next');
let h_pg_btn_last = document.querySelector('#h_pg_btn_last');

h_pg_btn_1.addEventListener('click', showHistory);
h_pg_btn_2.addEventListener('click', showHistory);
h_pg_btn_next.addEventListener('click', showHistory);
h_pg_btn_last.addEventListener('click', showHistory);

var month_rows = document.querySelector('#month-rows');
month_rows.addEventListener('change', changeLimit);
var month_limit;

var year_rows = document.querySelector('#year-rows');
year_rows.addEventListener('change', changeLimit);
var year_limit;

var history_rows = document.querySelector('#history-rows');
history_rows.addEventListener('change', changeLimit);
var history_limit;

// -------------------------------------------------------

monthly_report.addEventListener('click', downloadMonthlyExpenses);
yearly_report.addEventListener('click', downloadYearlyExpenses);
document.addEventListener('DOMContentLoaded', checkAuthentication);
document.addEventListener('DOMContentLoaded', checkPremium);
document.addEventListener('DOMContentLoaded', getExpensesMonthly);
history.addEventListener('click', showHistory);
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

async function getUser(){
    try{
        let res = await axios.get(`${backend_url}/user/getUser`, {headers: {"Authorization": token}});
        user = res.data.name;
        id = res.data.id;
        console.log(user);
        let m_limit = localStorage.getItem(`${user}_${id}_month_rows_limit`);
        let y_limit = localStorage.getItem(`${user}_${id}_year_rows_limit`);
        let h_limit = localStorage.getItem(`${user}_${id}_history_rows_limit`);
        month_limit = m_limit !== null ? m_limit : 5;
        year_limit = y_limit !== null ? y_limit : 5;
        history_limit = h_limit !== null ? h_limit : 5

        month_rows.value = month_limit;
        year_rows.value = year_limit;
        history_rows.value = history_limit;
    }
    catch(err){
        console.log(err);
    }
}

//getting monthly expenses
var currMonth = new Date().getMonth()+1;
let m_prev_page = 0;
let m_curr_page = 1;
let m_next_page = 2;
let m_pages = 0;
async function getExpensesMonthly(e){
    let year_list = document.querySelector('#yearlist');
    let year = year_list.value;

    let m_pg_btn_1 = document.querySelector('#m_pg_btn_1');
    let m_pg_btn_2 = document.querySelector('#m_pg_btn_2');
    m_pg_btn_1.disabled = false;
    m_pg_btn_2.disabled = false;

    document.querySelector('#tbody-monthly').innerHTML = ``;
    await wait('#tbody-monthly');
    if(e.type!='DOMContentLoaded' && e.target.parentElement.id === 'monthlist')
    {
        currMonth = e.target.attributes.value.nodeValue
        console.log(currMonth);
        m_prev_page = 0;
        m_curr_page = 1;
        m_next_page = 2;
        m_pages = 0;
    }

    let m_pg_btn_value = m_curr_page;

    if(e.type !== 'DOMContentLoaded' && e.target.parentElement.id !== 'monthlist'){
        if(e.target.id === 'm_pg_btn_next'){
            m_prev_page = m_curr_page;
            m_curr_page = m_curr_page + 1;
            m_next_page = m_curr_page + 1;
            m_pg_btn_value = m_curr_page;
            console.log(m_prev_page, m_curr_page, m_next_page);
        }
        else if(e.target.id === 'm_pg_btn_last'){
            m_pg_btn_value = m_pages;
        }
        else{
            m_pg_btn_value = e.target.innerHTML;
            m_curr_page = Number(m_pg_btn_value);
            m_prev_page = m_curr_page - 1;
            m_next_page = m_curr_page + 1;
            console.log(m_prev_page, m_curr_page, m_next_page);
        }
    }

    var month;
    try{


        const res = await axios.get(`${backend_url}/user/expenses/monthly-expenses/${currMonth}/${year}?page=${m_pg_btn_value}&limit=${month_limit}`, {headers: {"Authorization": token}});
        month = moment().month(currMonth-1).format('MMMM');
        if(res.status!==200)
            throw new Error(res.data.error);
        // console.log(res.data);
        m_pages = res.data.pages;
        pagination(m_pages, m_curr_page, m_pg_btn_next, m_pg_btn_last);
        
      
        if(m_pg_btn_value>2 && e.target.id !== 'm_pg_btn_last'){
            m_pg_btn_1.innerHTML = m_prev_page;
            m_pg_btn_2.innerHTML = m_curr_page;
        }

        if(e.target.id==='m_pg_btn_1')
            if(Number(m_pg_btn_value)>1){
                m_pg_btn_1.innerHTML = m_prev_page;
                m_pg_btn_2.innerHTML = m_curr_page;
            }

        
            if(m_pages===1)
                m_pg_btn_2.disabled = true;

        if(res.data.expenses.length==0){
            m_pg_btn_1.disabled = true;
            m_pg_btn_2.disabled = true;
            throw new Error('No expenses for '+month);
        }



        document.querySelector('#tbody-monthly').innerHTML = ''
        fillTables(res.data.expenses, '#tbody-monthly', 3);
    }
    catch(err){
        console.log(err);
        showError(err.message);
    }
    finally{
        document.querySelector('#cap_month').innerHTML = month;
    }
}

function pagination(pages, curr_page, pg_btn_next, pg_btn_last){
    if(pages<=2 || curr_page>=pages){
        pg_btn_next.disabled = true;
        pg_btn_last.disabled = true;
    }
    else{
        pg_btn_next.disabled = false;
        pg_btn_last.disabled = false;
    }

    pg_btn_last.innerHTML = 'Last Page - '+pages;
}

function logOut(){
    localStorage.removeItem('token');
    window.location.href = '../login/login.html';
}

//getting yearly expenses
var currYear = moment().year();
let y_prev_page = 0;
let y_curr_page = 1;
let y_next_page = 2;
let y_pages = 0;
async function getYearlyExpenses(e){
    currYear = moment().year();
    console.log(currYear);

    let y_pg_btn_1 = document.querySelector('#y_pg_btn_1');
    let y_pg_btn_2 = document.querySelector('#y_pg_btn_2');
    y_pg_btn_1.disabled = false;
    y_pg_btn_2.disabled = false;

    await wait('#tbody-yearly')

    if(e.type!='DOMContentLoaded' && e.target.parentElement.id === 'yearlist2')
    {
        currYear = e.target.attributes.value.nodeValue
        y_prev_page = 0;
        y_curr_page = 1;
        y_next_page = 2;
        y_pages = 0;
        console.log(currYear);
    }

    let y_pg_btn_value = y_curr_page;

    if(e.type!='DOMContentLoaded' && e.target.parentElement.id !== 'yearlist2')
    {
       if(e.target.id === 'y_pg_btn_next'){
         y_prev_page = y_curr_page;
         y_curr_page = y_curr_page + 1;
         y_next_page = y_curr_page + 1;
         y_pg_btn_value = y_curr_page;
         console.log(y_prev_page, y_curr_page, y_next_page)
       }
       else if(e.target.id === 'y_pg_btn_last'){
        y_pg_btn_value = y_pages;
       }
       else{
        y_pg_btn_value = e.target.innerHTML;
        y_curr_page = Number(y_pg_btn_value);
        y_prev_page = y_curr_page - 1;
        y_next_page = y_curr_page + 1;
        console.log(y_prev_page, y_curr_page, y_next_page);
       }
    }



    try{
        console.log('value', y_pg_btn_value);
        const res = await axios.get(`${backend_url}/user/expenses/yearly-expenses/${currYear}?page=${y_pg_btn_value}&limit=${year_limit}`, {headers: {"Authorization": token}});
        year = moment().year(currYear).format('YYYY');
        if(res.status!==200)
            throw new Error(res.data.error);
       
        y_pages = res.data.pages;
        console.log('pages', y_pages)
        pagination(y_pages, y_curr_page, y_pg_btn_next, y_pg_btn_last);

        if(y_pg_btn_value>2 && e.target.id !== 'y_pg_btn_last'){
            y_pg_btn_1.innerHTML = y_prev_page;
            y_pg_btn_2.innerHTML = y_curr_page;
        }

        if(e.target.id === 'y_pg_btn_1')
            if(Number(y_pg_btn_value)>1){
                y_pg_btn_1.innerHTML = y_prev_page;
                y_pg_btn_2.innerHTML = y_curr_page;
            }

            if(y_pages===1)
            y_pg_btn_2.disabled = true;

        if(res.data.expenses.length===0){
            y_pg_btn_1.disabled = true;
            y_pg_btn_2.disabled = true;
            throw new Error(`No Expenses for year ${currYear}`);
        }

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

async function addDownloads(fileURL, timeline, type){
    console.log(fileURL);
    try{
        let res = await axios.post(`${backend_url}/user/expenses/add-download/`, {fileURL, type, timeline}, {headers: {"Authorization": token}});
        if(res.status===200){
            var a = document.createElement('a');
            console.log('Executing', fileURL);
            a.href = fileURL;
            a.click();
        }
        if(res.status!==200)
            throw new Error(res.data.error);
        console.log(res.data);
    }
    catch(err){
        console.log(err);
        showError(err);
    }
}

async function downloadMonthlyExpenses(e){
    try{
        let year = document.querySelector('#yearlist').value;
        let res = await axios.get(`${backend_url}/user/expenses/downloadMonthly/${currMonth}/${year}`, {headers: {"Authorization": token}});
        if(res.status===200){
        }
        else{
            throw new Error(res.data.error);
        }

        addDownloads(res.data.fileURL, res.data.timeline, 'Monthly');
    }
    catch(err){
        console.log(err);
        showError(err);
    }
}

async function downloadYearlyExpenses(){
    try{
        let year = currYear;
        console.log(year)
        let res = await axios.get(`${backend_url}/user/expenses/downloadYearly/${year}`, {headers: {"Authorization": token}});
        if(res.status===200){
            var a = document.createElement('a');
            a.href = res.data.fileURL,
            // a.download = 'myexpenses.csv';
            a.click();
        }
        else{
            throw new Error(res.data.error)
        }
        addDownloads(res.data.fileURL, res.data.timeline, 'Yearly');
    }
    catch(err){
        console.log(err);
        showError(err);
    }
}

async function wait(id){
    document.querySelector(id).innerHTML = '';
    await new Promise((res, rej) => {
        setTimeout(() => {
            res('timer');
        }, 800);
    });
}

let h_prev_page = 0;
let h_curr_page = 1;
let h_next_page = 2;
let h_pages = 0;
async function showHistory(e){
    let tbody_downloads = document.querySelector('#tbody-download');
    tbody_downloads.innerHTML = '';
    document.querySelector('#downloads-section').style.display = 'block';

    let h_pg_btn_1 = document.querySelector('#h_pg_btn_1');
    let h_pg_btn_2 = document.querySelector('#h_pg_btn_2');
    h_pg_btn_1.disabled = false;
    h_pg_btn_2.disabled = false;

    await wait('#tbody-download');

    let h_pg_btn_value = h_curr_page;

    if(e.target.id !== 'downloads'){
        if(e.target.id == 'h_pg_btn_next'){
            h_prev_page = h_curr_page;
            h_curr_page = h_curr_page + 1;
            h_next_page = h_curr_page + 1;
            h_pg_btn_value = h_curr_page;
            console.log(h_prev_page, h_curr_page, h_next_page);
        }
        else if(e.target.id === 'h_pg_btn_last'){
            console.log('last', h_pages);
            h_pg_btn_value = h_pages;
        }
        else{
            h_pg_btn_value = e.target.innerHTML;
            h_curr_page = Number(h_pg_btn_value);
            h_prev_page = h_curr_page - 1;
            h_next_page = h_curr_page + 1;
            console.log(h_prev_page, h_curr_page, h_next_page);
        }
    }

    try{
        console.log(h_pg_btn_value);
        let res = await axios.get(`${backend_url}/user/expenses/getDownloads?page=${h_pg_btn_value}&limit=${history_limit}`, {headers: {"Authorization": token}});
        // console.log(res.data);
        
        h_pages = res.data.pages;
        console.log('h_pages', h_pages);

        pagination(h_pages, h_curr_page, h_pg_btn_next, h_pg_btn_last);

        if(h_pg_btn_value>2 && e.target.id !== 'h_pg_btn_last'){
            h_pg_btn_1.innerHTML = h_prev_page;
            h_pg_btn_2.innerHTML = h_curr_page;
        }

        if(e.target.id === 'h_pg_btn_1')
            if(Number(h_pg_btn_value)>1){
                h_pg_btn_1.innerHTML = h_prev_page;
                h_pg_btn_2.innerHTML = h_curr_page;
            } 
        
        if(h_pages === 1)
            h_pg_btn_2.disabled = true;

        
      
        if(res.status!==200){
            throw new Error(res.data.error);
        }

        let downloads = res.data.downloads;
        if(downloads.length===0){
            h_pg_btn_1.disabled = true;
            h_pg_btn_2.disabled = true;
            throw new Error(`No Downloads for year ${currYear}`);
        }
        // console.log(downloads);
        for(let i=0;i<downloads.length;i++){
            let tr = document.createElement('tr');

            
            let td1 = document.createElement('td');
            let a = document.createElement('a');
            a.href = downloads[i].url;
            // console.log(downloads[i].url);
            a.className = 'btn btn-sm btn-info';
            a.innerHTML = 'download'
            td1.appendChild(a);

            let td2 = document.createElement('td');
            let value2 = document.createTextNode(`${moment(downloads[i].createdAt).format('YYYY-MM-DD')}`);
            td2.appendChild(value2);

            let td3 = document.createElement('td');
            let value3 = document.createTextNode(`${downloads[i].type}`);
            td3.appendChild(value3);

            let td4 = document.createElement('td');
            let timeline = downloads[i].type==='Monthly'? moment().month(downloads[i].timeline.split('-')[0]-1).format('MMMM')+'-'+downloads[i].timeline.split('-')[1]:downloads[i].timeline;
            let value4 = document.createTextNode(`${timeline}`);
            td4.appendChild(value4);

            tr.appendChild(td1);
            tr.appendChild(td2);
            tr.appendChild(td3);
            tr.appendChild(td4);

            tbody_downloads.appendChild(tr);
        }

    }
    catch(err){
        console.log(err)
    }
}

function changeLimit(e){
    let e_id = e.target.id;
    if(e_id === 'month-rows'){
        let month_limit = month_rows.value;
        console.log('month limit', month_limit)
        localStorage.setItem(`${user}_${id}_month_rows_limit`, month_limit);
    }
    else if(e_id === 'year-rows'){
        let year_limit = year_rows.value;
        console.log('year limit', year_limit);
        localStorage.setItem(`${user}_${id}_year_rows_limit`, year_limit);
    }
    else if(e_id === 'history-rows'){
        let history_limit = history_rows.value;
        console.log('history limit', history_limit);
        localStorage.setItem(`${user}_${id}_history_rows_limit`, history_limit);
    }
}