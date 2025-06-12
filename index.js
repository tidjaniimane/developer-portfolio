// server.js

const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static('public')); // Serve static files from "public" folder

app.get('/', (req, res) => {
  res.send('Hello from Developer Portfolio!');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
