const express = require('express')
const dotenv = require('dotenv')

dotenv.config({ path: './config/config.env' })

const app = express()

const PORT = process.env.PORT || 4999

app.listen(
    PORT,
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
)