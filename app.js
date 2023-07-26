const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const productRoutes = require('./routes/products-routes');
const userRoutes = require('./routes/users-routes');
const contactRoutes = require('./routes/contact-routes');

const app = express();
const cors = require('cors');

app.use(bodyParser.json());

app.use('/uploads/images', express.static(path.join('uploads', 'images')));
