'use strict';
const expect = require('chai').expect,
  filename = __filename.split('/').pop().split('.').shift(),
  lib = require('./' + filename),
  constants = require('./constants');

describe(filename, function () {

  describe('buildQuery', function () {
    const fn = lib[this.title];

    it ('overrideUrl finds article with canonicalUrl', function () {
      expect(fn({overrideUrl: 'http://www.foo.com'}).body.query).to.eql({
        term: {canonicalUrl: 'http://www.foo.com'}
      });
    });

    it ('limits fields to ELASTIC_FIELDS', function () {
      expect(fn({}).body._source).to.eql(constants.ELASTIC_FIELDS);
    });

    it ('no other content descriptors have an effect if overrideUrl is set', function () {
      const descriptors = {
          overrideUrl: 'http://www.foo.com',
          includeTags: ['a','b'],
          excludeTags: ['a','b'],
          includeFeatureTypes: ['a'],
          includeContentChannels: ['a','b'],
          includeStoryCharacteristics: ['a'],
          excludeStoryCharacteristics: ['a'],
          sitePrefixes: ['www.thecut.com']
        };

      expect(fn(descriptors).body.query).to.eql(
        {term: {canonicalUrl: 'http://www.foo.com'}}
      );
    });

    it ('includeTags sets query to include ANY of the specified tags', function () {
      const result = fn({includeTags: ['a','b']});

      expect(result.body.query).to.eql({
        bool: {
          filter: [{
            bool: {
              should: [
                {term: {tags: 'a'}},
                {term: {tags: 'b'}}
              ],
              minimum_should_match: 1
            }
          }]
        }
      });
    });

    it ('excludeTags sets query to exclude ALL of the specified tags', function () {
      const result = fn({excludeTags: ['a','b']});

      expect(result.body.query).to.eql({
        bool: {
          must_not: [
            {term: {tags: 'a'}},
            {term: {tags: 'b'}}
          ]
        }
      });
    });

    it ('includeContentChannels sets query to include ANY of specified content channels', function () {
      const result = fn({includeContentChannels: ['a','b']});

      expect(result.body.query).to.eql({
        bool: {
          filter: [
            {
              bool: {
                should: [
                  {term: {contentChannel: 'a'}},
                  {term: {contentChannel: 'b'}}
                ],
                minimum_should_match: 1
              }
            }
          ]
        }
      });
    });

    it ('includeFeatureTypes sets query to include ANY of the specified feature types', function () {
      const result = fn({includeFeatureTypes: ['a', 'b']});

      expect(result.body.query).to.eql({
        bool: {
          filter: [
            {
              bool: {
                should: [
                  {term: {'featureTypes.a': true}},
                  {term: {'featureTypes.b': true}}
                ],
                minimum_should_match: 1
              }
            }
          ]
        }
      });
    });

    it ('excludeFeatureTypes sets query to exclude specified feature types', function () {
      const result = fn({excludeFeatureTypes: ['a', 'b']});

      expect(result.body.query).to.eql({
        bool: {
          must_not: [
            {term: {'featureTypes.a': true}},
            {term: {'featureTypes.b': true}}
          ]
        }
      });
    });

    it ('includeStoryCharacteristics sets query to include ALL of the specified story characteristics', function () {
      const result = fn({includeStoryCharacteristics: ['a', 'b']});

      expect(result.body.query).to.eql({
        bool: {
          filter: [
            {term: {'storyCharacteristics.a': true}},
            {term: {'storyCharacteristics.b': true}}
          ]
        }
      });
    });

    it ('excludeStoryCharacteristics sets query to exclude specified story characteristics', function () {
      const result = fn({excludeStoryCharacteristics: ['a', 'b']});

      expect(result.body.query).to.eql({
        bool: {
          must_not: [
            {term: {'storyCharacteristics.a': true}},
            {term: {'storyCharacteristics.b': true}}
          ]
        }
      });
    });

    it ('includeFeeds sets query to include ALL of the specified feeds', function () {
      const result = fn({includeFeeds: ['a', 'b']});

      expect(result.body.query).to.eql({
        bool: {
          filter: [
            {term: {'feeds.a': true}},
            {term: {'feeds.b': true}}
          ]
        }
      });
    });

    it ('excludeFeeds sets query to exclude specified feeds', function () {
      const result = fn({excludeFeeds: ['a', 'b']});

      expect(result.body.query).to.eql({
        bool: {
          must_not: [
            {term: {'feeds.a': true}},
            {term: {'feeds.b': true}}
          ]
        }
      });
    });

    it ('sitePrefixes sets query to only include documents with specified site prefix and its crossposts' , function () {
      const result = fn({sitePrefixes: ['http://a.com', 'http://b.com']});

      expect(result.body.query).to.eql({
        bool: {
          should: [
            {prefix: {canonicalUrl: 'http://a.com'}},
            {prefix: {canonicalUrl: 'http://b.com'}}
          ],
          minimum_should_match: 1
        }
      });
    });

    it ('crossposts sets query to only include documents that are crossposts for the specified site slugs', function () {
      const result = fn({crossposts: ['foo', 'bar']});

      expect(result.body.query).to.eql({
        bool: {
          should: [
            {term: {'crosspost.foo': true}},
            {term: {'crosspost.bar': true}}
          ],
          minimum_should_match: 1
        }
      });
    });

    it ('siteSlugs sets query to only include documents with specified site slugs', function () {
      const result = fn({siteSlugs: ['foo', 'bar']});

      expect(result.body.query.bool.should).to.deep.include(
        {term: {site: 'foo'}}
      );
      expect(result.body.query.bool.should).to.deep.include(
        {term: {site: 'bar'}}
      );
    });

    it ('automatically includes site slug from locals', function () {
      const result = fn({siteSlugs: ['foo', 'bar']}, {site: {slug: 'zar'}});

      expect(result.body.query.bool.should).to.deep.include(
        {term: {site: 'zar'}}
      );
      expect(result.body.query.bool.should).to.deep.include(
        {term: {site: 'foo'}}
      );
      expect(result.body.query.bool.should).to.deep.include(
        {term: {site: 'bar'}}
      );
    });

    it ('automatically includes site slug from locals when siteSlugs is undefined', function () {
      const result = fn({}, {site: {slug: 'zar'}});

      expect(result.body.query.bool.should).to.deep.include(
        {term: {site: 'zar'}}
      );
    });


    it ('join sitePrefixes, crossposts, and siteSlugs within the same should clause (i.e. use an OR relationship)', function () {
      const result = fn({
        crossposts: ['foo', 'bar'],
        sitePrefixes: ['http://a.com', 'http://b.com'],
        siteSlugs: ['c', 'd']
      });

      expect(result.body.query.bool.should).to.have.deep.members([
        {prefix: {canonicalUrl: 'http://a.com'}},
        {prefix: {canonicalUrl: 'http://b.com'}},
        {term: {'crosspost.foo': true}},
        {term: {'crosspost.bar': true}},
        {term: {site: 'c'}},
        {term: {site: 'd'}}
      ]);
      expect(result.body.query.bool.minimum_should_match).to.equal(1);
    });

    it ('ignores contentDescriptors that are empty', function () {
      const result = fn({
        includeFeatureTypes: []
      });

      expect(result.body.query).to.eql({bool: {}});
    });

    it ('derives index from elasticIndex content descriptor', function () {
      const result = fn({
        elasticIndex: 'foo'
      });

      expect(result.index).to.equal('foo');
    });

  });

});
