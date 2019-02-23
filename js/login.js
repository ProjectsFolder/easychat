window.onload = function () {

    let fieldsetRegister = document.querySelector(".login-fieldset.sign-up");
    fieldsetRegister.style.display = "none";
    let fieldsetLogin = document.querySelector(".login-fieldset.sign-in");
    // fieldsetLogin.style.display = "none";

    let formDOMRegister = document.getElementsByName("registration")[0];
    formDOMRegister.onsubmit = function() {
        let form = new FormData(formDOMRegister);
        var xhr = new XMLHttpRequest();
        xhr.open("POST", "http://158.46.83.151/easychatServer/api/users/register", true);
        xhr.onreadystatechange = function() {
            if (xhr.readyState == 4) {
                if (xhr.status == 200)
                {
                    try{
                        alert("Успешно");
                    } catch (e) {
                        alert("Не корректные логин или пароль");
                    }
                } else {
                    alert(xhr.status+": "+xhr.statusText);
                }
            }
        }
        xhr.send(form);
        return false;
    }
    formDOMRegister.elements.changeType.onclick = function() {
        fieldsetRegister.style.display = "none";
        fieldsetLogin.style.display = "";
    }

    let formDOMLogin = document.getElementsByName("autorisation")[0];
    formDOMLogin.onsubmit = function() {
        let form = new FormData(formDOMLogin);
        var xhr = new XMLHttpRequest();
        xhr.open("POST", "http://158.46.83.151/easychatServer/api/users/login", true);
        xhr.onreadystatechange = function() {
            if (xhr.readyState == 4) {
                if (xhr.status == 200)
                {
                    try{
                        let respObj = JSON.parse(xhr.responseText);
                        // alert("Успешно");
                        sessionStorage.setItem('token', respObj.token);
                        sessionStorage.setItem('userid', respObj.userid);
                        sessionStorage.setItem('login', formDOMLogin.login.value);
                        formDOMLogin.submit();
                    } catch (e) {
                        alert(e);
                    }
                } else {
                    alert(xhr.status+": "+xhr.statusText);
                }
            }
        }
        xhr.send(form);
        return false;
    }
    formDOMLogin.elements.changeType.onclick = function() {
        fieldsetLogin.style.display = "none";
        fieldsetRegister.style.display = "";
    }

}