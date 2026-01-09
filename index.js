const express = require('express');
const bodyParser = require('body-parser');
const routes = require('./Routes/routes.js');
const cors = require("cors");

const app = express();
const PORT = 8080;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.json())
app.use(cors());

app.use("/", routes);

app.get('/', async (req, res) => {
  res.send('GST Details Get By GST Number API is running!');
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
