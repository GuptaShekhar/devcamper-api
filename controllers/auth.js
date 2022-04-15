const asyncHandler = require('../middleware/async')
const User = require('../models/User')
const ErrorResponse = require('../utils/errorResponse')


exports.register = asyncHandler(async (req, res, next) => {
    const { name, email, password, role } = req.body;

    const user = await User.create({
        name, email, password, role
    })
    sendTokenResponse(user, 200, res)
})

exports.login = asyncHandler(async (req, res, next) => {
    const { email, password } = req.body;

    // Validate email and password
    if (!email || !password) {
        return next(
            new ErrorResponse('Please provide a email and password', 400)
        )
    }
    // Check for user
    const user = await User.findOne({ email }).select('+password')
    if (!user) {
        return next(
            new ErrorResponse('Invalid credentials', 400)
        )
    }
    // Check if password matches
    const isMatch = await user.matchPassword(password)
    if (!isMatch) {
        return next(
            new ErrorResponse('Invalid credentials', 400)
        )
    }
    sendTokenResponse(user, 200, res)
})

const sendTokenResponse = (user, statusCode, res) => {
    // create token
    const token = user.getSignedJwtToken()
    const options = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
        httpOnly: true
    }

    if (process.env.NODE_ENV === 'production') {
        options.secure = true
    }
    res
        .status(statusCode)
        .cookie('token', token, options)
        .json({
            success: true,
            token
        })
}

exports.getMe = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.user.id)
    res.status(200).json({
        success: true,
        data: user
    })
})