
import * as ZOHOCRMSDK from "@zohocrm/nodejs-sdk-7.0";
import dotenv from "dotenv";
dotenv.config();


class Initializer {
  static async initialize() {
    try {
      let environment = ZOHOCRMSDK.USDataCenter.PRODUCTION;


     let token= new ZOHOCRMSDK.OAuthBuilder()
.clientId(process.env.ZOHO_CLIENT_ID)
.clientSecret(process.env.ZOHO_CLIENT_SECRET)
.redirectURL(process.env.ZOHO_REDIRECT_URL)
.build();




      await new ZOHOCRMSDK.InitializeBuilder()
        .environment(environment)
        .token(token)
        .initialize();

      console.log("✅ Zoho SDK Initialized Successfully!");
    } catch (error) {
      console.error("❌ Zoho SDK Initialization Failed:", error);
    }
  }
}

export default Initializer;
