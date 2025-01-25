/* -----> import External packages <----- */
import * as ZOHOCRMSDK from "@zohocrm/nodejs-sdk-7.0"
import Initializer from "./zoho.config.js"


/* -----> Get Module Data <----- */

const getModuleData = async (moduleName, fields = null, options = {}) => {
  const { 
    page = 1, 
    perPage = 200 
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
      const result =  records.map(record => {
        const mappedRecord = { id: record.getId() };
        // If specific fields are provided, map only those
        if (fields) {
          fields.split(',').forEach(field => {
            const trimmedField = field.trim();
            mappedRecord[trimmedField] = record.getKeyValue(trimmedField);
          });
        }

        return mappedRecord
      });

      const serializedLeads = result.map(record => ({
        ...record,
        id: record.id.toString() // Convert BigInt to string
      }));

      return serializedLeads; 
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

/* -----> Get Particular Record <----- */
const getParticularRecord = async (moduleName, recordId, fields=null) => {
  if (!moduleName || typeof moduleName !== "string") {
    throw new Error("Invalid module name");
  }

  await Initializer.initialize();

  const recordOperations = new ZOHOCRMSDK.Record.RecordOperations(moduleName);

  try {
    const response = await recordOperations.getRecord(BigInt(recordId));

    if (!response) {
      console.log("No response from Zoho CRM");
      return null;
    }

    const responseObject = response.getObject();

    if (responseObject instanceof ZOHOCRMSDK.Record.ResponseWrapper) {
      const records = await responseObject.getData();

      // Convert each record into a plain JavaScript object
     // Extract only the specified fields from the keyValues map
     const result =  records.map(record => {
      const mappedRecord = { id: record.getId() };
      // If specific fields are provided, map only those
      if (fields) {
        fields.split(',').forEach(field => {
          const trimmedField = field.trim();
          mappedRecord[trimmedField] = record.getKeyValue(trimmedField);
        });
      }

      return mappedRecord
    });

    const serializedLeads = result.map(record => ({
      ...record,
      id: record.id.toString() // Convert BigInt to string
    }));  

    console.log(serializedLeads);
    return serializedLeads;
    }

    if (responseObject instanceof ZOHOCRMSDK.Record.APIException) {
      throw new Error(`API Exception: ${responseObject.getMessage()}`);
    }

    return null;
  } catch (error) {
    console.error(`Error fetching data from ${moduleName}:`, error);
    throw error;
  }
};

/* -----> Create Record <----- */
const createRecord = async (moduleName, data) => {
  if (!moduleName || typeof moduleName !== "string") {
    throw new Error("Invalid module name. Expected a non-empty string.");
  }

  if (!data || typeof data !== "object") {
    throw new Error("Invalid record data provided.");
  }

  console.log("Initializing Zoho SDK...");
  await Initializer.initialize(); // Initialize the Zoho SDK
  console.log("Zoho SDK Initialized.");

  const recordOperations = new ZOHOCRMSDK.Record.RecordOperations(moduleName);
  const request = new ZOHOCRMSDK.Record.BodyWrapper();
  const recordsArray = [];

  // Create a new record and add field values dynamically
  const record = new ZOHOCRMSDK.Record.Record();

  // Adjust field names to match Zoho CRM's field API
  if (moduleName === "Leads") {
    // For Leads module, use ZohoCRM's predefined field constants
    record.addFieldValue(ZOHOCRMSDK.Record.Field.Leads.FIRST_NAME, data.FIRST_NAME);
    record.addFieldValue(ZOHOCRMSDK.Record.Field.Leads.LAST_NAME, data.LAST_NAME);
  }

  recordsArray.push(record);
  request.setData(recordsArray);

  try {
    const headerInstance = new ZOHOCRMSDK.HeaderMap();
    const response = await recordOperations.createRecords(request, headerInstance);

    if (response != null) {
      const responseObject = response.getObject();

      if (responseObject instanceof ZOHOCRMSDK.Record.ActionWrapper) {
        const actionResponses = responseObject.getData();

        actionResponses.forEach(actionResponse => {
          if (actionResponse instanceof ZOHOCRMSDK.Record.SuccessResponse) {
            console.log("Status: " + actionResponse.getStatus().getValue());
            console.log("Code: " + actionResponse.getCode().getValue());
            console.log("Message: " + actionResponse.getMessage().getValue());
          } else if (actionResponse instanceof ZOHOCRMSDK.Record.APIException) {
            console.log("Status: " + actionResponse.getStatus().getValue());
            console.log("Code: " + actionResponse.getCode().getValue());
            console.log("Message: " + actionResponse.getMessage().getValue());
          }
        });
      }
    } else {
      throw new Error("Failed to create record in Zoho CRM");
    }
  } catch (error) {
    console.error("Error during record creation:", error);
    throw error;
  }
};


/* -----> Export Functions <----- */
export { getModuleData, getParticularRecord, createRecord };