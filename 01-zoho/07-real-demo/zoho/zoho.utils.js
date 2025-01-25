/* -----> import External packages <----- */
import * as ZOHOCRMSDK from "@zohocrm/nodejs-sdk-7.0";
import Initializer from "./zoho.config.js";

async function initializeZoho() {
	await Initializer.initialize();
}

/* -----> Get Module Data <----- */

const getModuleRecords = async (moduleName, options = {}) => {
	try {
		const {
			page = 1,
			perPage = 200,
			fields = null,
			approved = "both",
		} = options;

		// step1: data validation
		if (!moduleName || typeof moduleName !== "string") {
			throw new Error("Invalid module name. Expected a non-empty string.");
		}

		// step2 : initialize the SDK
		console.log("Initializing Zoho SDK...");
		await initializeZoho(); // Initialize the Zoho SDK
		console.log("Zoho SDK Initialized.");

		// step3: create Record Operations instance
		const recordOperations = new ZOHOCRMSDK.Record.RecordOperations(moduleName);

		// step4: create ParameterMap instance and add pagination, approval, and fields parameters
		const paramInstance = new ZOHOCRMSDK.ParameterMap();

		// Add pagination parameters
		await paramInstance.add(ZOHOCRMSDK.Record.GetRecordsParam.PAGE, page);
		await paramInstance.add(
			ZOHOCRMSDK.Record.GetRecordsParam.PER_PAGE,
			perPage
		);

		// Add Approval
		await paramInstance.add(
			ZOHOCRMSDK.Record.GetRecordsParam.APPROVED,
			approved
		);

		// Add fields if specified
		if (fields) {
			await paramInstance.add(
				ZOHOCRMSDK.Record.GetRecordsParam.FIELDS,
				fields.toString()
			);
		}

		// step5: Handle the Response
		const response = await recordOperations.getRecords(
			paramInstance,
			new ZOHOCRMSDK.HeaderMap()
		);
		if (!response) {
			console.log("No response from Zoho CRM");
			return {
				message: "No response from Zoho CRM",
			};
		} else {
      console.log("object", response.getObject());
			const responseObject = response.getObject();

			if (responseObject instanceof ZOHOCRMSDK.Record.ResponseWrapper) {
				const data = responseObject.getData();
				// Ensure records are mapped correctly
			const result = data.map((record) => {
				const mappedRecord = {
					id: record.getId().toString(),
					createdBy: record.getCreatedBy(),
					modifiedBy: record.getModifiedBy(),
					createdTime: record.getCreatedTime(),
					modifiedTime: record.getModifiedTime(),
				};

				// Handle fields dynamically
				if (fields) {
					const fieldList = typeof fields === "string" ? fields.split(",") : fields;
					fieldList.forEach((field) => {
						mappedRecord[field.trim()] = record.getKeyValue(field.trim());
					});
				}

				return mappedRecord;
			});

      console.log("Mapped Records:", result);
			return result; // Return the processed data

			}

    // If responseObject is not an instance of ResponseWrapper
		console.log("Unexpected response format from Zoho CRM");
		return { message: "Unexpected response format" };
		}
	} catch (error) {
		console.error(`Error fetching record from ${moduleName}:`, error);
		throw error;
	}
};

