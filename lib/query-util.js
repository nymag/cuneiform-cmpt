const 
  BooleanQuery = require('./boolean-query'),
  _pick = require('lodash/pick'),
  _each = require('lodash/each'),
  _isEmpty = require('lodash/isEmpty'),
  descriptorTransforms = {
    includeTags: (booleanQuery, tags) => {
      booleanQuery
        .addClause('filter', 'bool', subquery => {
          tags.forEach(tag => subquery.addClause('should', 'term', 'tags', tag));
          return subquery;
        });
    },
    excludeTags: (booleanQuery, tags) => {
      tags.forEach(tag => booleanQuery.addClause('must_not', 'term', 'tags', tag));
    },
    includeContentChannels: (booleanQuery, contentChannels) => {
      booleanQuery
        .addClause('filter', 'bool', subquery => {
          contentChannels.forEach(channel => subquery.addClause('should', 'term', 'contentChannel', channel));
          return subquery;
        });
    },
    includeFeatureTypes: (booleanQuery, featureTypes) => {
      booleanQuery
        .addClause('filter', 'bool', subquery => {
          featureTypes.forEach(featureType => subquery.addClause('should', 'term', 'featureTypes.' + featureType, true));
          return subquery;
        });
    },
    excludeFeatureTypes: (booleanQuery, featureTypes) => {
      featureTypes.forEach(featureType => booleanQuery.addClause('must_not', 'term', 'featureTypes.' + featureType, true));
    },
    includeStoryCharacteristics: (booleanQuery, storyCharacteristics) => {
      storyCharacteristics.forEach(characteristic => booleanQuery.addClause('filter', 'term', 'storyCharacteristics.' + characteristic, true));
    },
    excludeStoryCharacteristics: (booleanQuery, storyCharacteristics) => {
      storyCharacteristics.forEach(characteristic => booleanQuery.addClause('must_not', 'term', 'storyCharacteristics.' + characteristic, true));
    },
    includeFeeds: (booleanQuery, feeds) => {
      feeds.forEach(feed => booleanQuery.addClause('filter', 'term', 'feeds.' + feed, true));
    },
    excludeFeeds: (booleanQuery, feeds) => {
      feeds.forEach(feed => booleanQuery.addClause('must_not', 'term', 'feeds.' + feed, true));
    },
    // site-level transforms -- these three combine in one SHOULD
    sitePrefixes: (booleanQuery, sitePrefixes) => {
      sitePrefixes.forEach(prefix => booleanQuery.addClause('should', 'prefix', 'canonicalUrl', prefix));
    },
    crossposts: (booleanQuery, crossposts) => {
      crossposts.forEach(siteSlug => booleanQuery.addClause('should', 'term', `crosspost.${siteSlug}`, true));
    },
    siteSlugs: (booleanQuery, siteSlugs) => {
      siteSlugs.forEach(siteSlug => booleanQuery.addClause('should', 'term', 'site', siteSlug));
    }
  },
  {
    ELASTIC_FIELDS,
    CONTENT_DESCRIPTORS
  } = require('./constants');


function buildQuery(data, locals) {
  const descriptors = _pick(data, CONTENT_DESCRIPTORS),
    booleanQuery = new BooleanQuery(),
    elasticQuery = {
      index: descriptors.elasticIndex,
      body: {
        size: data.limit || 1,
        _source: ELASTIC_FIELDS, // limit article properties returned
        sort: {date: 'desc'},
        query: {}
      },
    };

  // If an override URL is set, pin the component. Pinned components always get 
  // the Elastic results they seek, regardless of their scope
  data.cuneiformPinned = !!descriptors.overrideUrl;
  if (descriptors.overrideUrl) {
    elasticQuery.body.query = {term: {canonicalUrl: descriptors.overrideUrl}};
    return elasticQuery;
  }

  if (locals && locals.site) {
    descriptors.siteSlugs = [].concat(descriptors.siteSlugs, [locals.site.slug]);
  }

  // apply content descriptors
  _each(descriptors, (val, key) => {
    if (!_isEmpty(val) && descriptorTransforms[key]) {
      descriptorTransforms[key](booleanQuery, val);
    }
  });
  elasticQuery.body.query.bool = booleanQuery.build();

  return elasticQuery;
};

module.exports.buildQuery = buildQuery;
