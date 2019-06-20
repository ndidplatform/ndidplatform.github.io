var url = require('url');

var DEFAULT_OPTIONS = {
  target: '_blank',
  rel: 'nofollow noreferrer noopener'
};

/**
 * Defines link is internal.
 * @param host {String} Site hostname.
 * @param href {Object} Parsed url object.
 * @return {Boolean}
 */
var isInternal = function (host, href) {
  return href.host === host || (!href.protocol && !href.host && href.pathname);
};

var remarkableExtLink = function (md, options) {
  var config = Object.assign({}, DEFAULT_OPTIONS, options);

  // Parse and normalize hostname.
  config.host = url.parse(config.host).host;
  // Save original method to invoke.
  var originalRender = md.renderer.rules.link_open;

  md.renderer.rules.link_open = function() {
    var result;

    // Invoke original method first.
    result = originalRender.apply(null, arguments);

    var regexp = /href="([^"]*)"/;

    var href = url.parse(regexp.exec(result)[1]);

    if (!isInternal(config.host, href)) {
      result = result.replace('>', ' target="' + config.target + '" rel="' + config.rel + '">');
    }

    return result;
  };
};

module.exports = remarkableExtLink;