/* -----> Get Particular Record <----- */
const getRecordById = async (moduleName, recordId, fields = null) => {
	if (!moduleName || typeof moduleName !== "string") {
		throw new Error("Invalid module name. Expected a non-empty string.");
	}

	if (!recordId || typeof recordId !== "string") {
		throw new Error("Invalid record ID provided.");
	}

	console.log("Initializing Zoho SDK...");
	await initializeZoho(); // Initialize the Zoho SDK
	console.log("Zoho SDK Initialized.");

	const bigIntRecordId = BigInt(recordId);
	const recordOperations = new ZOHOCRMSDK.Record.RecordOperations(moduleName);

	try {
		const response = await recordOperations.getRecord(bigIntRecordId);

		if (!response) {
			console.log("No response from Zoho CRM");
			return null;
		}

		const responseObject = response.getObject();

		if (responseObject instanceof ZOHOCRMSDK.Record.ResponseWrapper) {
			const records = await responseObject.getData();

			// Extract and map the record data
			const result = records.map((record) => {
				const mappedRecord = { id: record.getId() };
				// If specific fields are provided, map only those
				if (fields) {
					fields.split(",").forEach((field) => {
						const trimmedField = field.trim();
						mappedRecord[trimmedField] = record.getKeyValue(trimmedField);
					});
				}

				return mappedRecord;
			});

			const serializedRecord = result.map((record) => ({
				...record,
				id: record.id.toString(), // Convert BigInt to string
			}));

			console.log(serializedRecord);
			return serializedRecord;
		}

		if (responseObject instanceof ZOHOCRMSDK.Record.APIException) {
			throw new Error(`API Exception: ${responseObject.getMessage()}`);
		}

		return null;
	} catch (error) {
		console.error(`Error fetching record from ${moduleName}:`, error);
		throw error;
	}
};

