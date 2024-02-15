var app = angular.module("dashboardApp", [
  "config",
  "ngCookies",
  "ui-notification",
  "ngCsv",
]);

app.run(function ($window) {
  if (!localStorage.token) {
    window.location.href = "/agency-login";
  } else {
    var token = localStorage.token;
    //console.log("token", token);
    var encodedProfile = token.split(".")[1];

    var profile = JSON.parse(url_base64_decode(encodedProfile));
    //console.log("admin profile", profile);
    //console.log("profile._doc.civilId" , profile._doc.civilId);
    var profile1 = Object.keys(profile);
    var count = profile1.length;
    //console.log("count", count);
    if (profile.role != "AGENCY") {
      window.location.href = "/agency-login";
    } else {
    }
  }
});

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

var baseAddress = config_module._invokeQueue[0][2][1].API_URL;

var url = "";

app.factory("A_dashboardFactory", function ($http, $window) {
  return {
    getAllSettlementsDetails: function (month) {
      url = baseAddress + "agency/get-all-settlements";
      return $http.get(url);
    },
    getSettlementCycleDetails: function (date) {
      url = baseAddress + "agency/get-cycle-details" + "/" + date;
      return $http.get(url);
    },

    updateSettlementStatus: function (data) {
      url = baseAddress + "agency/update/settlemet/status";
      return $http.post(url, data);
    },
  };
});
angular.module("initFromForm", []).directive("initFromForm", function ($parse) {
  return {
    link: function (scope, element, attrs) {
      var attr = attrs.initFromForm || attrs.ngModel || element.attrs("name"),
        val = attrs.value;
      $parse(attr).assign(scope, val);
    },
  };
});

app.factory("SharedObject", function () {
  return {
    recordsCount: 0,
    editItemNumber: 0,
    pageNum: 1,
    insertMode: false,
    reset: function () {
      //this.recordsCount=0;
      this.editItemNumber = 0;
      this.pageNum = 1;
      this.insertMode = false;
    },
  };
});

app.factory("SharedObjectAdmin", function () {
  return {
    recordsCountAdmin: 0,
    editItemNumber: 0,
    pageNum: 1,
    insertMode: false,
    reset: function () {
      //this.recordsCount=0;
      this.editItemNumber = 0;
      this.pageNum = 1;
      this.insertMode = false;
    },
  };
});

app.factory("SharedObjectUser", function () {
  return {
    recordsCountUser: 0,
    editItemNumber: 0,
    pageNum: 1,
    insertMode: false,
    reset: function () {
      //this.recordsCount=0;
      this.editItemNumber = 0;
      this.pageNum = 1;
      this.insertMode = false;
    },
  };
});

app.factory("SharedObjectGroups", function () {
  return {
    recordsCountUser: 0,
    editItemNumber: 0,
    pageNum: 1,
    insertMode: false,
    reset: function () {
      //this.recordsCount=0;
      this.editItemNumber = 0;
      this.pageNum = 1;
      this.insertMode = false;
    },
  };
});

app.filter("paging", [
  "SharedObject",
  function (SharedObject) {
    return function (input, pSize) {
      SharedObject.recordsCount = input && input.length ? input.length : 0;
      if (input) {
        var size = parseInt(pSize, 10),
          pageNum = SharedObject.pageNum;
        if (input.length <= size) return input;
        var classes = [];
        for (var i = 0; i < input.length; i++) {
          if (i < size * (pageNum - 1)) continue;
          if (i >= size * (pageNum - 1) + size) break;
          else classes.push(input[i]);
        }
        return classes;
      } else return null;
    };
  },
]);

app.filter("pagingAdmin", [
  "SharedObjectAdmin",
  function (SharedObjectAdmin) {
    return function (input, pSize) {
      SharedObjectAdmin.recordsCountAdmin =
        input && input.length ? input.length : 0;
      if (input) {
        var size = parseInt(pSize, 10),
          pageNum = SharedObjectAdmin.pageNum;
        if (input.length <= size) return input;
        var classes = [];
        for (var i = 0; i < input.length; i++) {
          if (i < size * (pageNum - 1)) continue;
          if (i >= size * (pageNum - 1) + size) break;
          else classes.push(input[i]);
        }
        return classes;
      } else return null;
    };
  },
]);

