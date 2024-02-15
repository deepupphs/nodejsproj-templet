module.exports = {
  port: process.env.PORT || 4000,
  dbUri:
    "mongodb+srv://golo:golo@cluster0.qlg6q.mongodb.net/golo-app?retryWrites=true&w=majority",
  baseUrl: "https://golo.live/api/v1/users",
  JWT_SECRET: "addjsonwebtokensecretherelikeQuiscustodietipsoscustodes",

  awsS3BaseUrl: "https://golo-app-deploy.s3.us-east-2.amazonaws.com",
  awsAccessKeyId: "AKIA6FMYRRU5RQXGJZTU",
  awsSecretAccessKey: "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",
  awsSignatureVersion: "v4",
  awsRegion: "us-east-2",
  awsBucket: "golo-app-deploy",
  AGORA_APP_ID: "97834216fd944e79bc2db899b412b6a4", //gololive-testing
  AGORA_APP_CERTIFICATE: "dff3fc2358af472793310f473804ddfc", //gololive-testing
  //   Google client ID: 682964134393-vurr6huu9dqplr2edjl889vabpnbkkc5.apps.googleusercontent.com,
  // Google client secret: bpwiIgejM40_0lc7ulEW_psh,
  // Fb app ID: 1098122553939533,
  // Fb app secret: a4eda43481521e3979610b1680404f4d,
  FACEBOOK_CLIENT_ID: "1098122553939533",
  FACEBOOK_CLIENT_SECRET: "a4eda43481521e3979610b1680404f4d",

  GOOGLE_CLIENT_ID:
    "286679380948-hkd81knbj9glgs1qivh4v8gcj2lp5095.apps.googleusercontent.com",
  GOOGLE_CLIENT_SECRET: "KyL8hm11AFesCQVBv-pgLF1y",

  SESSION_SECRET: "addjsonwebtokensecretherelikeQuiscustodietipsoscustodes",

  onePointValue: 1, // this value is used to calculate weekly cashout app-->controller-->agency
  REZORPAY_KEY_ID: "rzp_test_4mayKs6hAOZkS5", //rajesh account
  REZORPAY_SECRET: "YczKebFxcxTHhzSXMF2uBqOJ", //rajesh account
};
