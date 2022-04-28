const path = require('path')
const express = require('express')
const dotenv = require('dotenv')
const colors = require('colors')
const cookieParser = require('cookie-parser')
const helmet = require('helmet')
const xss = require('xss-clean')
const rateLimit = require('express-rate-limit')
const hpp = require('hpp')
const cors = require('cors')
const mongoSanitize = require('express-mongo-sanitize')
const bootcamps = require('./routes/bootcamps')
const courses = require('./routes/courses')
const auth = require('./routes/auth')
const users = require('./routes/users')
const reviews = require('./routes/reviews')
const fileupload = require('express-fileupload')
const morgan = require('morgan')
const logger = require('./middleware/logger')
const errorHandler = require('./middleware/error')

const connectDB = require('./config/db')
// Load env var
dotenv.config({ path: __dirname + '/config/config.env' })

connectDB()
const app = express()
// Body  parser
app.use(express.json())
// Cookies parser
app.use(cookieParser())

// Dev logging middleware
if (process.env.NODE_ENV == 'development') {
    app.use(morgan('dev'))
}
app.use(fileupload())

// sanitize data
app.use(mongoSanitize())

// Set security header
app.use(helmet())

// Prevent xss attack
app.use(xss())

// Rate limiter
const limiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 mins
    max: 100
})
app.use(limiter)

// Prevent hpp param pollution
app.use(hpp())

// Enable cors
app.use(cors())

// set static folder
app.use(express.static(path.join(__dirname, 'public')))

// Mount routers
app.use('/api/v1/bootcamps', bootcamps)
app.use('/api/v1/courses', courses)
app.use('/api/v1/auth', auth)
app.use('/api/v1/users', users)
app.use('/api/v1/reviews', reviews)
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