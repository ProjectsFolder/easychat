
class Message {
    constructor(options) {
        this._elem;

        this.nickname = options.nickname;
        this.text = options.text;
        this.imgSrc = options.imgSrc;
    }
    render() {
        this._elem = document.createElement("article");
        this._elem.className = "sent message depth-effect";
        
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

    let sessionToken = sessionStorage.getItem('token');
    if (!sessionToken) {
        window.location = "login.html";
    }
    let sessionLogin = sessionStorage.getItem('login');
    let profileName =  document.querySelector(".nav-item.profile");
    profileName.textContent = sessionLogin;

    let messageList = document.querySelector(".message-list");
    let messageText = document.querySelector(".message-text");
    let sendMessage = document.querySelector(".send-message");
    sendMessage.addEventListener("click", function (event) {

        let message = new Message({
            nickname: sessionLogin,
            text: messageText.value,
            imgSrc: "images/avatars/2.jpg"
        }).getElem();
        
        messageList.appendChild(message);
    
        messageList.scrollTop = messageList.scrollHeight;
    });


    let logOut = document.querySelector(".nav-item.log-out");
    logOut.onclick = function() {
        var xhr = new XMLHttpRequest();
        xhr.open("POST", "http://localhost:52834/api/users/logout", false);
        xhr.setRequestHeader("Authorization", sessionToken);
        xhr.send();

        sessionStorage.clear();
        window.location.reload();
    }
    
 }
