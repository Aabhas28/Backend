const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');  

const placesRoutes = require('./routes/places-routes');
const usersRoutes = require('./routes/users-routes');
const HttpError = require('./models/http-error');

mongoose.set('strictQuery', true);

const app = express();

app.use(bodyParser.json())

app.use('/api/places',placesRoutes);
app.use('/api/users',usersRoutes);

app.use((req,res,next) => {
   const error = new HttpError('Could not find this route.',404)
   throw error;
})

app.use((error,req,res,next) => {
    if(req.headerSent){
        return next(error);
    }
    res.status(error.code || 500);
    res.json({message: error.message || 'An unknown error occurred!'})
})

const connectUrl = 'mongodb+srv://Please:Please@cluster0.0gakn8r.mongodb.net/places?retryWrites=true&w=majority';
 
const connectConfig = { 
  useNewUrlParser: true, 
  useUnifiedTopology: true 
//   useCreateIndex: true 
}

mongoose
.connect(connectUrl,connectConfig)
.then(() => {
    console.log('+++ Database connected! +++');
    app.listen(5000);
})
.catch(err => {
    console.log(err);
}); 
