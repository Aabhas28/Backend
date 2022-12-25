const { v4: uuidv4 } = require('uuid');
const { validationResult } = require('express-validator');

const HttpError = require('../models/http-error'); 
const getCoordsForAddress = require('../util/location');
const Place = require('../models/place')

let DUMMY_PLACES = [
    {
      id: 'p1',
      title: 'Empire State Building',
      description: 'One of the most famous sky scrapers in the world!',
      location: {
        lat: 40.7484474,
        lng: -73.9871516
      },
      address: '20 W 34th St, New York, NY 10001',
      creator: 'u1'
    }
  ]; 

const getPlaceById = (req, res, next) => {
    const placeId = req.params.pid;
    const place = DUMMY_PLACES.find(p => p.id === placeId);

   if(!place){
    throw  new HttpError('Could not find a places for the provided id.',404);
   }
   res.json({place});
 }

 const getPlacesUserById = (req,res, next) => {
    const userId = req.params.uid;
    const places = DUMMY_PLACES.filter(p => p.creator  === userId);
    if(!places || places.length === 0){
     return next (new HttpError('Could not find places for the provided user id. ',404));
     }
    res.json({places});
   }

   const createPlace = async (req,res,next) => {
   const errors =  validationResult(req);

   if(!errors.isEmpty()){
   return next(new HttpError('Invalid inputs passed, please check your data.',422));
   }

   const { title, description,address, creator} = req.body;
   
    let coordinates;
   try {
 coordinates = await getCoordsForAddress(address);
}catch(error){
  next(error);
}

const createdPlace = new Place({
  title,
  description,
  address,
  location: coordinates,
  image: 'https://imgs.search.brave.com/03mA25Na23cC3586ZfDSqeq8mvARiXYfrAZOhOP5SCU/rs:fit:1200:1200:1/g:ce/aHR0cHM6Ly9jZG4u/aGlzdG9yeS5jb20v/c2l0ZXMvMi8yMDE2/LzA0L0dldHR5SW1h/Z2VzLTU1NTE3MzYw/Ny5qcGc',
  creator
});

try {
  await createdPlace.save();
} catch (err) {
  const error = new HttpError(
    'Creating place failed, please try again.',
    500
  );
  return next(error);
}
   res.status(201).json({place: createdPlace})
   };

   const updatePlace = (req ,res, next) => {
    const errors =  validationResult(req);

   if(!errors.isEmpty()){
    throw new HttpError('Invalid inputs passed, please check your data.',422)
   }
    const { title, description} = req.body;
    const placeId = req.params.pid;

    const updatePlace = {...DUMMY_PLACES.find(p => p.id === placeId)};
    const placeIndex = DUMMY_PLACES.findIndex(p => p.id === placeId);
    updatePlace.title = title;
    updatePlace.description = description;

    DUMMY_PLACES[placeIndex] = updatePlace;

    res.status(200).json({place: updatePlace});
   };

   const deletePlace = (req ,res, next) => {
    const placeId = req.params.pid;
    if(!DUMMY_PLACES.find(p => p.id === placeId)){
        throw new Error('Could not fin a place for that id',404)
    }
   DUMMY_PLACES = DUMMY_PLACES.filter(p => p.id !== placeId);
   res.status(200).json({message: 'Place Deleted.'})

   };

   exports.getPlaceById = getPlaceById;
   exports.getPlacesUserById = getPlacesUserById;
   exports.createPlace = createPlace; 
   exports.updatePlace = updatePlace;
   exports.deletePlace = deletePlace;