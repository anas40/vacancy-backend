const mongoose = require('mongoose')

//devDependencies are modules which are only required at the time of development......
mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useCreateIndex: true,   //creates unique indices for documents...
    useUnifiedTopology: true,
    useFindAndModify: false
})