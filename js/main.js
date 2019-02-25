class Message {
    constructor(options) {
        this._elem;

        this.nickname = options.nickname;
        this.text = options.text;
        this.imgSrc = options.imgSrc;
        this.time = options.time;
        this.nicknameFromToken = options.nicknameFromToken;
        this.id = options.id;
    }
    render() {
        function formatDateTime(value) {
            return ('0' + value).slice(-2);
        }

        this._elem = document.createElement("article");
        this._elem.className = "message depth-effect";

        let messageType;
        // console.log(this.nicknameFromToken + " " + this.nickname);
        if (this.nicknameFromToken ===  this.nickname) {
            messageType = "sent";
        } else {
            messageType = "accept";
        }
        this._elem.classList.add(messageType);
        
        let headerMessage = document.createElement("header");
        headerMessage.className = "header-message";

        let avatarWrap = document.createElement("div");
        avatarWrap.className = "avatar-wrap";
        let avatarImg = document.createElement("img");
        avatarImg.className = "avatar-img";
        avatarImg.height = 40;
        avatarImg.width = 40;
        avatarImg.src = this.imgSrc;

        let aboutInfo = document.createElement("div");
        aboutInfo.className = "about-info";
        let nickname = document.createElement("div");
        nickname.className = "nickname";
        nickname.textContent = this.nickname;
        let dateTime = document.createElement("div");
        dateTime.className = "date-time";
        let dateObj = new Date(this.time*1000);
   

        let time = document.createElement("time");
        time.className = "time";
        time.textContent = `${formatDateTime(dateObj.getHours())}:${formatDateTime(dateObj.getMinutes())}`;
        let date = document.createElement("time");
        date.className = "date";
        date.textContent = `${formatDateTime(dateObj.getDate()+1)}.${formatDateTime(dateObj.getMonth())}.${formatDateTime(dateObj.getFullYear())}`;

        let textMessage = document.createElement("div");
        textMessage.className = "text";
        textMessage.textContent = this.text;


        this._elem.appendChild(headerMessage);
        headerMessage.appendChild(avatarWrap);
        avatarWrap.appendChild(avatarImg);
        headerMessage.appendChild(aboutInfo);
        aboutInfo.appendChild(nickname);
        aboutInfo.appendChild(dateTime);
        dateTime.appendChild(time);
        dateTime.appendChild(date);
        this._elem.appendChild(textMessage);

    }
    getElem() {
        if (!this._elem) this.render();
        return this._elem;
    }
    setSrc(src) {
        this.imgSrc = src;
        this._elem.querySelector(".avatar-img").src = this.imgSrc;
    }
}

// АНИМАЦИЯ
// обычный вариант
function circ(timeFraction) {
    return 1 - Math.sin(Math.acos(timeFraction))
}
// преобразователь в easeOut
function makeEaseOut(timing) {
    return function(timeFraction) {
        return 1 - timing(1 - timeFraction);
    }
}
var circEaseOut = makeEaseOut(circ);

function animate(options) {
    var start = performance.now();
    requestAnimationFrame(function animate(time) {
        var timeFraction = (time - start) / options.duration;
        if (timeFraction > 1) timeFraction = 1;
    
        var progress = options.timing(timeFraction)
        options.draw(progress);
        if (timeFraction < 1) {
        requestAnimationFrame(animate);
        }
    
    });
}

function getImage(userID) {
    return new Promise( function (res,rej) {

        let xhr = new XMLHttpRequest();
        xhr.open("GET",SettingController.getUrl()+"api/users/image/"+userID, true);
        xhr.responseType = "blob";
        xhr.setRequestHeader("Authorization", window.sessionStorage.getItem('token'));
        xhr.onreadystatechange = function() {
            if (xhr.readyState == 4) {
                if (xhr.status == 200)
                { 
                    var urlCreator = window.URL;
                    var imageUrl = urlCreator.createObjectURL(xhr.response);

                    res({
                        id: userID,
                        url: imageUrl
                    });
                } else {
                    res({
                        id: userID,
                        url: "images/avatars/blank.jpg"
                    });
                }
            }
        }
        
        xhr.send();
    })
}

