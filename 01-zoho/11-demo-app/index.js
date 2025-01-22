import * as ZOHOCRMSDK from "@zohocrm/nodejs-sdk-5.0";

class Initializer {
  static async initialize() {
    let logger = new ZOHOCRMSDK.LogBuilder()
      .level(ZOHOCRMSDK.Levels.INFO)
      .filePath("/Users/user_name/Documents/nodejs_sdk_log.log")
      .build();
    let environment = ZOHOCRMSDK.INDataCenter.PRODUCTION();
    let token = new ZOHOCRMSDK.OAuthBuilder()
      .clientId("1000.YSPJ1LD3F006IWTG3YPQJ1FAUZA1NW")
      .clientSecret("0aab793d085860756d0e09f2772bac714b295ef213")
      .grantToken("1000.620c77769041497bdb66412c63874555.18f179b92ea0095cbc2b93ca36cae0a0")
      .build();
    let sdkConfig = new ZOHOCRMSDK.SDKConfigBuilder()
      .pickListValidation(false)
      .autoRefreshFields(true)
      .build();
   
    (await new ZOHOCRMSDK.InitializeBuilder())
      .environment(environment)
      .token(token)
      .SDKConfig(sdkConfig)
      .logger(logger)
      .initialize()
      .catch((err) => {
        console.log(err);
      });
  }
}

async function getAllLeads() {
  try {
    await Initializer.initialize();

    let recordOperations = new ZOHOCRMSDK.Record.RecordOperations();

    // Create a parameter map to specify fields
    let paramInstance = new ZOHOCRMSDK.ParameterMap();
    await paramInstance.add(ZOHOCRMSDK.Record.GetRecordsParam.FIELDS, "First_Name,Last_Name,Email");

    // Fetch leads with selected fields
    let response = await recordOperations.getRecords("Leads", paramInstance);

    if (response !== null && response.getObject() !== null) {
      let responseObject = response.getObject();

      if (responseObject instanceof ZOHOCRMSDK.Record.ResponseWrapper) {
        let records = responseObject.getData();

        if (records.length > 0) {
          records.forEach(record => {
            console.log("Lead ID:", record.getId());
            console.log("First Name:", record.getKeyValue("First_Name"));
            console.log("Last Name:", record.getKeyValue("Last_Name"));
            console.log("Email:", record.getKeyValue("Email"));
            console.log("-----------------------------------");
          });
        } else {
          console.log("No leads found.");
        }
      } else {
        console.log("Failed to fetch leads. API returned:", responseObject);
      }
    }
  } catch (error) {
    console.error("Error fetching leads:", error);
  }
}

getAllLeads();