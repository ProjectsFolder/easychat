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
        
        let allElements =  createAllElements(this._elem);
        allElements = setAllProperties(allElements, this);
        allElements = appendAllChild(allElements);

        this._elem = allElements.elem;

        function createAllElements(elem) {
            return {
                elem: document.createElement("article"),
                headerMessage: document.createElement("header"),
                avatarWrap: document.createElement("div"),
                avatarImg: document.createElement("img"),
                aboutInfo: document.createElement("div"),
                nickname: document.createElement("div"),
                dateTime: document.createElement("div"),
                time: document.createElement("time"),
                date: document.createElement("time"),
                textMessage: document.createElement("div")
            }
        }
        
        function setAllProperties(allElements, self) {
            allElements.elem.className = "message depth-effect";
            let messageType = getMessageType(self);
            allElements.elem.classList.add(messageType);
            
            allElements.headerMessage.className = "header-message";
            allElements.avatarWrap.className = "avatar-wrap";
            allElements.avatarImg.className = "avatar-img";
            allElements.avatarImg.height = 40;
            allElements.avatarImg.width = 40;
            allElements.avatarImg.src = self.imgSrc;
    
            allElements.aboutInfo.className = "about-info";
            allElements.nickname.className = "nickname";
            allElements.nickname.textContent = self.nickname;
            allElements.dateTime.className = "date-time";

            let dateObj = new Date(self.time*1000);
            allElements.time.className = "time";
            allElements.time.textContent = `${formatDateTime(dateObj.getHours())}:${formatDateTime(dateObj.getMinutes())}`;
            allElements.date.className = "date";
            allElements.date.textContent = `${formatDateTime(dateObj.getDate()+1)}.${formatDateTime(dateObj.getMonth())}.${formatDateTime(dateObj.getFullYear())}`;
            allElements.textMessage.className = "text";
            allElements.textMessage.textContent = self.text;

            return allElements;
        }

        function appendAllChild(allElements) {
            allElements.elem.appendChild(allElements.headerMessage);
            allElements.headerMessage.appendChild(allElements.avatarWrap);
            allElements.avatarWrap.appendChild(allElements.avatarImg);
            allElements.headerMessage.appendChild(allElements.aboutInfo);
            allElements.aboutInfo.appendChild(allElements.nickname);
            allElements.aboutInfo.appendChild(allElements.dateTime);
            allElements.dateTime.appendChild(allElements.time);
            allElements.dateTime.appendChild(allElements.date);
            allElements.elem.appendChild(allElements.textMessage);

            return allElements;
        }

        function getMessageType(self) {
            return (self.nicknameFromToken ===  self.nickname) ? "sent" : "accept";
        }
        function formatDateTime(value) {
            return ('0' + value).slice(-2);
        }
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
                        url: SettingController.getDefaultAvatar()
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
    xhr.open("GET", SettingController.getUrl()+"api/messages?limit="+SettingController.getNumberLimitMessage(), true);
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
