import express from "express";
import Initializer from "./config/zoho.js"; // Import Zoho SDK Initializer
import * as ZOHOCRMSDK from "@zohocrm/nodejs-sdk-7.0";

const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());

// Initialize Zoho SDK before using APIs
Initializer.initialize().then(() => {
  console.log("Zoho SDK Initialized!");
});

// ✅ **API 1: Get List of Leads**
app.get("/zoho/leads", async (req, res) => {
  try {
    let recordOperations = new ZOHOCRMSDK.Record.RecordOperations();
    let moduleName = "Leads";
    let response = await recordOperations.getRecords(moduleName, null); // Pass module name correctly

    if (response) {
      res.json(response);
    } else {
      res.status(500).json({ message: "Error fetching leads" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start Server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
