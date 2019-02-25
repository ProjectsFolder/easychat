window.onload = function () {

    let fieldsetRegister = document.querySelector(".login-fieldset.sign-up");
    let fieldsetLogin = document.querySelector(".login-fieldset.sign-in");

    let formDOMRegister = document.getElementsByName("registration")[0];
    formDOMRegister.onsubmit = function() {
        let form = new FormData(formDOMRegister);
        var xhr = new XMLHttpRequest();
        xhr.open("POST", SettingController.getUrl() + "api/users/register", true);
        xhr.onreadystatechange = function() {
            if (xhr.readyState == 4) {
                if (xhr.status == 200)
                {
                    alert("Успешно");
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
        fieldsetLogin.style.display = "block";
    }

    let formDOMLogin = document.getElementsByName("autorisation")[0];
    formDOMLogin.onsubmit = function() {
        let form = new FormData(formDOMLogin);
        var xhr = new XMLHttpRequest();
        xhr.open("POST", SettingController.getUrl() + "api/users/login", true);
        xhr.onreadystatechange = function() {
            if (xhr.readyState == 4) {
                if (xhr.status == 200)
                {
                    let respObj = JSON.parse(xhr.responseText);

                    sessionStorage.setItem('token', respObj.token);
                    sessionStorage.setItem('userid', respObj.userid);
                    sessionStorage.setItem('login', formDOMLogin.login.value);

                    formDOMLogin.submit();
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
        fieldsetRegister.style.display = "block";
    }

}