const asyncHandler = require('../middleware/async')
const Course = require('../models/Course')
const Bootcamp = require('../models/Bootcamp')
const ErrorResponse = require('../utils/errorResponse')

// @desc      Get all Courses
// @route     GET /api/v1/courses
// @access    Public
exports.getCourses = asyncHandler(async (req, res, next) => {
    if (req.params.bootcampId) {
        const courses = Course.find({ bootcamp: req.params.bootcampId })
        res.status(200).json({
            success: true,
            count: courses.length,
            data: courses
        })
    } else {
        res.status(200).json(res.advancedResults)
    }
})

// @desc      Get  Course
// @route     GET /api/v1/courses/:courseId
// @access    Public
exports.getCourse = asyncHandler(async (req, res, next) => {
    const course = await Course.findById(req.params.courseId).populate({
        path: 'bootcamp',
        select: 'name description '
    })
    if (!course) {
        return next(
            new ErrorResponse(`No course with id of ${req.params.courseId}`),
            404
        )
    }
    res.status(200).json({
        success: true,
        data: course
    })
})

// @desc      add Course
// @route     POST /api/v1/courses
// @access    Private
exports.addCourse = asyncHandler(async (req, res, next) => {
    req.body.bootcamp = req.params.bootcampId
    const bootcamp = await Bootcamp.findById(req.params.bootcampId)
    if (!bootcamp) {
        return next(
            new ErrorResponse(`No bootcamp with id of ${req.params.bootcampId}`),
            404
        )
    }
    const course = await Course.create(req.body)

    res.status(200).json({
        success: true,
        data: course
    })
})

// @desc      Update Course
// @route     PUT /api/v1/courses/:courseId
// @access    Private
exports.updateCourse = asyncHandler(async (req, res, next) => {
    const course = await Course.findById(req.params.courseId)
    if (!course) {
        return next(
            new ErrorResponse(`No course with id of ${req.params.courseId}`),
            404
        )
    }
    const updatedCourse = await Course.findByIdAndUpdate(req.params.courseId, req.body, {
        new: true.valueOf,
        runValidators: true
    })

    res.status(200).json({
        success: true,
        data: updatedCourse
    })
})

// @desc      Delete Course
// @route     DELETE /api/v1/courses/:courseId
// @access    Private
exports.deleteCourse = asyncHandler(async (req, res, next) => {
    const course = await Course.findById(req.params.courseId)
    if (!course) {
        return next(
            new ErrorResponse(`No course with id of ${req.params.courseId}`),
            404
        )
    }
    await course.remove()

    res.status(200).json({
        success: true,
        data: course
    })
})