app.filter("pagingUser", [
  "SharedObjectUser",
  function (SharedObjectUser) {
    return function (input, pSize) {
      SharedObjectUser.recordsCountUser =
        input && input.length ? input.length : 0;
      if (input) {
        var size = parseInt(pSize, 10),
          pageNum = SharedObjectUser.pageNum;
        if (input.length <= size) return input;
        var classes = [];
        for (var i = 0; i < input.length; i++) {
          if (i < size * (pageNum - 1)) continue;
          if (i >= size * (pageNum - 1) + size) break;
          else classes.push(input[i]);
        }
        return classes;
      } else return null;
    };
  },
]);

app.filter("pagingGroup", [
  "SharedObjectGroups",
  function (SharedObjectGroups) {
    return function (input, pSize) {
      SharedObjectGroups.recordsCountUser =
        input && input.length ? input.length : 0;
      if (input) {
        var size = parseInt(pSize, 10),
          pageNum = SharedObjectGroups.pageNum;
        if (input.length <= size) return input;
        var classes = [];
        for (var i = 0; i < input.length; i++) {
          if (i < size * (pageNum - 1)) continue;
          if (i >= size * (pageNum - 1) + size) break;
          else classes.push(input[i]);
        }
        return classes;
      } else return null;
    };
  },
]);
app.filter("sumByColumn", function () {
  return function (collection, column) {
    var total = 0;

    collection.forEach(function (item) {
      total += parseInt(item[column]);
    });

    return total;
  };
});

app.filter("unique", function () {
  return function (collection, keyname) {
    var output = [],
      keys = [];
    found = [];

    if (!keyname) {
      angular.forEach(collection, function (row) {
        var is_found = false;
        angular.forEach(found, function (foundRow) {
          if (foundRow == row) {
            is_found = true;
          }
        });

        if (is_found) {
          return;
        }
        found.push(row);
        output.push(row);
      });
    } else {
      angular.forEach(collection, function (row) {
        var item = row[keyname];
        if (item === null || item === undefined) return;
        if (keys.indexOf(item) === -1) {
          keys.push(item);
          output.push(row);
        }
      });
    }

    return output;
  };
});

