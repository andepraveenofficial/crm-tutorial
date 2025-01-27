import express from 'express'
import Initializer  from './zoho/zoho.config.js';

const app = express()
const port = 5000;

/* -----> zoho modules <----- */
import {GetModules} from './zoho/modules/index.js';
import { GetRecords } from './zoho/records/index.js';

/**
 * Global Zoho SDK Initialization
 */
(async () => {
  try {
    console.log("Initializing Zoho SDK...");
    await Initializer.initialize(); // Initialize once at app startup
    console.log("Zoho SDK initialized successfully.");
  } catch (error) {
    console.error("Failed to initialize Zoho SDK:", error);
    process.exit(1); // Exit the app if initialization fails
  }
})();

app.get('/health', (req, res) => {
  res.status(200).send(    
    {
    status: 'OK',
    timestamp: new Date(),
    uptime: process.uptime()
    }
  );
})


/* -----> Modules <----- */
app.get('/modules', async (req, res) => {
  try {
   const result = await GetModules.getModules();
   console.log("Result from GetModules:", result); 
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch modules", error: error.toString() });
  }
})

/* -----> Records <----- */
app.get('/records', async (req, res) => {
  try {
    let moduleAPIName = "leads";
    const options = {pageNo:1, recordsPerPage:100};
    const fieldNames = ["Last_Name", "First_Name", "Email"];
    const result = await GetRecords.getRecords(moduleAPIName, fieldNames, options);
    console.log("Result from GetRecords:", result); 
     res.status(200).json(result);

   } catch (error) {
     res.status(500).json({ message: "Failed to fetch records", error: error.toString() });
   }
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
     