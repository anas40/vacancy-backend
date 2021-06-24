const express = require("express")
const aws = require('aws-sdk')
const cors = require("cors")
const multer = require('multer')
const fs = require('fs')
const Path = require("path")


const MAX_SIZE = 1000 * 1000


const app = express()


require('dotenv').config()
require('./db')


const Detail = require('./models/detail')


const upload = multer({
    limits: { fileSize: MAX_SIZE },
    fileFilter(req, file, cb) {
        let extension = Path.extname(file.originalname)
        if (extension === '.pdf' || extension === '.docx') return cb(null, true)
        return cb(null, false)
    }
})


const PORT = process.env.PORT || 3000


aws.config.credentials = new aws.SharedIniFileCredentials();;
aws.config.update({ region: 'ap-south-1' });


app.use(cors())


app.post('/upload', upload.single('resume'), function (req, res) {
    if (!req.file) res.status(400).send('No files were uploaded.');

    const { originalname, buffer } = req.file
    if (!originalname || !buffer) res.status(400).send("No file name or No file")

    const fileName = getFileName(originalname)

    uploadFile(process.env.BUCKET_ONLY_RESUME, fileName, buffer)

    res.send()
});


app.post('/upload-full', upload.single('resume'), function (req, res) {
    if (!req.file) res.status(400).send('No file attached')

    const { originalname, buffer } = req.file
    if (!originalname || !buffer) res.status(400).send("No file name or No file")

    const { fullname, email, contact } = req.body
    // console.log(fullname,email,contact)
    if (!fullname || !email || !contact) res.status(400).send("Details not complete")

    Detail.findOne({ email }).then((data) => {
        if (data !== null) throw new Error()

        const fileName = getFileName(originalname)

        const bucketName = process.env.BUCKET_FULL_RESUME

        uploadFile(bucketName, fileName, buffer).then(path => {
            let newDetail = new Detail({ email, fullname, contact, resume: path });
            newDetail.save().then(() => {
                res.send()
            }).catch(error => {
                console.log(error)
                res.status(400).send("Some problem with file saving, try again in a minute")
            })
        }).catch(error => {
            console.log("Validation failed from mongoose")
            res.status(400).send("Provide valid data")
        })
    }).catch(error => {
        res.status(400).send("account already exist")
    })
})

function getFileName(name) {
    return Date.now() + "-" + name
}

function uploadFile(bucketName, fileName, data) {
    return new Promise((resolve, reject) => {
        const objectParams = { Bucket: bucketName, Key: fileName, Body: data };
        const uploadPromise = new aws.S3({ apiVersion: '2006-03-01' }).putObject(objectParams).promise();
        uploadPromise
            .then(data => {
                console.log("Successfully uploaded data to " + bucketName + "/" + fileName, data)
                resolve(`https://${bucketName}.s3.ap-south-1.amazonaws.com/${fileName}`)
            })
            .catch(er => {
                console.log("Error in uploading saving to local file system, Error: ", er)
                const path = Path.join(__dirname, "resume", fileName)
                fs.writeFile(path, data, () => {
                    console.log("File saved")
                })
                resolve(`resume/${fileName}`)
            })
    })
}


app.listen(PORT, () => {
    console.log(`Listening on ${PORT}`);
})

