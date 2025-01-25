import * as ZOHOCRMSDK from "@zohocrm/nodejs-sdk-7.0";
import Initializer from "./zoho.config.js";

class ZohoCRMService {
  /**
   * Get module records with advanced filtering and pagination
   * @param {string} moduleAPIName - The API name of the module
   * @param {Object} options - Optional configuration for the request
   * @returns {Promise<Array>} Array of records
   */
  static async getModuleData(moduleAPIName, options = {}) {
    const { 
      page = 1, 
      perPage = 200,
      fields = null,
      approved = 'both'
    } = options;

    if (!moduleAPIName) {
      throw new Error("Module name is required");
    }

    await Initializer.initialize();

    try {
      const recordOperations = new ZOHOCRMSDK.Record.RecordOperations(moduleAPIName);
      const paramInstance = new ZOHOCRMSDK.ParameterMap();
      const headerInstance = new ZOHOCRMSDK.HeaderMap();

      await paramInstance.add(ZOHOCRMSDK.Record.GetRecordsParam.PAGE, page);
      await paramInstance.add(ZOHOCRMSDK.Record.GetRecordsParam.PER_PAGE, perPage);
      await paramInstance.add(ZOHOCRMSDK.Record.GetRecordsParam.APPROVED, approved);

      if (fields) {
        await paramInstance.add(ZOHOCRMSDK.Record.GetRecordsParam.FIELDS, fields.toString());
      }

      const response = await recordOperations.getRecords(paramInstance, headerInstance);

      if (!response) {
        console.log("No response from Zoho CRM");
        return [];
      }

      const responseObject = response.getObject();

      if (responseObject instanceof ZOHOCRMSDK.Record.ResponseWrapper) {
        const records = responseObject.getData();

        return records.map(record => {
          const mappedRecord = { 
            id: record.getId().toString(),
            createdBy: record.getCreatedBy(),
            modifiedBy: record.getModifiedBy(),
            createdTime: record.getCreatedTime(),
            modifiedTime: record.getModifiedTime()
          };

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
      console.error(`Error fetching data from ${moduleAPIName}:`, error);
      throw error;
    }
  }

  /**
   * Get a particular record by ID
   * @param {string} moduleAPIName - The API name of the module
   * @param {string} recordId - The ID of the record
   * @param {string} fields - Comma-separated list of fields to retrieve
   * @returns {Promise<Object>} Retrieved record
   */
  static async getRecord(moduleAPIName, recordId, fields = null) {
    await Initializer.initialize();

    const recordOperations = new ZOHOCRMSDK.Record.RecordOperations(moduleAPIName);

    try {
      const response = await recordOperations.getRecord(BigInt(recordId));

      if (!response) {
        console.log("No response from Zoho CRM");
        return null;
      }

      const responseObject = response.getObject();

      if (responseObject instanceof ZOHOCRMSDK.Record.ResponseWrapper) {
        const records = responseObject.getData();
        const record = records[0];

        const mappedRecord = { 
          id: record.getId().toString(),
          createdBy: record.getCreatedBy(),
          modifiedBy: record.getModifiedBy(),
          createdTime: record.getCreatedTime(),
          modifiedTime: record.getModifiedTime()
        };

        if (fields) {
          fields.split(',').forEach(field => {
            const trimmedField = field.trim();
            mappedRecord[trimmedField] = record.getKeyValue(trimmedField);
          });
        }

        return mappedRecord;
      }

      if (responseObject instanceof ZOHOCRMSDK.Record.APIException) {
        throw new Error(`API Exception: ${responseObject.getMessage()}`);
      }

      return null;
    } catch (error) {
      console.error(`Error fetching record from ${moduleAPIName}:`, error);
      throw error;
    }
  }

  /**
   * Create a new record
   * @param {string} moduleAPIName - The API name of the module
   * @param {Object} data - Record data to be created
   * @returns {Promise<Array>} Created record details
   */
  static async createRecord(moduleAPIName, data) {
    await Initializer.initialize();

    const recordOperations = new ZOHOCRMSDK.Record.RecordOperations(moduleAPIName);
    const request = new ZOHOCRMSDK.Record.BodyWrapper();
    const record = new ZOHOCRMSDK.Record.Record();

    Object.entries(data).forEach(([key, value]) => {
      record.addFieldValue(ZOHOCRMSDK.Record.Field[moduleAPIName][key], value);
    });

    request.setData([record]);

    try {
      const response = await recordOperations.createRecords(request);

      if (response?.getObject() instanceof ZOHOCRMSDK.Record.ActionWrapper) {
        const actionResponses = response.getObject().getData();

        return actionResponses
          .filter(actionResponse => actionResponse instanceof ZOHOCRMSDK.Record.SuccessResponse)
          .map(successResponse => ({
            id: successResponse.getDetails().get('id'),
            createdTime: successResponse.getDetails().get('Created_Time'),
            modifiedTime: successResponse.getDetails().get('Modified_Time')
          }));
      }
    } catch (error) {
      console.error(`Error creating record in ${moduleAPIName}:`, error);
      throw error;
    }
  }

  /**
   * Update an existing record
   * @param {string} moduleAPIName - The API name of the module
   * @param {string} recordId - The ID of the record to update
   * @param {Object} data - Record data to be updated
   * @returns {Promise<Array>} Updated record details
   */
  static async updateRecord(moduleAPIName, recordId, data) {
    await Initializer.initialize();

    const recordOperations = new ZOHOCRMSDK.Record.RecordOperations(moduleAPIName);
    const request = new ZOHOCRMSDK.Record.BodyWrapper();
    const record = new ZOHOCRMSDK.Record.Record();

    record.addKeyValue("id", BigInt(recordId));

    Object.entries(data).forEach(([key, value]) => {
      record.addFieldValue(ZOHOCRMSDK.Record.Field[moduleAPIName][key], value);
    });

    request.setData([record]);

    try {
      const response = await recordOperations.updateRecord(BigInt(recordId), request);

      if (response?.getObject() instanceof ZOHOCRMSDK.Record.ActionWrapper) {
        const actionResponses = response.getObject().getData();

        return actionResponses
          .filter(actionResponse => actionResponse instanceof ZOHOCRMSDK.Record.SuccessResponse)
          .map(successResponse => ({
            id: successResponse.getDetails().get('id'),
            createdTime: successResponse.getDetails().get('Created_Time'),
            modifiedTime: successResponse.getDetails().get('Modified_Time')
          }));
      }
    } catch (error) {
      console.error(`Error updating record in ${moduleAPIName}:`, error);
      throw error;
    }
  }

  /**
   * Delete a record
   * @param {string} moduleAPIName - The API name of the module
   * @param {string} recordId - The ID of the record to delete
   * @returns {Promise<Array>} Deletion result details
   */
  static async deleteRecord(moduleAPIName, recordId) {
    await Initializer.initialize();

    const recordOperations = new ZOHOCRMSDK.Record.RecordOperations(moduleAPIName);

    try {
      const response = await recordOperations.deleteRecord(BigInt(recordId));

      if (response?.getObject() instanceof ZOHOCRMSDK.Record.ActionWrapper) {
        const actionResponses = response.getObject().getData();

        return actionResponses
          .filter(actionResponse => actionResponse instanceof ZOHOCRMSDK.Record.SuccessResponse)
          .map(successResponse => ({
            id: successResponse.getDetails().get('id')
          }));
      }
    } catch (error) {
      console.error(`Error deleting record in ${moduleAPIName}:`, error);
      throw error;
    }
  }

  /**
   * Get records with search criteria
   * @param {string} moduleAPIName - The API name of the module
   * @param {Object} criteria - Search criteria
   * @returns {Promise<Array>} Matched records
   */
  static async searchRecords(moduleAPIName, criteria) {
    await Initializer.initialize();

    const recordOperations = new ZOHOCRMSDK.Record.RecordOperations(moduleAPIName);
    const paramInstance = new ZOHOCRMSDK.ParameterMap();

    try {
      // Convert criteria to Zoho's search format
      const searchCriteria = Object.entries(criteria)
        .map(([key, value]) => `(${key}:equals:${value})`)
        .join('AND');

      await paramInstance.add(ZOHOCRMSDK.Record.SearchRecordsParam.CRITERIA, searchCriteria);

      const response = await recordOperations.searchRecords(paramInstance);

      if (response?.getObject() instanceof ZOHOCRMSDK.Record.ResponseWrapper) {
        const records = response.getObject().getData();

        return records.map(record => ({
          id: record.getId().toString(),
          createdBy: record.getCreatedBy(),
          modifiedBy: record.getModifiedBy(),
          createdTime: record.getCreatedTime(),
          modifiedTime: record.getModifiedTime(),
          ...Object.fromEntries(
            Object.keys(criteria).map(key => [key, record.getKeyValue(key)])
          )
        }));
      }
    } catch (error) {
      console.error(`Error searching records in ${moduleAPIName}:`, error);
      throw error;
    }
  }
}

export default ZohoCRMService;