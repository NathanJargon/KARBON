module.exports = function override(config, env) {
    if (env === 'production') {
      config.plugins.push(['transform-remove-console']);
    }
    return config;
  };