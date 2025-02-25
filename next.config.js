const withSass = require('@zeit/next-sass');
const withCSS = require('@zeit/next-css');
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

module.exports = withBundleAnalyzer(withCSS(withSass({
  poweredByHeader: false,

  eslint: {
    // prevents compilation process to fail due to eslint warnings/errors.
    // todo: fix eslint errors/warnings slowly until we ensure we can remove this option.
    ignoreDuringBuilds: true,
  },

  // Webpack 5 is enabled by default
  // You can still use webpack 4 while upgrading to the latest version of Next.js
  // by adding the "webpack5: false" flag
  webpack5: false,

  async redirects() {
    return [
      {
        source: '/data',
        destination: '/data/explore',
        permanent: true,
      },
      {
        source: '/topics',
        destination: '/dashboards',
        permanent: true,
      },
      {
        source: '/topics/:id',
        destination: '/dashboards/:id',
        permanent: true,
      },
      {
        source: '/myrw',
        destination: '/myrw/widgets/my_widgets',
        permanent: true,
      },
    ];
  },

  // exportPathMap: async (defaultPathMap) => ({
  //   ...defaultPathMap,
  //   '/': { page: '/home' },
  //   '/about/contact-us': { page: '/contact-us' },
  //   '/about/faqs': { page: '/faqs' },
  //   '/about/howto': { page: 'how-to' },
  //   '/about/partners': { page: '/partners' },
  //   '/privacy-policy': { page: '/policy' },
  //   '/api-attribution-requirements': { page: 'attribution-requirements' },
  //   '/data/explore': { page: '/explore' },
  //   '/data/pulse': { page: '/pulse' },
  // }),

  webpack: (config) => {
    // eslint-disable-next-line no-underscore-dangle
    const _config = { ...config };

    _config.node = {
      console: true,
      fs: 'empty',
      net: 'empty',
      tls: 'empty',
    };

    return _config;
  },
})));
