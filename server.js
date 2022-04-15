const express = require('express')
const dotenv = require('dotenv')
const colors = require('colors')
const bootcamps = require('./routes/bootcamps')
const courses = require('./routes/courses')
const morgan = require('morgan')
const logger = require('./middleware/logger')
const errorHandler = require('./middleware/error')

const connectDB = require('./config/db')
// Load env var
dotenv.config({ path: __dirname + '/config/coinfig.env' })

connectDB()
const app = express()
// body-parse
app.use(express.json())

// Dev logging middleware
if (process.env.NODE_ENV == 'development') {
    app.use(morgan('dev'))
}
// Mount routers
app.use('/api/v1/bootcamps', bootcamps)
app.use('/api/v1/courses', courses)
app.use(errorHandler)

const PORT = process.env.PORT || 4999

const server = app.listen(
    PORT,
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold)
)

// Handle unhandled promise rejectons
process.on('unhandledRejection', (err, promise) => {
    console.log(`Error: ${err.message}`.red)
    // Close server & exit process
    server.close(() => process.exit(1))
})

// // Handle unhandled promise rejections
// process.on('unhandledRejection', (err, promise) => {
//     console.log(`Error: ${err.message}`.red);
//     // Close server & exit process
//     // server.close(() => process.exit(1));
// });