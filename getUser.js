let backend_url = 'http://localhost:3000';
const token = localStorage.getItem('token');
async function getUser(){
    try{
        let user = await axios.get(`${backend_url}/user/getUser`, {headers: {"Authorization": token}});
        console.log(user);
        return user;
    }
    catch(err){
        console.log(err);
    }
}