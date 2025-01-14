/* eslint-disable @typescript-eslint/no-var-requires */
const { withContentlayer } = require("next-contentlayer");

module.exports = withContentlayer({
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ["pbs.twimg.com"],
  },
  experimental: {
    images: {
      allowFutureImage: true,
      remotePatterns: [{ hostname: "pbs.twimg.com" }],
    },
  },
});
