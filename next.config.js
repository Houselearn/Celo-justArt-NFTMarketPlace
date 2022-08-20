module.exports = {
  target: "serverless",
  webpack: (config, { webpack }) => {
    config.plugins.push(
      new webpack.IgnorePlugin({ resourceRegExp: /^electron$/ })
    );
    config.resolve = {
      ...config.resolve,
      fallback: {
        fs: false,
        path: false,
        os: false,
        net: false,
        crypto: require.resolve("crypto-browserify"),
        querystring: require.resolve("query-string"),
        stream: "stream-browserify",
        https: "agent-base",
        http: false,
      },
    };
    return config;
  },
};
