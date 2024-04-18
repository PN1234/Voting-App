const express = require('express');
const bodyparser = require('body-parser');
const app = express();
require('dotenv').config();
app.use(bodyparser.json());
const db = require('./db');
const userRoutes = require('./routes/userRoutes');
const candidateRoutes = require('./routes/candidateRoutes');
const PORT = process.env.PORT || 3000;

app.use('/user',userRoutes);

app.use('/candidate',candidateRoutes);




app.listen(PORT,function() {
   console.log("Server Started...listening on port 3000...");
})