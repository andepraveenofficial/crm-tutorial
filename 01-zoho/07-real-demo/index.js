import express from "express"
import { getModuleRecords, getRecordById, createNewRecord, updateRecordById, deleteRecordById } from "./zoho/zoho.utils.js";


const app = express()
const port = 5000

app.use(express.json())

app.get('/health', (req, res) => {
  res.status(200).send(    
    {
    status: 'OK',
    timestamp: new Date(),
    uptime: process.uptime()
    }
  );
})


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

/* -----> ZOHO <----- */

// Leads Module
app.get("/leads", async (req, res) => {
  try {
    const options =  {page : 1, perPage : 10, fields : ["First_Name","Last_Name","Email"], approved : "both"}
    const leads = await getModuleRecords("Leads", options);
    res.status(200).json(leads);
  } catch (error) {
    console.error("Leads Fetch Error:", error);
    res.status(500).json({ message: "Failed to fetch leads", error: error.toString() });
  }
})

app.get("/leads/:id", async (req, res) => {
  try {
    const fields = ["First_Name","Last_Name","Email"]
    const lead = await getRecordById("Leads", req.params.id, fields);

    res.status(200).json(lead);
  } catch (error) {
    console.error("lead Fetch Error:", error);
    res.status(500).json({ message: "Failed to fetch lead", error: error.toString() });
  }
})


// Create a new lead
app.post("/leads", async (req, res) => {
  try {
    const leadData = req.body;
    if (!leadData || typeof leadData !== "object") {
      return res.status(400).json({ message: "Invalid lead data provided" });
    }

    const response = await createNewRecord("Leads",leadData);
    console.log(response);

     res.status(201).json({
      message: "Lead created successfully",
      details: response
    });

  } catch (error) {
    console.error("Lead Creation Error:", error);
    res.status(500).json({ message: "Failed to create lead", error: error.toString() });
  }
});


// Update a  lead
app.put("/leads/:id", async (req, res) => {
  try {
    const leadData = req.body;
    if (!leadData || typeof leadData !== "object") {
      return res.status(400).json({ message: "Invalid lead data provided" });
    }

    const response = await updateRecordById("Leads",req.params.id,leadData);
    console.log(response);

     res.status(201).json({
      message: "Lead updated successfully",
      details: response
    });
    
  } catch (error) {
    console.error("Lead Update Error:", error);
    res.status(500).json({ message: "Failed to update lead", error: error.toString() });
  }
});

// Delete Record
app.delete("/leads/:id", async (req, res) => {
  try {
    const response = await deleteRecordById("Leads",req.params.id);
    console.log(response);

     res.status(201).json({
      message: "Lead deleted successfully",
      details: response
    });
    
  } catch (error) {
    console.error("Lead Deletion Error:", error);
    res.status(500).json({ message: "Failed to delete lead", error: error.toString() });
  }
});