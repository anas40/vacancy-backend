const mongoose = require('mongoose')
const { isEmail } = require('validator')

const detailSchema = new mongoose.Schema({
    fullname: {
        type: String,
        trim: true,
        required: [true, 'fullname is required'],
        maxLenght: 500
    },
    contact: {
        type: String,
        trim: true,
        required: [true, 'contact is required'],
        length: 10
    },
    email: {
        unique:true,
        type: String,
        trim: true,
        required: [true, 'email is required'],
        validate: [isEmail, 'Email is not valid'],
        maxLength: 500
    },
    resume: {
        type: String,
        trim: true,
        required: [true, 'resume is required']
    }
})

const Detail = mongoose.model('Detail', detailSchema)

module.exports = Detail