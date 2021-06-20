const express = require("express")
const app = express()
const cors = require("cors")
const multer = require('multer')
const fs = require('fs')
const Path = require("path")
const PORT = process.env.PORT || 3000

const upload = multer()
app.use(cors())

app.post('/upload', upload.any(), function (req, res) {
    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).send('No files were uploaded.');
    }
    const { originalname, buffer } = req.files[0]
    const fileName = Date.now() + "-" + originalname
    const path = Path.join(__dirname, "resume", fileName)
    fs.writeFile(path, buffer)
    res.send()
});

app.listen(PORT, () => {
    console.log(`Listening on ${PORT}`);
})

