
const usersList = document.querySelector('.users__list');
const getUsersBtn = document.querySelector('.users__get-users');
const loader = document.querySelector('.loader')

let state = {
    users: [],
    editUser: [],
    editedUserId: null,
};

const setEditableId = (userId) => {
    state = {
        ...state,
        editedUserId: userId
    }
};

const getUserById = (userId) => {
    return state.users.filter(user => user.id === userId)
};

const updateUserData = (users, userId, key, text) => {
    return users.map(user => {
        if (user.id === userId) {
            user[key] = text;
        }

        return user;
    })
};

const changeUserData = (userId, key, text) => {
    setEditableId(userId);
    state = {
        ...state,
        users: updateUserData(state.users, userId, key, text)
    };
};

const iterate = (userid, obj) => {
    let userHtml2 = '';
    let resObj2 = '';
    Object.keys(obj).forEach((_key) => {
        if (typeof obj[_key] === 'object') {
            Object.keys(obj[_key]).forEach(k => {
                resObj2 += `<p> 
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; <b>${k}</b>: <span> 
                ${obj[_key][k]} </span> 
                </p>`
            }) 
        }  
        userHtml2 += `<p>
            &nbsp;&nbsp;&nbsp; <b>${_key}</b>: <span 
            oninput='changeUserData(${userid}, "${_key}", this.innerText)'
            class='${_key}'
            contenteditable="true"> ${_key === 'geo' ? resObj2 : obj[_key] } 
            </span>
            </p>`
    })
    
    return userHtml2;
}

let createUser = function (user, index) {
    let userHtml = '';
    Object.keys(user).forEach((key) => {
        let resObj;
        if (typeof user[key] === 'object') {
            resObj = iterate(user.id, user[key]);
        }
        userHtml += `<p>
            <b>${key}</b>: 
            <span 
                oninput='changeUserData(${user.id}, "${key}", this.innerText)'
                class='${key}' 
                contenteditable="true">
                ${key === 'address' || key === 'company' ? resObj : user[key]}
            </span><br><br>
            </p>`;
    })
    userHtml += `<div class='user__buttons'>
      <button class='buttons__edit' onclick='editUser(${index})'>Edit</button>
      <button class='buttons__delete' onclick='deleteUser(${index})'>Delete</button>
      <br><br>
    </div>`;
    userHtml = `<div data-user-id='${user.id}' class='user'>${userHtml}</div>`;
    return userHtml;
};


getUsersBtn.addEventListener('click', async () => {
    await getUsersRequest();
    fillUsersList(state.users)
});

const fillUsersList = function (data) {
    usersList.innerHTML = '';
    if (data.length) {
        data.forEach((user, index) => {
            usersList.innerHTML += createUser(user, index)
        });
    }
}

const editUser = function (index) {
    const editableUser = state.users[index];
    state.editUser = editableUser;

    const editedUserData = getUserById(state.editedUserId);

    if (state.editedUserId) {
        loader.style.display = 'block';
        usersList.style.opacity = '0.5';
        setTimeout(() => {
            editUserRequest(editedUserData);
            loader.style.display = 'none';
            usersList.style.opacity = '1';
        }, 1000);
    }
}

const deleteUser = function (index) {
    const removedUser = state.users[index];
    loader.style.display = 'block';
    usersList.style.opacity = '0.5';
    setTimeout(() => {
        deleteUserRequest(removedUser.id)
        state.users.splice(index, 1);
        fillUsersList(state.users);
        loader.style.display = 'none';
        usersList.style.opacity = '1';
    }, 1000);
}

function getUsersRequest() {
    return fetch(`https://jsonplaceholder.typicode.com/users/`, {
        headers: {
            'Content-type': 'application/json; charset=UTF-8'
        }
    })
        .then((response) => response.json())
        .then((users) => {
            state.users = state.users.concat(users)
        });
}


function editUserRequest(editedUserData) {
    return fetch(`https://jsonplaceholder.typicode.com/users/${state.editedUserId}`, {
        method: 'PUT',
        body: JSON.stringify(editedUserData),
        headers: {
            'Content-type': 'application/json; charset=UTF-8'
        }
    })
        .then((response) => response.json())
        .then((data) => {
            console.log(data, `User data saved by id: ${state.editedUserId}`);
            state.editedUserId = null;
        });
}


function deleteUserRequest(id) {
    return fetch(`https://jsonplaceholder.typicode.com/users/${id}`, {
        method: 'DELETE'
    })
        .then(response => console.log(response.status))
}
