import mongoose from 'mongoose'
import config from '../config'

const mongoUrl = `mongodb://${config.mongoUrl}`

const connect = async () => {
  await mongoose.connect(mongoUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true,
  })
}

export default { connect }
