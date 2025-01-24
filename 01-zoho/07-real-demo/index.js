import express from "express"
import { getModuleData, getParticularRecord } from "./zoho/zoho.utils.js";


const app = express()
const port = 5000

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

