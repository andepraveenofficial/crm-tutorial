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


export { getModuleData, getParticularRecord };