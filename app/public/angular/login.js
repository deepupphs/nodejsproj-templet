var app = angular.module("loginApp", [
  "config",
  "ngCookies",
  "ui-notification",
]);

function url_base64_decode(str) {
  var output = str.replace("-", "+").replace("_", "/");
  switch (output.length % 4) {
    case 0:
      break;
    case 2:
      output += "==";
      break;
    case 3:
      output += "=";
      break;
    default:
      throw "Illegal base64url string!";
  }
  return window.atob(output);
}

var baseAddress = config_module._invokeQueue[0][2][1].LOGIN_URL;

var url = "";
app.factory("loginFactory", function ($http, $window) {
  return {
    login: function (formData) {
      url = baseAddress + "login";
      console.log("URL = ", url);
      return $http.post(url, formData);
    },
  };
});

app.controller("LoginController", function (
  $scope,
  $http,
  loginFactory,
  $window,
  $cookies,
  $cookieStore,
  $location,
  Notification
) {
  $scope.postForm = function () {
    var admindata = this.admin;

    console.log("inside postForm() admindata", admindata);
    console.log("inside postForm()");

    if (
      admindata == undefined ||
      ((admindata.password == null ||
        admindata.password == undefined ||
        admindata.password == "") &&
        (admindata.email == null ||
          admindata.email == undefined ||
          admindata.email == ""))
    ) {
      Notification.error("email and password required");
    } else if (
      admindata.email == null ||
      admindata.email == undefined ||
      admindata.email == ""
    ) {
      Notification.error("email required");
    } else if (
      admindata.password == null ||
      admindata.password == undefined ||
      admindata.password == ""
    ) {
      Notification.error("password required");
    } else {
      loginFactory.login(admindata).success(function (data) {
        console.log("data login======", data);

        if (data.success) {
          var consoledata = data.token;
          console.log("consolidata", consoledata);
          $window.localStorage.token = consoledata;
          if (!consoledata) {
            Notification.error("You are not autharised user");
            window.location.href = "/admin-login";
          } else {
            Notification.success("Success!");
            window.location.href = "/dashboard";
          }
        } else {
          Notification.error(`${data.message}`);
        }
      });
    }
  };
});
