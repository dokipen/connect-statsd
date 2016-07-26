// # Connect StatsD #
//
// ![logo](http://static.embed.ly/connect-statsd/logo.png "Connect StatsD")
//
// StatsD middleware for connect.

/*
 * Copyright (c) 2012 Bob Corsaro
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to
 * deal in the Software without restriction, including without limitation the
 * rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
 * sell copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
 * IN THE SOFTWARE.
 */


var _ = require('lodash')
  , StatsD = require('node-statsd').StatsD
  , os = require('os')
  , hostname = os.hostname()

// ****
//
// `connect-statsd` middleware sends metrics for requests to statsd.
// Currently implemented metrics are::
//
//  - requests : count requests
//  - time_firstbyte : elapsed time of request when first byte was written
//    to the client
//
// Options:
//
//  - prefix : metric prefix to be appended to the metric name.
//    (default: connect.$(hostname))
//  - host : statsd host.
//    (default: localhost)
//  - port : statsd port.
//    (default: 8125)
//
exports = module.exports = function(opts) {
  var config = _.merge(
        { prefix: 'connect.'+hostname
        , host: 'localhost'
        , port: 8125 }, opts)
    , statsd = new StatsD(config.host, config.port)

  return function(req, res, next) {
    statsd.increment(config.prefix+".requests")

    var writeHead = res.writeHead
      , start = new Date()

    res.writeHead = function(code, headers) {
      statsd.timing(config.prefix+".time_firstbyte", new Date() - start)
      res.writeHead = writeHead
      res.writeHead(code, headers) }

    next() } }
