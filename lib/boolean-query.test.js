'use strict';
const expect = require('chai').expect,
  filename = __filename.split('/').pop().split('.').shift(),
  lib = require('./' + filename);

describe(filename, function () {

  describe('addClause', function () {

    it ('adds a leaf clause if four arguments are specified', function () {
      const query = new lib();

      query.addClause('filter', 'term', 'canonicalUrl', 'http://foo.com');
      expect(query.build()).to.eql({
        filter: [
          {term: {canonicalUrl: 'http://foo.com'}}
        ]
      });
    });

    it ('if occurrence is "should", set minimum_must_match to 1', function () {
      const query = new lib();

      query.addClause('should', 'term', 'canonicalUrl', 'http://foo.com');
      expect(query.build()).to.eql({
        should: [
          {term: {canonicalUrl: 'http://foo.com'}}
        ],
        minimum_should_match: 1
      });
    });

    it ('additional clauses to the same occurrence do not overwrite old clauses', function () {
      const query = new lib();

      query.addClause('filter', 'term', 'canonicalUrl', 'http://foo.com');
      query.addClause('filter', 'term', 'canonicalUrl', 'http://bar.com');

      expect(query.build()).to.eql({
        filter: [{
          term: {canonicalUrl: 'http://foo.com'}
        }, {
          term: {canonicalUrl: 'http://bar.com'}
        }]
      });
    });

    it ('assumes third arg is raw query object if three arugments are specified', function () {
      const query = new lib();

      query.addClause('filter', 'term', {canonicalUrl: 'http://foo.com'});
      expect(query.build()).to.eql({
        filter: [
          {term: {canonicalUrl: 'http://foo.com'}}
        ]
      });
    });

    it ('if second arg is "bool" and third arg is fnc, passes new BooleanQuery object through third arg and builds it', function () {
      const query = new lib();

      query.addClause('filter', 'bool', b => b.addClause('filter', 'term', 'canonicalUrl', 'http://foo.com'));
      expect(query.build()).to.eql({
        filter: [
          {bool: {filter: [{term: {canonicalUrl: 'http://foo.com'}}]}}
        ]
      });
    });
  });
});
