const userDetailsController = require("../controllers/users_details");
const userFileOperationController = require("../controllers/users_file_operation");
const passportGoogle = require("../handlers/googleHandler");
const passportFacebook = require("../handlers/faceBookHandler");
const utils = require("../utils");
const tokenValidation = utils.VALIDATE_TOKEN.validateToken;
const {
  awsUserImageOperationDuringSignUp,
  awsUserImageOperation,
  awsUserGreetingAudioOperation,
  awsUserMultipleNormalImageOperation,
  awsUserMultipleSecretImageOperation,
} = utils.AWS_FILE_OPERATION;
const {
  userImageUpload,
  profileImageUpload,
  greetingAudioUpload,
  multipleNormalImageUpload,
  multipleSecretImageUpload,
} = utils.FILE_UPLOAD;
const {
  isUserEmailVerified,
  isUserPhoneVerified,
  isHost,
  isBlocked,
  checkNormalPicsLength,
  checkSecretPicsLength,
} = require("../handlers/userHandler");

module.exports = (router) => {
  //Authentication
  router
    .route("/users/signup")
    .post(
      userImageUpload,
      awsUserImageOperationDuringSignUp,
      userDetailsController.signup
    );

  //Users authentication
  router.route("/users/login").post(
    //isUserEmailVerified,
    //  isUserPhoneVerified,
    userDetailsController.login
  );

  //Users social login
  router.route("/users/social-login").post(
    //isUserEmailVerified,
    //  isUserPhoneVerified,
    userDetailsController.socialLogin
  );

  //Google
  router.get(
    "/users/login/google",
    passportGoogle.authenticate("google", { scope: ["email", "profile"] })
  );

  router.get(
    "/users/google/callback",
    passportGoogle.authenticate("google", { failureRedirect: "/" }),
    function (req, res) {
      res.json(req.user);
    }
  );

  //facebook
  router.get(
    "/users/login/facebook",
    passportFacebook.authenticate("facebook")
  );

  router.get(
    "/users/facebook/callback",
    passportFacebook.authenticate("facebook", { failureRedirect: "/" }),
    function (req, res) {
      res.json(req.user);
    }
  );

  //Users get profile
  router
    .route("/users/profile")
    .get(tokenValidation, isBlocked, userDetailsController.getUserDetails);

  //Get other user details
  router
    .route("/users/details/:userId")
    .get(tokenValidation, isBlocked, userDetailsController.getOtherUserDetails);

  router
    .route("/users/update-profile")
    .patch(tokenValidation, isBlocked, userDetailsController.userProfileUpdate); //complete

  //Users get list of opposite genders
  router
    .route("/users/get-list-of-opposite-gender")
    .get(
      tokenValidation,
      isBlocked,
      userDetailsController.getListOfOppositeGender
    );

  //Users get recommended list
  router
    .route("/users/get-recommended-list")
    .get(tokenValidation, isBlocked, userDetailsController.getRecommendedList);

  //Users get nearby list
  router
    .route("/users/get-nearby-list")
    .get(tokenValidation, isBlocked, userDetailsController.getNearbyList);

  //Users get all gifts
  router
    .route("/users/gifts")
    .get(tokenValidation, isBlocked, userDetailsController.getAllGifts);

  //Users reset password
  router
    .route("/users/reset-password")
    .patch(userDetailsController.resetPassword);

  //Users app registration
  router
    .route("/users/app-registration")
    .post(tokenValidation, isBlocked, userDetailsController.appReg);

  //Users logout
  router
    .route("/users/log-out")
    .post(tokenValidation, userDetailsController.logOut);

  router
    .route("/users/delete")
    .post(tokenValidation, isBlocked, userDetailsController.deleteUser);

  //Agora
  router.route("/users/get-access-token").get(
    tokenValidation,
    //isUserEmailVerified,
    isBlocked,
    userDetailsController.getUserAccessToken
  ); //complete

  //Email Verification
  router
    .route("/users/:userId/:secret")
    .get(userDetailsController.verifyUserEmail); //complete

  //Phone Verification
  router.route("/users/verifyPhone").get(userDetailsController.verifyUserPhone); //complete

  //User follow
  router
    .route("/users/follow")
    .post(tokenValidation, isBlocked, userDetailsController.follow); //complete

  //User unfollow
  router
    .route("/users/unfollow")
    .post(tokenValidation, isBlocked, userDetailsController.unfollow); //complete

  //User recharge wallet
  router
    .route("/users/recharge-wallet")
    .post(tokenValidation, isBlocked, userDetailsController.rechargeWallet); //complete

  //User video call spendings
  router
    .route("/users/video-call-spending")
    .post(tokenValidation, isBlocked, userDetailsController.videoCallSpendings); //complete

  //User audio call spendings
  router
    .route("/users/audio-call-spending")
    .post(tokenValidation, isBlocked, userDetailsController.audioCallSpendings); //complete

  //User secret pic spendings
  router
    .route("/users/secret-pic-spending")
    .post(tokenValidation, isBlocked, userDetailsController.secretPicSpendings); //complete

  //User gift spendings
  router
    .route("/users/gift-spending")
    .post(tokenValidation, isBlocked, userDetailsController.giftSpendings); //complete

  //User wallet details
  router
    .route("/users/get-wallet-details")
    .get(tokenValidation, isBlocked, userDetailsController.getUserWalletBal); //complete

  router.route("/users/sendNotification").post(
    tokenValidation,
    //isUserEmailVerified,
    isBlocked,
    userDetailsController.sendNotification
  ); //complete

  // block user
  router
    .route("/users/block")
    .post(tokenValidation, isBlocked, userDetailsController.blockUser);

  //unblock user
  router
    .route("/users/unblock")
    .post(tokenValidation, isBlocked, userDetailsController.unBlockUser);

  //File operations in users =========================================================

  //Users profile image
  router.route("/users/upload-profile-image").post(
    tokenValidation,
    isBlocked,
    //isUserEmailVerified,
    profileImageUpload,
    awsUserImageOperation,
    userFileOperationController.uploadUserProfileImage
  ); //complete

  //Users greeting audio
  router.route("/users/upload-greeting-audio").post(
    tokenValidation,
    isBlocked,
    //isUserEmailVerified,
    greetingAudioUpload,
    awsUserGreetingAudioOperation,
    userFileOperationController.uploadGreetingAudio
  ); //complete

  //Users pics (5)
  router.route("/users/upload-normal-images").post(
    tokenValidation,
    isBlocked,
    //isUserEmailVerified,
    checkNormalPicsLength,
    multipleNormalImageUpload,
    awsUserMultipleNormalImageOperation,
    userFileOperationController.uploadNormalImages
  ); //complete

  //Users secret pics (5)
  router.route("/users/upload-secret-images").post(
    tokenValidation,
    isBlocked,
    //isUserEmailVerified,
    //isHost,
    checkSecretPicsLength,
    multipleSecretImageUpload,
    awsUserMultipleSecretImageOperation,
    userFileOperationController.uploadSecretImages
  ); //complete

  router
    .route("/users/deleteProfilePic")
    .post(
      tokenValidation,
      isBlocked,
      userFileOperationController.deleteUserProfileImage
    );

  router
    .route("/users/deleteNormalPic")
    .post(
      tokenValidation,
      isBlocked,
      userFileOperationController.deleteUserNormalImage
    );

  router
    .route("/users/deleteSecretPic")
    .post(
      tokenValidation,
      isBlocked,
      userFileOperationController.deleteUserSecretImage
    );

  router
    .route("/users/deleteAudio")
    .post(tokenValidation, userFileOperationController.deleteUserAudio);

  //==================================================================================
};
