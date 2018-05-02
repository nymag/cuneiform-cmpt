'use strict';

const expect = require('chai').expect,
  dirname = __dirname.split('/').pop(),
  filename = __filename.split('/').pop().split('.').shift(),
  lib = require('./' + filename);

describe(dirname, function () {
  describe(filename, function () {
    const mockRef = '/_components/a/instances/foo';

    describe('save', function () {
      const fn = lib[this.title];

      it ('saves simple-list content descriptors as an array of strings in edit mode', function () {
        const mockData = {
            includeTags: [{text: 'a'}, {text: 'b'}],
            excludeTags: [{text: 'c'}],
            includeContentChannels: [{text: 'd'}],
            excludeContentChannels: [{text: 'e'}],
            includeFeatureTypes: [{text: 'f'}],
            excludeFeatureTypes: [{text: 'g'}],
            includeStoryCharacteristics: [{text: 'h'}],
            excludeStoryCharacteristics: [{text: 'i'}],
            sitePrefixes: [{text: 'j'}],
            crossposts: [{text: 'k'}],
            dedupeContexts: [{text: 'l'}],
          },
          expectedResult = {
            includeTags: ['a', 'b'],
            excludeTags: ['c'],
            includeContentChannels: ['d'],
            excludeContentChannels: ['e'],
            includeFeatureTypes: ['f'],
            excludeFeatureTypes: ['g'],
            includeStoryCharacteristics: ['h'],
            excludeStoryCharacteristics: ['i'],
            sitePrefixes: ['j'],
            crossposts: ['k'],
            dedupeContexts: ['l']
          };

        expect(fn(mockRef, mockData, {edit: true}))
          .to.deep.include(expectedResult);
      });

      it ('removes empty strings from arrays in edit mode', function () {
        const mockData = {
            includeTags: [{text: 'a'}, {text: ''}]
          },
          expectedResult = {
            includeTags: ['a']
          };

        expect(fn(mockRef, mockData, {edit: true})).to.deep.include(expectedResult);
      });

      it ('converts https overrideUrls to http', function () {
        expect(fn(mockRef, {overrideUrl: 'https://foo.com'}, {}).overrideUrl).to.equal('http://foo.com');
      });

      it ('converts relative overrideUrls to http', function () {
        expect(fn(mockRef, {overrideUrl: '//foo.com'}, {}).overrideUrl).to.equal('http://foo.com');
      });
    });

    describe('render', function () {
      const fn = lib[this.title];

      it ('renders simple-list content descriptors as an array of {text: string} objects in edit mode', function () {
        const mockData = {
            includeTags: ['a', 'b'],
            excludeTags: ['c'],
            includeContentChannels: ['d'],
            excludeContentChannels: ['e'],
            includeFeatureTypes: ['f'],
            excludeFeatureTypes: ['g'],
            includeStoryCharacteristics: ['h'],
            excludeStoryCharacteristics: ['i'],
            sitePrefixes: ['j'],
            crossposts: ['k'],
            dedupeContexts: ['l']
          },
          expectedResult = {
            includeTags: [{text: 'a'}, {text: 'b'}],
            excludeTags: [{text: 'c'}],
            includeContentChannels: [{text: 'd'}],
            excludeContentChannels: [{text: 'e'}],
            includeFeatureTypes: [{text: 'f'}],
            excludeFeatureTypes: [{text: 'g'}],
            includeStoryCharacteristics: [{text: 'h'}],
            excludeStoryCharacteristics: [{text: 'i'}],
            sitePrefixes: [{text: 'j'}],
            crossposts: [{text: 'k'}],
            dedupeContexts: [{text: 'l'}],
          };

        expect(fn(mockRef, mockData, {edit: true})).to.eql(expectedResult);
      });
    });

    describe('getCallout', function () {
      const fn = lib[this.title];

      it ('returns an empty string if there is no article data', function () {
        expect(fn()).to.equal('');
      });

      it ('returns an empty string if the article data has no tags set', function () {
        expect(fn({})).to.equal('');
      });

      it ('returns an empty string if the article has an empty tags array', function () {
        expect(fn({tags:[]})).to.equal('');
      });

      it ('returns an empty string if the article has no relevant tags', function () {
        expect(fn({tags:['foo']})).to.equal('');
      });

      it ('returns "video" if article has the tag "video"', function () {
        expect(fn({tags:['video']})).to.equal('video');
      });

      it ('returns "video" if the article has the tag "original video"', function () {
        expect(fn({tags: ['original video']})).to.equal('video');
      });

      it ('returns "gallery" if the article has the tag "gallery"', function () {
        expect(fn({tags: ['gallery']})).to.equal('gallery');
      });

      it ('prefers "video" to "gallery"', function () {
        expect(fn({tags: ['video', 'gallery']})).to.equal('video');
      });
    });
  });
});
