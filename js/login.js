window.onload = function () {

    let formDOMRegister = document.getElementsByName("registration")[0];
    formDOMRegister.onsubmit = function() {
        let form = new FormData(formDOMRegister);
        var xhr = new XMLHttpRequest();
        xhr.open("POST", "http://localhost:52834/api/users/register");
        xhr.send(form);
        return false;
    }

    let formDOMLogin = document.getElementsByName("autorisation")[0];
    formDOMLogin.onsubmit = function() {
        let form = new FormData(formDOMLogin);
        var xhr = new XMLHttpRequest();
        xhr.open("POST", "http://localhost:52834/api/users/login", true);
        xhr.onreadystatechange = function() {
            if (xhr.readyState == 4) {
                if (xhr.status == 200)
                {
                    try{
                        let respObj = JSON.parse(xhr.responseText);
                        alert("Успешно");
                        sessionStorage.setItem('token', respObj.token);
                        sessionStorage.setItem('login', formDOMLogin.login.value);
                        formDOMLogin.submit();
                    } catch (e) {
                        alert(e);
                    }
                } else {
                    alert("Не правильный логин или пароль");
                }
            }
        }
        xhr.send(form);
        return false;
    }
 }
