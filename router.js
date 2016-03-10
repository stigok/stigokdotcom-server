'use strict';

const express = require('express');
const router = new express.Router();
const tumblr = require('tumblr.js');
const settings = require('./settings.json');
const tumblrClient = tumblr.createClient(settings.tumblr);
const cache = require('memory-cache');
const cacheTimeout = 15 * 60 * 1000;
const helpers = require('./helpers');
const responseObject = helpers.jsonResponseObject;

// Angular app
router.use('/', express.static(settings.angularAppPath));

// API calls
router.use('/api/posts', (req, res) => {
  let key = 'test-key';
  let cached = cache.get(key);

  if (!cached) {
    // Add value stating that a fresh data request is pending
    cache.put(key, 'pending', 5000);

    // Get fresh data
    tumblrClient.posts('stigok.tumblr.com', {reblog_info: true, filter: 'raw'}, (err, resp) => { // eslint-disable-line camelcase
      if (err) {
        return console.error('api call error', err);
      }

      let data = resp.posts;
      console.log('Cache key %s updated with fresh data (%d items)', key, data.length);

      // Fill up the cache with the real data
      cache.put(key, data, cacheTimeout);
    });

    // Return empty array
    return res.json(responseObject('Data not ready...'));
  }

  // Return cache data
  return res.json(responseObject(null, cache.get(key)));
});

module.exports = router;
