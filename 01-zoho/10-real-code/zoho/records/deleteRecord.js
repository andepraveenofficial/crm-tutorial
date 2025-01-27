import * as ZOHOCRMSDK from "@zohocrm/nodejs-sdk-7.0";
class DeleteRecord {

    static async deleteRecord(moduleAPIName, recordId) {
        //API Name of the module to delete record
        //let moduleAPIName = "module_api_name";
        //let recordId = 77002n;
        let recordOperations = new ZOHOCRMSDK.Record.RecordOperations(moduleAPIName);
        let paramInstance = new ZOHOCRMSDK.ParameterMap();
        //Possible parameters for Delete Record operation
        await paramInstance.add(ZOHOCRMSDK.Record.DeleteRecordParam.WF_TRIGGER, true);
        let headerInstance = new ZOHOCRMSDK.HeaderMap();
        // headerInstance.add(DeleteRecordHeader.X_EXTERNAL, "Leads.External");
        //Call deleteRecord method that takes recordId, ModuleAPIName, paramInstance and headerInstance as parameter.
        let response = await recordOperations.deleteRecord(recordId, paramInstance, headerInstance);
        if (response != null) {

                  // handle return response
             let result = {
                 statusCode: response.getStatusCode(),
                data: [],
            };

              console.log("Status Code: " + response.getStatusCode());
              let responseObject = response.getObject();
              if (responseObject != null) {
                  if (responseObject instanceof ZOHOCRMSDK.Record.ActionWrapper) {
                      let actionResponses = responseObject.getData();
                      actionResponses.forEach(actionResponse => {
                          if (actionResponse instanceof ZOHOCRMSDK.Record.SuccessResponse) {

                            let details = actionResponse.getDetails();
                            // handle respone
                            let responseData = {
                              status: actionResponse.getStatus().getValue(),
                              code: actionResponse.getCode().getValue(),
                              id: details.get("id"),
                              message: actionResponse.getMessage().getValue(),
                          };
  
                             result.data.push(responseData);

                            console.log("Status: " + actionResponse.getStatus().getValue());
                            console.log("Code: " + actionResponse.getCode().getValue());
                            console.log("Details");
                            // let details = actionResponse.getDetails();
                            if (details != null) {
                                Array.from(details.keys()).forEach(key => {
                                    console.log(key + ": " + details.get(key));
                                });
                            }
                            console.log("Message: " + actionResponse.getMessage().getValue());
                        }
                        else if (actionResponse instanceof ZOHOCRMSDK.Record.APIException) {
                          let details = actionResponse.getDetails();
                          
                          let errorData = {
                          status: actionResponse.getStatus().getValue(),
                          code: actionResponse.getCode().getValue(),
                          details: details ? Array.from(details.keys()).map(key => `${key}: ${details.get(key)}`) : null,
                          message: actionResponse.getMessage().getValue(),
                      };

                      result.data.push(errorData);

                            console.log("Status: " + actionResponse.getStatus().getValue());
                            console.log("Code: " + actionResponse.getCode().getValue());
                            console.log("Details");
                            // let details = actionResponse.getDetails();
                            if (details != null) {
                                Array.from(details.keys()).forEach(key => {
                                    console.log(key + ": " + details.get(key));
                                });
                            }
                            console.log("Message: " + actionResponse.getMessage().getValue());
                        }
                    });
                }
                else if (responseObject instanceof ZOHOCRMSDK.Record.APIException) {
                  let details = responseObject.getDetails();
                  
                  let errorData = {
                  status: responseObject.getStatus().getValue(),
                  code: responseObject.getCode().getValue(),
                  details: responseObject.getDetails() ? Array.from(responseObject.getDetails().keys()).map(key => `${key}: ${responseObject.getDetails().get(key)}`) : null,
                  message: responseObject.getMessage().getValue(),
              };
              result.data.push(errorData);

                    console.log("Status: " + responseObject.getStatus().getValue());
                    console.log("Code: " + responseObject.getCode().getValue());
                    console.log("Details");
                    // let details = responseObject.getDetails();
                    if (details != null) {
                        Array.from(details.keys()).forEach(key => {
                            console.log(key + ": " + details.get(key));
                        });
                    }
                    console.log("Message: " + responseObject.getMessage().getValue());
                }
            }
            return result; // Return the result data
        }
        else  {
          console.error("Error while creating records:", error);
          return { statusCode: 500, message: "Error while creating records", error: error.message };
      }
    }
}

export {DeleteRecord};