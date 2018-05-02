'use strict';

const _ = require('lodash');

class BooleanQuery {
  constructor() {
    this.queryObj = {};
    return this;
  }
  /**
   * Add clause to Boolean query.
   * @param {string} occurrence 'filter', 'should', 'must', 'must_not'
   * @param {string} queryType e.g. 'term', 'filter', 'bool'
   * @param {string|func|object} param Leaf clause field (e.g. 'canonicalUrl'),func describing Boolean subquery, or raw query object
   * @param {string} [value] e.g. 'bar' Leaf clause values (e.g. 'http://foo.com')
   * @returns {object} this
   * @example booleanQuery.addClause('filter', 'term', 'canonicalUrl', 'http://foo.com')
   * @example booleanQuery.addClause('should', 'term', {canonicalUrl: 'http://foo.com'}})
   * @example booleanQuery.addClause('must', 'bool', subQuery => subQuery.addClause('filter', 'term', 'foo', 'bar'))
   */
  addClause(occurrence, queryType, param, value) {
    const currentClauses = _.get(this.queryObj, occurrence, []);
    let newClause = {};

    // if adding a should clause, assume we're doing an "OR" check, so require that all docs meet at least one condition
    if (occurrence === 'should') {
      this.queryObj.minimum_should_match = 1;
    }

    if (arguments.length === 3) {
      if (queryType === 'bool' && typeof param === 'function') {
        newClause = {bool: param(new BooleanQuery()).build()};
      } else {
        newClause[queryType] = param;
      }
    } else {
      newClause[queryType] = {};
      newClause[queryType][param] = value;
    }

    // add new clauses to the existing clauses for this occurrence
    this.queryObj[occurrence] = currentClauses.concat(newClause);
    return this;
  }
  build() {
    return this.queryObj;
  }
}

module.exports = BooleanQuery;
