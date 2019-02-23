
class Message {
    constructor(options) {
        this._elem;

        this.nickname = options.nickname;
        this.text = options.text;
        this.imgSrc = options.imgSrc;
        this.time = options.time;
        this.nicknameFromToken = options.nicknameFromToken;
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


window.onload = function () {

    let sessionToken = window.sessionStorage.getItem('token');
    if (sessionToken == null) {
        window.location = "login.html";
        return;
    }

    let sessionLogin = window.sessionStorage.getItem('login');
    let profileName =  document.querySelector(".nav-item.profile");
    profileName.textContent = sessionLogin;
    
    let logOut = document.querySelector(".nav-item.log-out");
    let islogOut = false;
    logOut.addEventListener("click", function() {
        var xhr = new XMLHttpRequest();
        xhr.open("POST", "http://158.46.83.151/easychatServer/api/users/logout", true);
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

    let messageList = document.querySelector(".message-list");
    let lastMessageID;
    let newMessageCount = 0;
    let isTabLeave = false;
    function getMessages(getAll) {
        var xhr = new XMLHttpRequest();
        xhr.open("GET", "http://158.46.83.151/easychatServer/api/messages", true);
        xhr.setRequestHeader("Authorization", sessionToken);
        xhr.onreadystatechange = function() {
            if (xhr.readyState == 4) {
                if (xhr.status == 200)
                {
                    try{
                        let respObj = JSON.parse(xhr.responseText);
                        let lastItem = respObj[respObj.length-1];
                        
                        if (lastItem.id !== lastMessageID) {

                            if (getAll) {
                                respObj.forEach(item => {
                                    let message = new Message({
                                        nickname: item.username,
                                        text: item.text,
                                        time: item.timecreated ,
                                        imgSrc: "images/avatars/2.jpg",
                                        nicknameFromToken: sessionStorage.getItem("login")
                                    }).getElem();

                                    lastMessageID = item.id;
                                    messageList.appendChild(message);

                                    messageList.scrollTop  = messageList.scrollHeight;
                                });
                            } else {
                                let message = new Message({
                                    nickname: lastItem.username,
                                    text: lastItem.text,
                                    time: lastItem.timecreated,
                                    imgSrc: "images/avatars/2.jpg",
                                    nicknameFromToken: sessionStorage.getItem("login")
                                }).getElem();

                                lastMessageID = lastItem.id;
                                messageList.appendChild(message);


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
                            }

                        }
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
                getMessages();
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
        xhr.open("POST", "http://158.46.83.151/easychatServer/api/messages", true);
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

    getMessages(true);
 }
