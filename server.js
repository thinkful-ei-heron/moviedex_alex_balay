require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const store = require('./store.js');
const helmet = require('helmet');

const app = express();

app.use(morgan('common'));
app.use(helmet());
app.use(cors());
app.use(validateBearer);

const API_SECRET = process.env.API_SECRET;

function validateBearer(req, res, next) {
  const authVal = req.get('Authorization') || '';
  if(!authVal.startsWith('Bearer ')) {
    return res.status(400).json({ error: 'Authorization token not found'});
  }

  const token = authVal.split(' ')[1];
  if (token !== API_SECRET) {
    return res.status(401).json({ error: 'Token is invalid'});
  }
  next();
}

app.get('/movie', (req, res) => {
  let filtered = [...store];
  let genre = req.query.genre;
  let country = req.query.country;
  let avgScore = parseInt(req.query.avg_vote);

  if(genre) {
    filtered = filtered.filter(movie => movie.genre.toLowerCase().includes(genre.toLowerCase()));
  }
  if(country) {
    filtered = filtered.filter(movie => movie.country.toLowerCase().includes(country.toLowerCase()));
  }
  if(avgScore) {
    filtered = filtered.filter(movie => movie.avg_vote >= avgScore );
  }

  res.json(filtered);
});

const PORT = 8000;

app.listen(PORT, () => {
  console.log(`listening on ${PORT}`);
});