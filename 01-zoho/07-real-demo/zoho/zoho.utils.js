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


export { getModuleData };