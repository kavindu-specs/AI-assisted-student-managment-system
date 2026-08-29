const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const env = require('./config/env');
const routes = require('./routes');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();

app.use(helmet());
app.use(cors({
  origin: env.clientOrigins.length > 0 ? env.clientOrigins : true,
  credentials: true,
}));
app.use(morgan(env.nodeEnv === 'development' ? 'dev' : 'combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Uploaded documents (NIC copies, certificates, photos) are personal data -
// they are NEVER served as static files. Access goes through authenticated,
// ownership-checked routes (see studentRoutes/adminRoutes "file" endpoints).
app.use('/api', routes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
