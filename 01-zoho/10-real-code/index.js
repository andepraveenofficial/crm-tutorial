import express from 'express'
import Initializer  from './zoho/zoho.config.js';

const app = express()
const port = 5000;

app.use(express.json());

/* -----> zoho modules <----- */
import {GetModules} from './zoho/modules/index.js';
import { GetRecord, GetRecords, CreateRecord, UpdateRecord } from './zoho/records/index.js';

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
// 01 Get All Modules
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
// 01 Get All Records
app.get('/records', async (req, res) => {
  try {
    let moduleAPIName = "leads";
    const fieldNames = ["Last_Name", "First_Name", "Email"];
    const options = {pageNo:1, recordsPerPage:100};
    const result = await GetRecords.getRecords(moduleAPIName, fieldNames, options);
    console.log("Result from GetRecords:", result); 
     res.status(200).json(result);

   } catch (error) {
     res.status(500).json({ message: "Failed to fetch records", error: error.toString() });
   }
})

// 02 Get a Single Record
app.get('/records/:recordId', async (req, res) => {
  try {
    const moduleAPIName = "leads";
    const recordId = BigInt(req.params.recordId); 
    const fieldNames = ["Last_Name", "First_Name", "Email"];
    let destinationFolder = "./data";
    const result = await GetRecord.getRecord(moduleAPIName, recordId, fieldNames, destinationFolder);
    console.log("Result from GetRecords:", result); 
     res.status(200).json(result);

   } catch (error) {
     res.status(500).json({ message: "Failed to fetch a Single Record", error: error.toString() });
   }
})


// 02 Create a Single Record
app.post('/records', async (req, res) => {
  try {
    const  moduleAPIName = "Leads";
    const data = req.body;
   const result = await CreateRecord.createRecord(moduleAPIName, data);
     console.log("Result from GetRecords:", result); 
     res.status(200).json(result);

   } catch (error) {
     res.status(500).json({ message: "Failed to fetch a Single Record", error: error.toString() });
   }
})

// 03 Update a Single Record
app.put('/records/:recordId', async (req, res) => {
  try {
    const  moduleAPIName = "Leads";
    const recordId = BigInt(req.params.recordId); 
    const data = req.body;
   const result = await UpdateRecord.updateRecord(moduleAPIName, recordId, data);
     console.log("Result from GetRecords:", result); 
     res.status(200).json(result);

   } catch (error) {
     res.status(500).json({ message: "Failed to fetch a Single Record", error: error.toString() });
   }
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
     