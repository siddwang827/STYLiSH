window.fbAsyncInit = function () {
    FB.init({
        appId: "1235571270311032",
        cookie: true,
        xfbml: true,
        version: "v13.0",
    });

    FB.getLoginStatus(function (response) {
        // Called after the JS SDK has been initialized.
        statusChangeCallback(response); // Returns the login status.
    });
};

function statusChangeCallback(res) {
    console.log("statusChangeCallback");
    if (res.status === "connected") {
        testAPI();

        let body = {
            provider: "facebook",
            Authorization: res.authResponse.accessToken,
        };

        let config = {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
        };

        fetch("/api/1.0/user/signin", config)
            .then((res) => res.json())
            .then((data) => console.log(data));
    } else {
        console.log("Authorization failed");
    }
}

function checkLoginState() {
    FB.getLoginStatus(function (res) {
        statusChangeCallback(res);
    });
}

function testAPI() {
    // Testing Graph API after login.  See statusChangeCallback() for when this call is made.
    console.log("Welcome!  Fetching your information.... ");
    FB.api("/me?fields=id,name,email,picture", function (response) {
        console.log("Successful login for: " + response.name);
        document.getElementById("status").innerHTML = JSON.stringify(response);
    });
}
