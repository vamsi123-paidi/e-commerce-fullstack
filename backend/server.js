require('dotenv').config();  
const express = require('express');
const app = express();
const cors = require('cors');
const connectDb = require('./config/db.js')
const cartRoute = require('./routes/cartRoute.js')

const port = process.env.PORT || 5000;

connectDb();
const userRoute = require('./routes/userRoute');

app.use(express.json())
app.use(cors())
app.use('/auth',userRoute)
app.use('/cart',cartRoute)

app.listen(port,()=>{
    console.log(`server running at ${port}`)
})