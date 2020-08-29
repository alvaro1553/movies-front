
export async function postUser(user){
    const userDTO = user.toJson();
    return fetch('/user/signup', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json;charset=utf-8'
        },
        body: JSON.stringify(userDTO)
    })
        .then((response)=>{
            if (response.status == 201) return response.text()
            //Todo: don't expose server message to user
            else return response.text()
        })
        .catch((err)=>console.log('ERROR: connection problem or url does not exist:' + err.stack))
}

export async function checkUser(user){
    const userDTO = user.toJson();
    return fetch('/user/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json;charset=utf-8'
        },
        body: JSON.stringify(userDTO)
    })
        .then((response)=>{
            if (response.status == 200) return 'User access granted';
            //Todo: don't expose server message to user
            else return response.text();
        })
        .catch((err)=>console.log('ERROR, connection problem or url does not exist:' + err.stack))
}