/* -----> Create Record <----- */
const createNewRecord = async (moduleName, data) => {
	if (!moduleName || typeof moduleName !== "string") {
		throw new Error("Invalid module name. Expected a non-empty string.");
	}

	if (!data || typeof data !== "object") {
		throw new Error("Invalid record data provided.");
	}

	console.log("Initializing Zoho SDK...");
	await initializeZoho(); // Initialize the Zoho SDK
	console.log("Zoho SDK Initialized.");

	const recordOperations = new ZOHOCRMSDK.Record.RecordOperations(moduleName);
	const request = new ZOHOCRMSDK.Record.BodyWrapper();
	const recordsArray = [];

	// Create a new record and add field values dynamically
	const record = new ZOHOCRMSDK.Record.Record();

	for (let [key, value] of Object.entries(data)) {
		record.addFieldValue(ZOHOCRMSDK.Record.Field[moduleName][key], value);
	}

	await recordsArray.push(record);
	await request.setData(recordsArray);

	try {
		const headerInstance = new ZOHOCRMSDK.HeaderMap();
		const response = await recordOperations.createRecords(
			request,
			headerInstance
		);

		if (response != null) {
			const responseObject = response.getObject();

			if (responseObject instanceof ZOHOCRMSDK.Record.ActionWrapper) {
				const actionResponses = responseObject.getData();
				console.log("andepraveen", actionResponses);

				// Assuming actionResponses is an array, loop through it

				actionResponses.forEach((actionResponse) => {
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

				const result = actionResponses.map((actionResponse) => {
					if (actionResponse instanceof ZOHOCRMSDK.Record.SuccessResponse) {
						// Access the details for SuccessResponse
						return actionResponse.getDetails();
					} else if (actionResponse instanceof ZOHOCRMSDK.Record.APIException) {
						// Access the details for APIException (if needed)
						return actionResponse.getDetails();
					}
					return null; // If neither SuccessResponse nor APIException
				});

				const formattedResult = result.map((details) => {
					if (details) {
						return {
							id: details.get("id"),
							createdTime: details.get("Created_Time"),
							modifiedTime: details.get("Modified_Time"),
							createdBy: details.get("Created_By")?.name, // Accessing the name of the user
							modifiedBy: details.get("Modified_By")?.name, // Accessing the name of the user
						};
					}
					return null;
				});

				return formattedResult;
			}
		} else {
			throw new Error("Failed to create record in Zoho CRM");
		}
	} catch (error) {
		console.error("Error during record creation:", error);
		throw error;
	}
};

/* -----> Update Record <----- */
const updateRecordById = async (moduleName, recordId, data) => {
	if (!moduleName || typeof moduleName !== "string") {
		throw new Error("Invalid module name. Expected a non-empty string.");
	}

	if (!recordId || typeof recordId !== "string") {
		throw new Error("Invalid record ID provided.");
	}

	if (!data || typeof data !== "object") {
		throw new Error("Invalid record data provided.");
	}

	const BigIntRecordId = BigInt(recordId);

	console.log("Initializing Zoho SDK...");
	await initializeZoho(); // Initialize the Zoho SDK
	console.log("Zoho SDK Initialized.");

	const recordOperations = new ZOHOCRMSDK.Record.RecordOperations(moduleName);
	const request = new ZOHOCRMSDK.Record.BodyWrapper();
	const recordsArray = [];

	// Create a new record and add field values dynamically
	const record = new ZOHOCRMSDK.Record.Record();
	record.addKeyValue("id", BigIntRecordId); // Set the record ID to update the specific record

	// Loop through the provided data and update the fields
	for (let [key, value] of Object.entries(data)) {
		record.addFieldValue(ZOHOCRMSDK.Record.Field[moduleName][key], value);
	}

	await recordsArray.push(record);
	await request.setData(recordsArray);

	try {
		const headerInstance = new ZOHOCRMSDK.HeaderMap();
		const response = await recordOperations.updateRecord(
			BigIntRecordId,
			request,
			headerInstance
		);

		if (response != null) {
			const responseObject = response.getObject();

			if (responseObject instanceof ZOHOCRMSDK.Record.ActionWrapper) {
				const actionResponses = responseObject.getData();
				console.log("Response from update:", actionResponses);

				actionResponses.forEach((actionResponse) => {
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

				const result = actionResponses.map((actionResponse) => {
					if (actionResponse instanceof ZOHOCRMSDK.Record.SuccessResponse) {
						return actionResponse.getDetails();
					} else if (actionResponse instanceof ZOHOCRMSDK.Record.APIException) {
						return actionResponse.getDetails();
					}
					return null;
				});

				// Format the result for easier readability
				const formattedResult = result.map((details) => {
					if (details) {
						return {
							id: details.get("id"),
							createdTime: details.get("Created_Time"),
							modifiedTime: details.get("Modified_Time"),
							createdBy: details.get("Created_By")?.name,
							modifiedBy: details.get("Modified_By")?.name,
						};
					}
					return null;
				});

				return formattedResult;
			}
		} else {
			throw new Error("Failed to update record in Zoho CRM");
		}
	} catch (error) {
		console.error("Error during record update:", error);
		throw error;
	}
};

/* -----> Delete Record <----- */
const deleteRecordById = async (moduleName, recordId) => {
	if (!moduleName || typeof moduleName !== "string") {
		throw new Error("Invalid module name. Expected a non-empty string.");
	}

	if (!recordId || typeof recordId !== "string") {
		throw new Error("Invalid record ID provided.");
	}

	const BigIntRecordId = BigInt(recordId);

	console.log("Initializing Zoho SDK...");
	await initializeZoho(); // Initialize the Zoho SDK
	console.log("Zoho SDK Initialized.");

	const recordOperations = new ZOHOCRMSDK.Record.RecordOperations(moduleName);

	try {
		const response = await recordOperations.deleteRecord(BigIntRecordId);

		if (response != null) {
			const responseObject = response.getObject();

			if (responseObject instanceof ZOHOCRMSDK.Record.ActionWrapper) {
				const actionResponses = responseObject.getData();
				console.log("Response from delete:", actionResponses);

				// Process action responses and log details
				actionResponses.forEach((actionResponse) => {
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

				// Map the response to structured data
				const result = actionResponses.map((actionResponse) => {
					if (actionResponse instanceof ZOHOCRMSDK.Record.SuccessResponse) {
						return actionResponse.getDetails();
					} else if (actionResponse instanceof ZOHOCRMSDK.Record.APIException) {
						return actionResponse.getDetails();
					}
					return null;
				});

				// Format the result for easier readability
				const formattedResult = result.map((details) => {
					if (details) {
						return {
							id: details.get("id"),
						};
					}
					return null;
				});

				return formattedResult;
			}
		} else {
			throw new Error("Failed to delete record in Zoho CRM");
		}
	} catch (error) {
		console.error("Error during record deletion:", error);
		throw error;
	}
};

/* -----> Export Functions <----- */
export {
	getModuleRecords,
	getRecordById,
	createNewRecord,
	updateRecordById,
	deleteRecordById,
};
