
/* -----> import External packages <----- */
import * as ZOHOCRMSDK from "@zohocrm/nodejs-sdk-7.0"

/* -----> 01 Token Generation <----- */

export const clientId="1000.YSPJ1LD3F006IWTG3YPQJ1FAUZA1NW"
export const clientSecret="0aab793d085860756d0e09f2772bac714b295ef213"
export const refreshToken="1000.56077ba12df3267659fb0323cb07c4f9.8220c139d78e8c5c30559c57e0e33c2e"

/* -----> 02 Configuration <----- */
export let sdkConfig = new ZOHOCRMSDK.SDKConfigBuilder()
  .autoRefreshFields(true)
  .build();


/* ----- 03 Initialization <----- */

class Initializer {
  static async initialize() {

    let environment = ZOHOCRMSDK.INDataCenter.PRODUCTION();
    let token = (new ZOHOCRMSDK.OAuthBuilder()) // refreshToken flow
    .clientId(clientId)
    .clientSecret(clientSecret)
    .refreshToken(refreshToken)
    .build();


   
    (await new ZOHOCRMSDK.InitializeBuilder())
      .environment(environment)
      .token(token)
      .initialize()
      .catch((err) => {
        console.log(err);
      });
  }
}

export default Initializer


