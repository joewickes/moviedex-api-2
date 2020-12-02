require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const { NODE_ENV } = require('./config')
const MOVIEDEX = require('../moviedex.json');

const app = express();

const morganOption = (NODE_ENV === 'production')
  ? 'tiny'
  : 'common';

app.use(morgan(morganOption));
app.use(helmet());
app.use(cors());

app.get('/', (req, res) => {
  return res.send('Hello, boilerplate!');
});

// Validate Bearer Token Function
function validateBearerToken(req, res, next) {
  const myToken = process.env.API_TOKEN;
  const authToken = req.get('Authorization');

  // If the string doesn't start with 'Bearer'
  if (!authToken.startsWith('Bearer ')) {
    // Give an error response with error message
    return res.status(400).json({ error: 'Invalid request' });
  }

  // If there is no authorization token OR if the token doesn't match
  if (!authToken || authToken.split(' ')[1] !== myToken) {
    // Give an error response with error message
    return res.status(401).json({ error: 'Unauthorized request' });
  }

  // If the tokens match, continue on
  next();
}

// Add validateBearerToken to global middleware chain
app.use(validateBearerToken);

// Handle getting movies
function handleGetMovies(req, res) {
  console.log('handling getting movies')
  let results = [...MOVIEDEX];

  if (req.query.length === 0) {
    return res.json(results);
  }

  for (const key in req.query) {
    if (key === 'genre') {
      const genre = req.query.genre.toLowerCase();
      results = results.filter(movie => movie.genre.toLowerCase().includes(genre));
      continue;
    }
  
    if (key === 'country') {
      const country = req.query.country.toLowerCase();
      results = results.filter(movie => movie.country.toLowerCase().includes(country));
      continue;
    }
  
    if (key === 'avg_vote') {
      const avg_vote = parseFloat(req.query.avg_vote);
      results  = results.filter(movie => movie.avg_vote >= avg_vote);
      continue;
    }
  }

  return res.send(results);
}

// Set endpoint to /movie
app.get('/movie', handleGetMovies);

app.use(function errorHandler(error, req, res, next) {
  let response
  if (NODE_ENV === 'production') {
    response = { error: { message: 'server error' } }
  } else {
    console.error(error)
    response = { message: error.message, error }
  }
  res.status(500).json(response)
})

module.exports = app;