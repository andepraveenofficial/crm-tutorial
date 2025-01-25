import express from "express"
import { getModuleData, getParticularRecord, createRecord } from "./zoho/zoho.utils.js";


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
    const leads = await getModuleData("Leads", "Last_Name,First_Name,Email");
    res.status(200).json(leads);
  } catch (error) {
    console.error("Leads Fetch Error:", error);
    res.status(500).json({ message: "Failed to fetch leads", error: error.toString() });
  }
})

app.get("/leads/:id", async (req, res) => {
  try {
    const lead = await getParticularRecord("Leads", req.params.id, "Last_Name,First_Name,Email");

    res.status(200).json(lead);
  } catch (error) {
    console.error("lead Fetch Error:", error);
    res.status(500).json({ message: "Failed to fetch lead", error: error.toString() });
  }
})


// Create a new lead
app.post("/leads", async (req, res) => {
  console.log("Create Lead");
  try {
    const leadData = req.body; // Field-value pairs for the lead in the request body
    if (!leadData || typeof leadData !== "object") {
      return res.status(400).json({ message: "Invalid lead data provided" });
    }

    const response = await createRecord("Leads",leadData);
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
