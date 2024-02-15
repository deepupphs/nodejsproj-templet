const adminController = require("../controllers/admin");
const agencyController = require("../controllers/agency");
const utils = require("../utils");
const tokenValidation = utils.ADMIN_VALIDATE_TOKEN.validateToken;

module.exports = (router) => {
  router.route("/admin/login").post(adminController.login); //complete

  //Charts
  router
    .route("/admin/get-chart-data")
    .get(tokenValidation, adminController.getChartData); //complete
  router
    .route("/admin/get-users")
    .get(tokenValidation, adminController.getAllUser); //complete
  router
    .route("/admin/get-hosts")
    .get(tokenValidation, adminController.getAllHosts); //complete

  router
    .route("/admin/get-agency-hosts/:agencyId")
    .get(tokenValidation, adminController.getAllAgencyHosts); //complete

  router
    .route("/admin/get-user-details/:userId")
    .get(tokenValidation, adminController.getUserInfo); //complete
  // block/unblock user
  router
    .route("/admin/user/block-unblock")
    .post(tokenValidation, adminController.blockUnblockUser);

  //delete user
  router
    .route("/admin/user/delete")
    .post(tokenValidation, adminController.deleteUser);

  router
    .route("/admin/user/host")
    .post(tokenValidation, adminController.makeHost); //complete

  router
    .route("/admin/user/recommend")
    .post(tokenValidation, adminController.recommendUser); //complete
  router
    .route("/admin/user/email/verify")
    .post(tokenValidation, adminController.verifyUserEmail); //complete

  router
    .route("/admin/user/phone/verify")
    .post(tokenValidation, adminController.verifyUserPhone); //complete
  //-----------------------------------membership-------------------------------------------------
  router
    .route("/admin/add-membership")
    .post(tokenValidation, adminController.addMembership); //complete

  router
    .route("/admin/get-all-memberships")
    .get(tokenValidation, adminController.getAllMemberships); //complete

  router
    .route("/admin/get-membership/:id")
    .get(tokenValidation, adminController.getMembershipDetails); //complete

  router
    .route("/admin/update-membership")
    .post(tokenValidation, adminController.updateMembershipPrice); //complete

  //-----------------------------------charges-------------------------------------------------
  router
    .route("/admin/add-charge")
    .post(tokenValidation, adminController.addCharge); //complete

  router
    .route("/admin/update-charge")
    .post(tokenValidation, adminController.updateCharge); //complete

  router
    .route("/admin/delete-charge")
    .post(tokenValidation, adminController.deleteCharge); //complete

  router
    .route("/admin/get-all-charges")
    .get(tokenValidation, adminController.getAllCharges); //complete

  router
    .route("/admin/get-charge/:id")
    .get(tokenValidation, adminController.getChargeDetails); //complete
  //-----------------------------------recharge-------------------------------------------------
  router
    .route("/admin/add-recharge")
    .post(tokenValidation, adminController.addRecharge); //complete

  router
    .route("/admin/update-recharge")
    .post(tokenValidation, adminController.updateRecharge); //complete

  router
    .route("/admin/delete-recharge")
    .post(tokenValidation, adminController.deleteRecharge); //complete

  router
    .route("/admin/get-all-recharges")
    .get(tokenValidation, adminController.getAllRecharges); //complete

  router
    .route("/admin/get-recharge/:id")
    .get(tokenValidation, adminController.getRechargeDetails); //complete
  //-----------------------------------agencies---------------------------------------------------
  router
    .route("/admin/add-agency")
    .post(tokenValidation, adminController.addAgency); //complete

  router
    .route("/admin/agency-update")
    .post(tokenValidation, adminController.updateAgency); //complete

  router
    .route("/admin/agency-activate")
    .post(tokenValidation, adminController.activateDeactivateAgency); //complete

  router
    .route("/admin/get-all-agencies")
    .get(tokenValidation, adminController.getAllAgencies); //complete

  router
    .route("/admin/get-agency/:id")
    .get(tokenValidation, adminController.getAgencyDetails); //complete

  //-----------------------------------agencies - host---------------------------------------------------
  router.route("/admin/agency/login").post(agencyController.login); //complete
  router
    .route("/admin/agency/get-agency-dashboard-data")
    .get(tokenValidation, agencyController.getDashboardData); //complete
  router
    .route("/admin/agency/add-host")
    .post(tokenValidation, agencyController.createHost); //complete

  router
    .route("/admin/agency/get-all-hosts")
    .get(tokenValidation, agencyController.getAllHosts); //complete

  router
    .route("/admin/agency/get-host/:hostId")
    .get(tokenValidation, agencyController.getHostInfo); //complete

  router
    .route("/admin/agency/assign-host/:userID")
    .put(tokenValidation, agencyController.assignHost); //complete

  router
    .route("/admin/agency/make-and-get-all-settlements")
    .post(tokenValidation, agencyController.makeAndGetAllSettlements); //complete

  router
    .route("/admin/agency/update/settlemet/status")
    .post(tokenValidation, agencyController.updateSettlementStatus); //complete

  router
    .route("/admin/agency/get-monthly-reports/:month")
    .get(tokenValidation, agencyController.getMonthlyReport); //complete

  router
    .route("/admin/agency/get-daily-reports/:date")
    .get(tokenValidation, agencyController.getDailyReport); //complete

  router
    .route("/admin/agency/get-all-host-reports/:date/:hostId")
    .get(tokenValidation, agencyController.getHostReport); //complete

  router
    .route("/admin/agency/get-all-settlements")
    .get(tokenValidation, agencyController.getAllAgencySettlements); //complete

  router
    .route("/admin/agency/get-cycle-details/:date")
    .get(tokenValidation, agencyController.getSettlementCycleDetails); //complete

  router
    .route("/admin/agency/paid-status/change")
    .post(tokenValidation, agencyController.changePaidStatus); //complete
};