app.controller(
  "AdashboardController",
  function PostController(
    $scope,
    A_dashboardFactory,
    SharedObject,
    SharedObjectAdmin,
    SharedObjectUser,
    SharedObjectGroups,
    $cookies,
    $cookieStore,
    $window,
    $location,
    Notification
  ) {
    $scope.editMode = false;
    $scope.search = {};
    $scope.pageSize = 5;
    $scope.pageSizeByAdmin = 5;
    $scope.pageSizeByUser = 5;
    $scope.pageSizeGroup = 5;
    $scope.localObject = SharedObject;
    $scope.localObjectAdmin = SharedObjectAdmin;
    $scope.localObjectUser = SharedObjectUser;
    $scope.localObjectGroup = SharedObjectGroups;
    $scope.allSettlements = [];
    $scope.hosteeDetails = [];

    $scope.onePointValue = parseFloat(1 / 10000);
    $scope.currentMonth = new Date();

    var consoledata = $window.localStorage.token;
    if (consoledata != undefined) {
      var encodedProfile = consoledata.split(".")[1];
      var profile = JSON.parse(url_base64_decode(encodedProfile));
      $scope.profile = profile;
      //console.log("Inside controller profile", profile);
    }
    //get admin profile
    $scope.getAdmin = function () {
      var d = new Date().toISOString();
      //var n = d.getMonth() + 1;
      A_dashboardFactory.getAllSettlementsDetails()
        .success(function (data) {
          if (data.success) {
            $scope.allSettlements = data.data.results;
            $scope.hosteeDetails = [];
            console.log("allSettlements", $scope.allSettlements);
          } else {
            Notification.error({
              message: `${data.data.msg}`,
              delay: 1000,
            });
          }
        })
        .error(function (data) {
          $scope.error = "An Error has occured while Loading users! ";
        });
    };
    $scope.getAdmin();

    // getAllSettlements
    $scope.getAllSettlements = function () {
      var d = new Date().toISOString();
      console.log(d);
      A_dashboardFactory.getAllSettlementsDetails()
        .success(function (data) {
          if (data.success) {
            $scope.allSettlements = data.data.results;
            $scope.hosteeDetails = [];
            console.log("allSettlements", $scope.allSettlements);
          } else {
            Notification.error({
              message: `${data.data.msg}`,
              delay: 1000,
            });
          }
        })
        .error(function (data) {
          $scope.error = "An Error has occured while Loading users! ";
        });
    };

    // verifyPaymentStatus
    $scope.verifyPaymentStatus = function (id, status) {
      let settlementdata = { id, status };
      console.log(settlementdata);
      A_dashboardFactory.updateSettlementStatus(settlementdata)
        .success(function (data) {
          if (data.success) {
            Notification.success({
              message: `Success`,
              delay: 1000,
            });
          } else {
            Notification.error({
              message: `Failed`,
              delay: 1000,
            });
          }
        })
        .error(function (data) {
          $scope.error = "An Error has occured while Loading users! ";
        });
    };

    // getSettlementCycleDetails
    $scope.getCycleReports = function (date) {
      var d = new Date(date).toISOString();
      console.log(d);
      A_dashboardFactory.getSettlementCycleDetails(d)
        .success(function (data) {
          if (data.success) {
            $scope.hosteeDetails = data.data.results;
            $scope.allSettlements = [];

            //$scope.reportDailyHost = new Date(date);
            console.log("hosteeDetails", $scope.hosteeDetails);
          } else {
            Notification.error({
              message: `${data.data.msg}`,
              delay: 1000,
            });
          }
        })
        .error(function (data) {
          $scope.error = "An Error has occured while Loading users! ";
        });
    };

    $scope.allSettlementsExport = function () {
      html2canvas(document.getElementById("allSettlementsPdf"), {
        onrendered: function (canvas) {
          var data = canvas.toDataURL();
          var docDefinition = {
            content: [
              {
                image: data,
                width: 500,
              },
            ],
          };
          pdfMake.createPdf(docDefinition).download("all_settlements.pdf");
        },
      });
    };

    $scope.cyclePdfExport = function () {
      html2canvas(document.getElementById("cyclePdf"), {
        onrendered: function (canvas) {
          var data = canvas.toDataURL();
          var docDefinition = {
            content: [
              {
                image: data,
                width: 500,
              },
            ],
          };
          pdfMake.createPdf(docDefinition).download("settlement_cycle.pdf");
        },
      });
    };

    //===============================================================Pangination for Admin users===========================================================================================

    $scope.TotalPagesAdmin = function () {
      var size = parseInt($scope.pageSizeByAdmin, 5);
      if (size > $scope.localObjectAdmin.recordsCountAdmin) return 1;
      else
        return $scope.localObjectAdmin.recordsCountAdmin % size === 0
          ? $scope.localObjectAdmin.recordsCountAdmin / size
          : Math.floor($scope.localObjectAdmin.recordsCountAdmin / size) + 1;
    };
    $scope.NavFirstAdmin = function () {
      var pageNum = $scope.localObjectAdmin.pageNum;
      var paglst =
        $scope.localObjectAdmin.recordsCountAdmin / $scope.pageSizeByAdmin;

      pageNum =
        $scope.localObjectAdmin.recordsCountAdmin >
        $scope.pageSizeByAdmin * pageNum
          ? pageNum + (paglst - 1)
          : pageNum;

      if (pageNum > 1) {
        pageNum = pageNum > 2 ? 1 : pageNum - 1;
      }

      $scope.localObjectAdmin.reset();
      $scope.localObjectAdmin.pageNum = pageNum;
    };

    $scope.NavPrevAdmin = function () {
      var pageNum = $scope.localObjectAdmin.pageNum;
      pageNum = pageNum < 2 ? 1 : pageNum - 1;
      $scope.localObjectAdmin.reset();
      console.log(pageNum);
      $scope.localObjectAdmin.pageNum = pageNum;
    };
    $scope.NavNextAdmin = function () {
      var pageNum = $scope.localObjectAdmin.pageNum;
      pageNum =
        $scope.localObjectAdmin.recordsCountAdmin >
        $scope.pageSizeByAdmin * pageNum
          ? pageNum + 1
          : pageNum;
      $scope.localObjectAdmin.reset();
      console.log(pageNum);
      $scope.localObjectAdmin.pageNum = pageNum;
    };

    $scope.NavLastAdmin = function () {
      var pageNum = $scope.localObjectAdmin.pageNum;
      var paglst =
        Math.round(
          $scope.localObjectAdmin.recordsCountAdmin / $scope.pageSizeByAdmin
        ) - pageNum;
      pageNum =
        $scope.localObjectAdmin.recordsCountAdmin >
        $scope.pageSizeByAdmin * pageNum
          ? pageNum + paglst
          : pageNum;
      $scope.localObjectAdmin.reset();
      $scope.localObjectAdmin.pageNum = pageNum;
    };

    //==========================================================================================================================================================

    //===============================================================Pangination for users===========================================================================================

    $scope.TotalPagesUser = function () {
      var size = parseInt($scope.pageSizeByUser, 5);
      if (size > $scope.localObjectUser.recordsCountUser) return 1;
      else
        return $scope.localObjectUser.recordsCountUser % size === 0
          ? $scope.localObjectUser.recordsCountUser / size
          : Math.floor($scope.localObjectUser.recordsCountUser / size) + 1;
    };
    $scope.NavFirstUser = function () {
      var pageNum = $scope.localObjectUser.pageNum;
      var paglst =
        $scope.localObjectUser.recordsCountUser / $scope.pageSizeByUser;

      pageNum =
        $scope.localObjectUser.recordsCountUser >
        $scope.pageSizeByUser * pageNum
          ? pageNum + (paglst - 1)
          : pageNum;

      if (pageNum > 1) {
        pageNum = pageNum > 2 ? 1 : pageNum - 1;
      }

      $scope.localObjectUser.reset();
      $scope.localObjectUser.pageNum = pageNum;
    };

    $scope.NavPrevUser = function () {
      var pageNum = $scope.localObjectUser.pageNum;
      pageNum = pageNum < 2 ? 1 : pageNum - 1;
      $scope.localObjectUser.reset();
      console.log(pageNum);
      $scope.localObjectUser.pageNum = pageNum;
    };
    $scope.NavNextUser = function () {
      var pageNum = $scope.localObjectUser.pageNum;
      pageNum =
        $scope.localObjectUser.recordsCountUser >
        $scope.pageSizeByUser * pageNum
          ? pageNum + 1
          : pageNum;
      $scope.localObjectUser.reset();
      console.log(pageNum);
      $scope.localObjectUser.pageNum = pageNum;
    };

    $scope.NavLastUser = function () {
      var pageNum = $scope.localObjectUser.pageNum;
      var paglst =
        Math.round(
          $scope.localObjectUser.recordsCountUser / $scope.pageSizeByUser
        ) - pageNum;
      pageNum =
        $scope.localObjectUser.recordsCountUser >
        $scope.pageSizeByUser * pageNum
          ? pageNum + paglst
          : pageNum;
      $scope.localObjectUser.reset();
      $scope.localObjectUser.pageNum = pageNum;
    };

    //==========================================================================================================================================================
    //===============================================================Pangination for requests===========================================================================================

    $scope.TotalPages = function () {
      var size = parseInt($scope.pageSize, 5);
      if (size > $scope.localObject.recordsCount) return 1;
      else
        return $scope.localObject.recordsCount % size === 0
          ? $scope.localObject.recordsCount / size
          : Math.floor($scope.localObject.recordsCount / size) + 1;
    };
    $scope.NavFirst = function () {
      var pageNum = $scope.localObject.pageNum;
      var paglst = $scope.localObject.recordsCount / $scope.pageSize;

      pageNum =
        $scope.localObject.recordsCount > $scope.pageSize * pageNum
          ? pageNum + (paglst - 1)
          : pageNum;

      if (pageNum > 1) {
        pageNum = pageNum > 2 ? 1 : pageNum - 1;
      }

      $scope.localObject.reset();
      $scope.localObject.pageNum = pageNum;
    };

    $scope.NavPrev = function () {
      var pageNum = $scope.localObject.pageNum;
      pageNum = pageNum < 2 ? 1 : pageNum - 1;
      $scope.localObject.reset();
      console.log(pageNum);
      $scope.localObject.pageNum = pageNum;
    };
    $scope.NavNext = function () {
      var pageNum = $scope.localObject.pageNum;
      pageNum =
        $scope.localObject.recordsCount > $scope.pageSize * pageNum
          ? pageNum + 1
          : pageNum;
      $scope.localObject.reset();
      console.log(pageNum);
      $scope.localObject.pageNum = pageNum;
    };

    $scope.NavLast = function () {
      var pageNum = $scope.localObject.pageNum;
      var paglst =
        Math.round($scope.localObject.recordsCount / $scope.pageSize) - pageNum;
      pageNum =
        $scope.localObject.recordsCount > $scope.pageSize * pageNum
          ? pageNum + paglst
          : pageNum;
      $scope.localObject.reset();
      $scope.localObject.pageNum = pageNum;
    };

    //==========================================================================================================================================================
    //===============================================================Pangination for groups===========================================================================================

    $scope.TotalPagesGroup = function () {
      var size = parseInt($scope.pageSizeGroup, 5);
      if (size > $scope.localObjectGroup.recordsCountUser) return 1;
      else
        return $scope.localObjectGroup.recordsCountUser % size === 0
          ? $scope.localObjectGroup.recordsCountUser / size
          : Math.floor($scope.localObjectGroup.recordsCountUser / size) + 1;
    };
    $scope.NavFirstGroup = function () {
      var pageNum = $scope.localObjectGroup.pageNum;
      var paglst =
        $scope.localObjectGroup.recordsCountUser / $scope.pageSizeGroup;

      pageNum =
        $scope.localObjectGroup.recordsCountUser >
        $scope.pageSizeGroup * pageNum
          ? pageNum + (paglst - 1)
          : pageNum;

      if (pageNum > 1) {
        pageNum = pageNum > 2 ? 1 : pageNum - 1;
      }

      $scope.localObjectGroup.reset();
      $scope.localObjectGroup.pageNum = pageNum;
    };

    $scope.NavPrevGroup = function () {
      var pageNum = $scope.localObjectGroup.pageNum;
      pageNum = pageNum < 2 ? 1 : pageNum - 1;
      $scope.localObjectGroup.reset();
      console.log(pageNum);
      $scope.localObjectGroup.pageNum = pageNum;
    };
    $scope.NavNextGroup = function () {
      var pageNum = $scope.localObjectGroup.pageNum;
      pageNum =
        $scope.localObjectGroup.recordsCountUser >
        $scope.pageSizeGroup * pageNum
          ? pageNum + 1
          : pageNum;
      $scope.localObjectGroup.reset();
      console.log(pageNum);
      $scope.localObjectGroup.pageNum = pageNum;
    };

    $scope.NavLastGroup = function () {
      var pageNum = $scope.localObjectGroup.pageNum;
      var paglst =
        Math.round(
          $scope.localObjectGroup.recordsCountUser / $scope.pageSizeGroup
        ) - pageNum;
      pageNum =
        $scope.localObjectGroup.recordsCountUser >
        $scope.pageSizeGroup * pageNum
          ? pageNum + paglst
          : pageNum;
      $scope.localObjectGroup.reset();
      $scope.localObjectGroup.pageNum = pageNum;
    };

    //==========================================================================================================================================================
  }
);

app.factory("authInterceptor", function ($rootScope, $q, $window) {
  return {
    request: function (config) {
      config.headers = config.headers || {};
      if ($window.localStorage.token) {
        //console.log("$window.localStorage.token ", $window.localStorage.token)
        config.headers.Authorization = "Bearer " + $window.localStorage.token;
      }
      return config;
    },
    responseError: function (rejection) {
      if (rejection.status === 401) {
        window.location.href = "/agency-login";
        console.log("rejection ", rejection);
      }

      return $q.reject(rejection);
    },
  };
});

app.config(function ($httpProvider) {
  $httpProvider.interceptors.push("authInterceptor");
});
