
/* -----> import External packages <----- */
import * as ZOHOCRMSDK from "@zohocrm/nodejs-sdk-7.0"

// console.log(ZOHOCRMSDK);

console.log("-------> configuration <---------");
// 01 environment
// 02 token

/* -----> 01 Environment <----- */
let environment = ZOHOCRMSDK.INDataCenter.PRODUCTION();
console.log(environment);

/* -----> 02 Token Generation <----- */

const clientId="1000.YSPJ1LD3F006IWTG3YPQJ1FAUZA1NW"
const clientSecret="0aab793d085860756d0e09f2772bac714b295ef213"
const code="1000.8d4e5bded91bce1fb4d8ed2c31e77a39.f342fe26ebc6c2dcc6b3177cb6d7dfef"
const refreshToken="1000.56077ba12df3267659fb0323cb07c4f9.8220c139d78e8c5c30559c57e0e33c2e"

/*

// 01 grant token flow
let token1 = (new ZOHOCRMSDK.OAuthBuilder())
.clientId(clientId)
.clientSecret(clientSecret)
.grantToken(code)
.build();
console.log(token1);

// 02 refresh token flow
const refreshToken="1000.56077ba12df3267659fb0323cb07c4f9.8220c139d78e8c5c30559c57e0e33c2e"
let token2 = (new ZOHOCRMSDK.OAuthBuilder())
  .clientId(clientId)
  .clientSecret(clientSecret)
  .refreshToken(refreshToken)
  .build();

console.log(token2);  

// const accessToken = "1000.b6d47fe31fc046386da702f296d562c2.b3d7f68d4dca1f8e6aa21f28d28ab9e5";
// 03 access token flow
// let token3 = (new ZOHOCRMSDK.OAuthBuilder())
//   .accessToken(accessToken)
//   .build();

// console.log(token3);

*/

/* -----> 03 Configuration <----- */
let sdkConfig = new ZOHOCRMSDK.SDKConfigBuilder()
  .autoRefreshFields(true)
  .build();


/* ----- 04 Initialization <----- */

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


// Function to test initialization
const testInitialization = async () => {
  try {
    // Initialize SDK
    await Initializer.initialize();

    // Verify by fetching available modules in Zoho CRM
    let moduleOperations = new ZOHOCRMSDK.Modules.ModulesOperations();
    let response = await moduleOperations.getModules();

    if (response !== null && response.getObject() !== null) {
      let responseObject = response.getObject();

      if (responseObject instanceof ZOHOCRMSDK.Modules.ResponseWrapper) {
        let modules = responseObject.getModules();
        console.log("Modules fetched successfully:", modules.map((m) => m.getAPIName()));
      } else {
        console.log("Failed to fetch modules. API response:", responseObject);
      }
    } else {
      console.error("No response from Zoho CRM API. Initialization might have failed.");
    }
  } catch (error) {
    console.error("Error testing initialization:", error);
  }
}

// (async () => {
//   await testInitialization();
// })();




/* -----> Get Module Data <----- */

const getModuleData = async (moduleName, fields = null, options = {}) => {
  const { 
    page = 1, 
    perPage = 200, 
    maxPages = 5 
  } = options;

  if (!moduleName || typeof moduleName !== "string") {
    throw new Error("Invalid module name");
  }

  await Initializer.initialize();

  const recordOperations = new ZOHOCRMSDK.Record.RecordOperations(moduleName);
  const paramInstance = new ZOHOCRMSDK.ParameterMap();

  // Add pagination parameters
  await paramInstance.add(ZOHOCRMSDK.Record.GetRecordsParam.PAGE, page);
  await paramInstance.add(ZOHOCRMSDK.Record.GetRecordsParam.PER_PAGE, perPage);

  // Add fields if specified
  if (fields) {
    await paramInstance.add(ZOHOCRMSDK.Record.GetRecordsParam.FIELDS, fields);
  }

  try {
    const response = await recordOperations.getRecords(paramInstance);

    if (!response) {
      console.log("No response from Zoho CRM");
      return [];
    }

    const responseObject = response.getObject();

    if (responseObject instanceof ZOHOCRMSDK.Record.ResponseWrapper) {
      const records = responseObject.getData();

      // Dynamic mapping of specified fields
      return records.map(record => {
        const mappedRecord = { id: record.getId() };
        
        // If specific fields are provided, map only those
        if (fields) {
          fields.split(',').forEach(field => {
            const trimmedField = field.trim();
            mappedRecord[trimmedField] = record.getKeyValue(trimmedField);
          });
        }
        
        return mappedRecord;
      });
    }

    if (responseObject instanceof ZOHOCRMSDK.Record.APIException) {
      throw new Error(`API Exception: ${responseObject.getMessage()}`);
    }

    return [];
  } catch (error) {
    console.error(`Error fetching data from ${moduleName}:`, error);
    throw error;
  }
};

// Call Module
(async () => {
  try {
    const leads = await getModuleData("Leads", "Last_Name,First_Name,Email");
    console.log("Fetched Leads:", leads);
  } catch (error) {
    console.error("Error:", error);
  }
})();