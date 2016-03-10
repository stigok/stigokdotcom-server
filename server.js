'use strict';

const express = require('express');
const helmet = require('helmet');
const router = require('./router.js');
const helpers = require('./helpers');
const responseObject = helpers.jsonResponseObject;

const app = express();

app.use(helmet());
app.use(router);

app.use(function (err, req, res, next) { // eslint-disable-line no-unused-vars
  console.error('Request error', err);

  if (!err) {
    err = new Error();
    err.status = 404;
    err.message = 'Not found';
  }

  res
    .status(err.status || 404)
    .json(responseObject(err));
});

module.exports = app;
