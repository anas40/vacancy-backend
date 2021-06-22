const express = require("express")
const aws = require('aws-sdk')
const cors = require("cors")
const multer = require('multer')
const fs = require('fs')
const Path = require("path")


const app = express()

const MAX_SIZE = 1000*1000
require('dotenv').config()
const upload = multer({
    limits: {fileSize:MAX_SIZE},
    fileFilter(req,file,cb){
        let extension = Path.extname(file.originalname)
        if(extension==='.pdf'|| extension==='.docx') return cb(null,true)
        return cb(null,false)
    }
})
const PORT = process.env.PORT || 3000
let bucketName = process.env.BUCKET_NAME


aws.config.credentials = new aws.SharedIniFileCredentials();;
aws.config.update({ region: 'ap-south-1' });


app.use(cors())


app.post('/upload', upload.single('resume'), function (req, res) {
    if (!req.file) {
        return res.status(400).send('No files were uploaded.');
    }
    console.log(req.file);
    const { originalname, buffer } = req.file
    const fileName = Date.now() + "-" + originalname

    uploadFile(fileName, buffer)
    res.send()
});


function uploadFile(fileName, data) {
    const objectParams = { Bucket: bucketName, Key: fileName, Body: data };
    const uploadPromise = new aws.S3({ apiVersion: '2006-03-01' }).putObject(objectParams).promise();
    uploadPromise
        .then(data => {
            console.log("Successfully uploaded data to " + bucketName + "/" + fileName, data)
        })
        .catch(er => {
            console.log("Error in uploading saving to local file system, Error: ", er)
            const path = Path.join(__dirname, "resume", fileName)
            fs.writeFile(path, data, () => {
                console.log("File saved")
            })
        })
}


app.listen(PORT, () => {
    console.log(`Listening on ${PORT}`);
})

