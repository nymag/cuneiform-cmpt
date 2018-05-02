/**
 * Describes logic common to Cuneiform components, which
 * call the save and render functions described
 * here and may perform additional tasks within their own.
 */
'use strict';

const _includes = require('lodash/includes'),
  urlParse = require('url-parse'), // smaller than native url lib
  buildQuery = require('./lib/build-query');

/**
 * In edit mode, convert array content descriptors from simple lists
 * (e.g. [{text: 'foo'}, {text: 'bar'}]) to flat arrays of strings
 * (['foo', 'bar']) before saving so the microservice understands
 * them. Set botIgnore if the component is disabled to prevent
 * the microservice from manipulating it. Convert https override URLs
 * to http.
 * @param {string} ref
 * @param {object} data
 * @param {object} locals
 * @returns {object}
 */
function save(ref, data, locals) {
  if (locals && locals.edit) {
    ARRAY_CONTENT_DESCRIPTORS.forEach(key => {
      if (Array.isArray(data[key])) {
        data[key] = data[key].map(val => val.text)
          .filter(val => !!val);
      }
    });
  }

  data.cuneiformIgnore = data.disabled || data.botIgnore;

  // convert overrideUrls to HTTP because canonicalUrls are stored
  // as HTTP in Elastic
  if (data.overrideUrl) {
    const url = urlParse(data.overrideUrl);

    url.set('protocol', 'http:');
    data.overrideUrl = url.toString();
  }
  data.cuneiformQuery = buildQuery(data, locals);
  data.cuneiformScopes = data.dedupeContexts;
  return data;
}

/**
 * In edit mode, render array content descriptors
 * as simple lists (e.g. [{text: 'foo'}, {text: 'bar'}])
 * so they can be edited.
 * @param {string} ref
 * @param {object} data
 * @param {object} locals
 * @returns {object}
 */
function render(ref, data, locals) {
  if (locals && locals.edit) {
    ARRAY_CONTENT_DESCRIPTORS.forEach(key => {
      if (Array.isArray(data[key])) {
        data[key] = data[key].map(text => ({text}));
      }
    });
  }
  return data;
}

/**
 * Returns the callout for the specified article
 * based on its tags.
 * @param {object} articleData As passed from the microservice
 * @returns {string}
 */
function getCallout(articleData) {
  if (articleData) {
    if (_includes(articleData.tags, 'video') || _includes(articleData.tags, 'original video')) {
      return 'video';
    } else if (_includes(articleData.tags, 'gallery')) {
      return 'gallery';
    }
  }
  return '';
}


module.exports.save = save;
module.exports.render = render;
module.exports.getCallout = getCallout;
