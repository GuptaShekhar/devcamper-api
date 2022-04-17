const asyncHandler = require('../middleware/async')
const path = require('path')
const Bootcamp = require('../models/Bootcamp')
const ErrorResponse = require('../utils/errorResponse')
const geocoder = require('../utils/geocoder')

// @desc      Get all bootcamps
// @route     GET /api/v1/bootcamps
// @access    Public
exports.getBootcamps = asyncHandler(async (req, res, next) => {
    res.status(200).json(res.advancedResults)
})

// @desc      Get bootcamp with id 
// @route     GET /api/v1/bootcamps/:id
// @access    Public
exports.getBootcamp = asyncHandler(async (req, res, next) => {
    const bootcamp = await Bootcamp.findById(req.params.id)
    if (!bootcamp) {
        next(error)
    }
    res.status(200).json({ success: true, data: bootcamp })
})

// @desc      Create bootcamp
// @route     POST /api/v1/bootcamps
// @access    Public
exports.createBootcamp = asyncHandler(async (req, res, next) => {
    // Add user to req,body
    req.body.user = req.user.id

    // Check for published bootcamp
    const publishedBootcamp = await Bootcamp.findOne({ user: req.user.id })

    // If the user is not an admin, they can only add one bootcamp
    if (publishedBootcamp && req.user.role !== 'admin') {
        return next(
            new ErrorResponse(
                `The user with ID ${req.user.id} has already published a bootcamp`,
                400
            )
        )
    }
    const bootcamp = await Bootcamp.create(req.body)
    res.status(200).json({ success: true, data: bootcamp })
})

// @desc      Update bootcamp with id
// @route     PATCH /api/v1/bootcamps/:id
// @access    Public
exports.updateBootcamp = asyncHandler(async (req, res, next) => {
    let bootcamp = await Bootcamp.findById(req.params.id)

    if (!bootcamp) {
        return next(
            new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404)
        );
    }

    // Make sure user is bootcamp owner
    if (bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(
            new ErrorResponse(
                `User ${req.user.id} is not authorized to update this bootcamp`,
                401
            )
        )
    }

    bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    })

    res.status(200).json({ success: true, data: bootcamp })

})

// @desc      Delete bootcamp with id
// @route     DELETE /api/v1/bootcamps/:id
// @access    Public
exports.deleteBootcamp = asyncHandler(async (req, res, next) => {
    const bootcamp = await Bootcamp.findById(req.params.id)
    if (!bootcamp) {
        res.status(400).json({ success: false })
    }

    // Make sure user is bootcamp owner
    if (bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(
            new ErrorResponse(
                `User ${req.user.id} is not authorized to update this bootcamp`,
                401
            )
        )
    }
    bootcamp.remove()
    res.status(200).json({ success: true, data: bootcamp })
})


// @desc      Get bootcamps within a radius
// @route     GET /api/v1/bootcamps/radius/:zipcode/:distance
// @access    Private
exports.getBootcampsInRadius = asyncHandler(async (req, res, next) => {
    const { zipcode, distance } = req.params

    // Get lat/lng from geocoder
    const loc = await geocoder.geocode(zipcode)
    const lat = loc[0].latitude
    const lng = loc[0].longitude

    // Calc radius using radians
    // Divide dist by radius of Earth
    // Earth Radius = 3,963 mi / 6,378 km
    const radius = distance / 3963

    const bootcamps = await Bootcamp.find({
        location: { $geoWithin: { $centerSphere: [[lng, lat], radius] } }
    })
    res.status(200).json({
        success: true,
        count: bootcamps.length,
        data: bootcamps
    })
})

// @desc     Upload photo for bootcamp
// @route     GET /api/v1/bootcamps/:bootcampId/photo
// @access    Private
exports.bootcampPhotoUpload = asyncHandler(async (req, res, next) => {
    const bootcamp = await Bootcamp.findById(req.params.id)
    if (!bootcamp) {
        return next(
            new ErrorResponse(`No bootcamp with id of ${req.params.id}`),
            404
        )
    }
    // Make sure user is bootcamp owner
    if (bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(
            new ErrorResponse(
                `User ${req.user.id} is not authorized to update this bootcamp`,
                401
            )
        )
    }

    if (!req.files) {
        return next(
            new ErrorResponse(`Please upload a file`),
            400
        )
    }
    const file = req.files.file
    // Make sure the image is photo
    if (!file.mimetype.startsWith('image')) {
        return next(
            new ErrorResponse(`Please upload an image file`),
            400
        )
    }

    // Check Filesize 
    if (!file.size > process.env.MAX_FILE_UPLOAD) {
        return next(
            new ErrorResponse(`Please upload an image lext than ${process.env.MAX_FILE_UPLOAD}`),
            400
        )
    }

    // create custom filename
    file.name = `photo_${bootcamp._id}${path.parse(file.name).ext}`
    file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async err => {
        if (err) {
            console.error(err)
            return next(
                new ErrorResponse(`Problem with file upload`),
                400
            )
        }
        await Bootcamp.findByIdAndUpdate(req.params.id, { photo: file.name })

        res.status(200).json({
            success: true,
            data: file.name
        })
    })
})