window.onload = function () {
    let sessionToken = window.sessionStorage.getItem('token');
    if (sessionToken == null) {
        window.location = "login.html";
        return;
    }

    let sessionLogin = window.sessionStorage.getItem('login');
    let sessionUserID = window.sessionStorage.getItem('userid');

    let profileName =  document.querySelector(".nav-item.profile");
    profileName.textContent = sessionLogin;


    let avatarImg = document.querySelector(".message-input .avatar-img");
    getImage(sessionUserID)
        .then( result => { avatarImg.src = result.url; });
    
    let logOut = document.querySelector(".nav-item.log-out");
    let islogOut = false;
    logOut.addEventListener("click", function() {
        var xhr = new XMLHttpRequest();
        xhr.open("POST", SettingController.getUrl()+"api/users/logout", true);
        xhr.setRequestHeader("Authorization", sessionToken);
        xhr.onreadystatechange = function() {
            if (xhr.readyState == 4) {
                if (xhr.status == 200)
                { 
                    islogOut = true;
                    window.sessionStorage.clear();
                    window.location.reload();
                }
            }
        }
        xhr.send();
    });


    let lastMessageTime;
    let messageCollection = [];
    let userIdSet = new Set();
    let urls;
    let messageList = document.querySelector(".message-list");
    var xhr = new XMLHttpRequest();
    xhr.open("GET", SettingController.getUrl()+"api/messages", true);
    xhr.setRequestHeader("Authorization", sessionToken);
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4) {
            if (xhr.status == 200)
            {
                let respObj = JSON.parse(xhr.responseText);
             
                respObj.forEach(item => {
                    let message = new Message({
                        nickname: item.username,
                        text: item.text,
                        time: item.timecreated ,
                        nicknameFromToken: sessionStorage.getItem("login"),
                        id: item.userid
                    });

                    lastMessageTime = message.time;
                    messageCollection.push(message);
                    userIdSet.add(message.id);
                });

                urls = Array.from(userIdSet);

                Promise.all(urls.map(getImage))
                    .then( result => {

                        for (let i=0; i<messageCollection.length; i++) {

                            for (let j=0; j<result.length; j++) {

                                if (messageCollection[i].id == result[j].id) {

                                    messageList.appendChild(messageCollection[i].getElem());
                                    messageCollection[i].setSrc(result[j].url)
                                    
                                    messageList.scrollTop  = messageList.scrollHeight;
                                }
                            }
                        }

                        urls = result;
                        getNewMessage();
                    });
            }
        }
    }
    xhr.send();

    let newMessageCount = 0;
    let isTabLeave = false;
    function getNewMessage() {
        var xhr = new XMLHttpRequest();
        xhr.open("GET", SettingController.getUrl()+"api/messages?begin="+lastMessageTime, true);
        xhr.setRequestHeader("Authorization", sessionToken);
        xhr.onreadystatechange = function() {
            if (xhr.readyState == 4) {
                if (xhr.status == 200)
                {
                    try{
                        let respObj = JSON.parse(xhr.responseText);

                        respObj.forEach(item => {
                            let message = new Message({
                                nickname: item.username,
                                text: item.text,
                                time: item.timecreated ,
                                nicknameFromToken: sessionStorage.getItem("login"),
                                id: item.userid
                            });
        
                            lastMessageTime = message.time;

                            messageList.appendChild(message.getElem());

                            let from = messageList.scrollTop; 
                            let to = messageList.scrollHeight - messageList.scrollTop - messageList.clientHeight;
                            animate({
                                duration: 300,
                                timing: circEaseOut,
                                draw: function(progress) {
                                    progress = isNaN(progress) ? 0 : progress;
                                    messageList.scrollTop = from + to * progress ;
                                }
                            });

                            newMessageCount++;
                            if (isTabLeave) {
                                document.title = "easychat (" + newMessageCount + " сообщений)";
                            } else {
                                document.title = "easychat";
                                newMessageCount = 0;
                            }

                            
                            for (let j=0; j<urls.length; j++) {
                                if (message.id == urls[j].id) {
                                    message.setSrc(urls[j].url)
                                }
                            }
                            if (message.imgSrc == undefined) {
                                getImage(message.id)
                                    .then( result => {
                                        urls.push({
                                            id: message.id,
                                            url:result.url
                                        });
                                        message.setSrc( result.url);
                                        console.dir(urls);
                                    });
                            }
                        });
                    } catch (e) {
                        if (e.name !== "TypeError")
                            alert(e);
                    }
                } else {
                    if (islogOut == true) {
                        xhr.abort();
                        return;
                    } else {
                        alert(`Возникла ошибка: ${xhr.status}`);
                    }
                }
                getNewMessage();
            }
        }
        xhr.send();
    }

    window.onblur = function () {
        isTabLeave = true;
    };
    window.onfocus = function () {
        document.title = "easychat";
        newMessageCount = 0;
        isTabLeave = false;
    }

    let messageText = document.querySelector(".message-text");
    let sendMessage = document.querySelector(".send-message");
    function sendMEssageToServer(){
        let formData = new FormData();
        formData.append("text", messageText.value);

        var xhr = new XMLHttpRequest();
        xhr.open("POST", SettingController.getUrl()+"api/messages", true);
        xhr.setRequestHeader("Authorization", sessionToken);
        xhr.send(formData);

        messageText.value = "";
    }
    messageText.addEventListener("keydown", function (event) {
        if (event.keyCode === 13) {
            sendMEssageToServer();
        }

    });
    sendMessage.addEventListener("click", function (event) {
        sendMEssageToServer();
    });


    let profileButton = document.querySelector(".menu .profile");
    let avatarButton = document.querySelector(".chat-box .avatar-img");
    let modalWindow = document.querySelector(".modal-window");
    let previewAvatar = document.querySelector(".upload-image");
    let formDOMAvatar = document.getElementsByName("avatarFile")[0];
    formDOMAvatar.onsubmit = function () {
        return false;
    }
    formDOMAvatar.image.onchange = function () {
        var reader  = new FileReader();
        reader.readAsDataURL(formDOMAvatar.image.files[0]);
        reader.onloadend = function () {
            previewAvatar.src = reader.result;
        }
    }
    avatarButton.onclick = profileButton.onclick = function() {
        modalWindow.style.display = "block";
    }
    formDOMAvatar.uploadClose.onclick = function () {
        modalWindow.style.display = "none";
    }
    formDOMAvatar.uploadFile.onclick = function () {
        let formData = new FormData(formDOMAvatar);
        var xhr = new XMLHttpRequest();
        xhr.open("PUT", SettingController.getUrl()+"api/users/image", true);
        xhr.onreadystatechange = function() {
            if (xhr.readyState == 4) {
                if (xhr.status == 200) {

                    getImage(sessionUserID)
                        .then( result => {
                        avatarImg.src = result.url;
                    });

                }
            }
        }
        xhr.setRequestHeader("Authorization", sessionToken);
        xhr.send(formData);
    }
 }
