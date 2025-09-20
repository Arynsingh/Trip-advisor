const express = require("express");
const cors = require("cors");


const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("✅ TripDavisor backend is running!");
});

const PORT = 3000;
app.listen(PORT, () => console.log(`🚀 Backend running at http://localhost:${PORT}`));
