const express = require('express')
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
  console.log(`app listening on port ${port}`)
})

/* -----> Zoho <----- */