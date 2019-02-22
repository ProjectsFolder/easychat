
class Message {
    constructor(options) {
        this._elem;

        this.nickname = options.nickname;
        this.text = options.text;
        this.imgSrc = options.imgSrc;
        this.nicknameFromToken = options.nicknameFromToken;
    }
    render() {
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
        avatarImg.height = 60;
        avatarImg.width = 60;
        avatarImg.src = this.imgSrc;

        let aboutInfo = document.createElement("div");
        aboutInfo.className = "about-info";
        let nickname = document.createElement("div");
        nickname.className = "nickname";
        nickname.textContent = this.nickname;
        let dateTime = document.createElement("div");
        dateTime.className = "date-time";
        let dateObj = new Date();
        let time = document.createElement("time");
        time.className = "time";
        time.textContent = `${dateObj.getHours()}:${dateObj.getMinutes()}`;
        let date = document.createElement("time");
        date.className = "date";
        date.textContent = `${dateObj.getMonth()+1}.${dateObj.getDate()}.${dateObj.getFullYear()}`;

        let textMessage = document.createElement("div");
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

window.onload = function () {

    let sessionToken = window.sessionStorage.getItem('token');
    if (!sessionToken) {
        window.location = "login.html";
    }
    let sessionLogin = window.sessionStorage.getItem('login');
    let profileName =  document.querySelector(".nav-item.profile");
    profileName.textContent = sessionLogin;
    
    let logOut = document.querySelector(".nav-item.log-out");
    logOut.addEventListener("click", function() {
        var xhr = new XMLHttpRequest();
        xhr.open("POST", "http://localhost:52834/api/users/logout", false);
        xhr.setRequestHeader("Authorization", sessionToken);
        xhr.send();

        window.sessionStorage.clear();
        window.location.reload();
    });

    let messageList = document.querySelector(".message-list");
    let lastMessageID;

    function getMessages(getAll) {
        var xhr = new XMLHttpRequest();
        xhr.open("GET", "http://localhost:52834/api/messages", true);
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
                                    imgSrc: "images/avatars/2.jpg",
                                    nicknameFromToken: sessionStorage.getItem("login")
                                }).getElem();

                                lastMessageID = lastItem.id;
                                messageList.appendChild(message);


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

                                let from = messageList.scrollTop; 
                                let to = messageList.scrollHeight - messageList.scrollTop - messageList.clientHeight;

                                animate({
                                    duration: 1000,
                                    timing: circEaseOut,
                                    draw: function(progress) {
                                        progress = isNaN(progress) ? 0: progress;
                                        messageList.scrollTop = from + to * progress ;
                                        console.log(progress);
                                    }
                                });

                            }

                        }
                    } catch (e) {
                        if (e.name !== "TypeError")
                            alert(e);
                    }
                } else {
                    alert(`Возникла ошибка: ${xhr.status}`);
                }
                getMessages();
            }
        }
        xhr.send();
    }


    let messageText = document.querySelector(".message-text");
    let sendMessage = document.querySelector(".send-message");
    function sendMEssageToServer(){
        let formData = new FormData();
        formData.append("text", messageText.value);

        var xhr = new XMLHttpRequest();
        xhr.open("POST", "http://localhost:52834/api/messages", true);
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
