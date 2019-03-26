import './css/app.css';
import renderUsers from './templates/users.hbs'
import renderMessages from './templates/messages.hbs'


const formChat = document.querySelector('.chat__form');
const formPopup = document.querySelector('.popup__form');
const input = document.querySelector('.chat__input');
var popup = document.querySelector('.popup');
var users = document.querySelector('.chat__list-container');
const title =  document.querySelector('.chat__title');
const counts =  document.querySelector('.chat__users-tltle');
const mes = document.querySelector('.chat__message-container');
const dropBox = document.querySelector('.dropbox');
const photo = document.querySelector('.chat__ico');
const dropboxPhoto = document.querySelector('.dropbox__photo');
const dropboxCancel = document.querySelector('.dropbox__cancel');
const dropboxSave = document.querySelector('.dropbox__save');

var login,name, icoPath;

var usersPhoto =new Map();

const ws = new WebSocket('ws://localhost:3000');

formChat.addEventListener('submit', e => {
    e.preventDefault();
    if (login===undefined) {
        alert('Невозможно отправить сообщение! Необходимо авторизоваться!!');
    }
    else {
        const date = new Date();
        const mesContent = {
            name: name,
            date: date.getHours()+' '+date.getMinutes(),
            context: input.value
        }
        sendMessage('MESSAGE',mesContent);
        input.value = '';
    }
   
})

formPopup.addEventListener('submit', e => {
    e.preventDefault();

    var fl = true;

    if (formPopup.name.value==='') {
        fl= false;
    }
    if (formPopup.login.value==='') {
        fl= false;
    }

    if (fl) {
        login = formPopup.login.value;
        name = formPopup.name.value;
        sendMessage('LOGIN',name);
        title.textContent = name;
        popup.style.display = 'none';
    }

})


ws.onclose = () => 
{
    sendMessage('LOGOUT');
}

ws.onmessage = response => {
    const str = JSON.parse(response.data);

    if (str.type == 'USERS') {
        const usersData = str.value;
        counts.textContent = 'Участники ('+usersData.length+')';
        users.innerHTML = renderUsers({usersData});
    }

    else if (str.type == 'MESSAGE') {
        const messagesData = str.value;
        
        let li = document.createElement('li');
        li.classList.add('message__item');
        let item = messagesData;
        item.login = str.login;
        li.innerHTML = renderMessages({item});      
        const ico = li.querySelector('.message__ico');
        for (var key of usersPhoto.keys()) {
            if (ico.dataset.login==key) {
                ico.style.backgroundImage = "url('" +  usersPhoto.get(key) + "')";
            }
        }
        mes.appendChild(li);
    }
    else if (str.type == 'UPDATEPHOTO') {
        usersPhoto.set(str.login,str.value);
        for (var key of usersPhoto.keys()) {
            let icons = document.querySelectorAll('.message__ico');
            for (let i=0; i<icons.length; i++) {
                if (icons[i].dataset.login==key) {
                    icons[i].style.backgroundImage = "url('" +  usersPhoto.get(key) + "')";
                }
            }
        }
        
    }


};

window.addEventListener('load', e=>{
    popup.style.display = 'block';
})

window.addEventListener('beforeunload', e=>{
    sendMessage('LOGOUT');
})

photo.addEventListener('click' ,e=> {
    if (login===undefined) {
        alert('Невозможно прикрепить фото! Необходимо авторизоваться!!');
    }
    else {
        dropBox.style.display = 'block';
        dropBox.ondragenter = ignoreDrag;
        dropBox.ondragover = ignoreDrag;
        dropBox.ondrop = drop;
    }
})

dropboxCancel.addEventListener('click' ,e=> {
    e.preventDefault();
    dropBox.style.display = 'none';
});

dropboxSave.addEventListener('click' ,e=> {
    e.preventDefault();
    photo.style.backgroundImage = "url('" + icoPath + "')";
    usersPhoto.set(login,icoPath);
    sendMessage('ADDPHOTO',icoPath);
    dropBox.style.display = 'none';
});

function sendMessage(type,value='') {
    const event = {
        type: type,
        login: login,
        value: value
    }
    const str = JSON.stringify(event);
    ws.send(str);
} 

function ignoreDrag(e) {
    e.stopPropagation();
    e.preventDefault();
  }

function drop(e) {
    e.stopPropagation();
    e.preventDefault();
   
    var data = e.dataTransfer;
    var files = data.files;      
    processFiles(files);
}

function processFiles(files) {
    var file = files[0];
    var fl = true;
    if (file.size/1024>512) {
        alert('Можно загружать только файлы размером, меньше 512 кб');
        fl = false;
    }

    if (file.type !=='image/jpeg') {
        alert('Можно загружать только JPG файлы');
        fl = false;
    }

    if (fl)  {
        var reader = new FileReader();
  
        reader.onload = function (e) {
            icoPath = e.target.result;
            dropboxPhoto.style.backgroundImage = "url('" + icoPath + "')";
        };
        
        reader.readAsDataURL(file);
    }

  }

