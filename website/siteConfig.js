// See https://docusaurus.io/docs/site-config for all the possible
// site configuration options.

const Remarkable = require('remarkable');

const extLink = require('remarkable-extlink');

// List of projects/orgs using your project for the users page.
const users = [
  // {
  //   caption: 'User1',
  //   // You will need to prepend the image path with your baseUrl
  //   // if it is not '/', like: '/test-site/img/image.jpg'.
  //   image: '/img/undraw_open_source.svg',
  //   infoLink: 'https://www.facebook.com',
  //   pinned: true,
  // },
];

const siteConfig = {
  title: 'NDID Platform', // Title for your website.
  tagline: 'Digital Identity Platform',
  url: 'https://ndidplatform.github.io', // Your website URL
  baseUrl: '/', // Base URL for your project */
  // For github.io type URLs, you would set the url and baseUrl like:
  //   url: 'https://facebook.github.io',
  //   baseUrl: '/test-site/',

  // Used for publishing and more
  projectName: 'ndidplatform',
  organizationName: 'ndidplatform',
  // For top-level user or org sites, the organization is still the same.
  // e.g., for the https://JoelMarcey.github.io site, it would be set like...
  //   organizationName: 'JoelMarcey'

  // For no header links in the top nav bar -> headerLinks: [],
  headerLinks: [
    { doc: 'introduction', label: 'Docs' },
    { doc: 'api', label: 'API' },
    { href: 'https://github.com/ndidplatform', label: 'GitHub' },
    // { blog: true, label: 'Blog' },
  ],

  // If you have users set above, you add it here:
  users,

  /* path to images for header/footer */
  // headerIcon: 'img/favicon.ico',
  // footerIcon: 'img/favicon.ico',
  // favicon: 'img/favicon.ico',

  /* Colors for website */
  colors: {
    primaryColor: '#126ab4',
    secondaryColor: '#005096',
  },

  /* Custom fonts for website */
  /*
  fonts: {
    myFont: [
      "Times New Roman",
      "Serif"
    ],
    myOtherFont: [
      "-apple-system",
      "system-ui"
    ]
  },
  */

  // This copyright info is used in /core/Footer.js and blog RSS/Atom feeds.
  // copyright: `Copyright © ${new Date().getFullYear()} National Digital ID`,

  highlight: {
    // Highlight.js theme to use for syntax highlighting in code blocks.
    theme: 'railscasts',
  },

  // Add custom scripts here that would be placed in <script> tags.
  scripts: [
    'https://buttons.github.io/buttons.js',
    'https://unpkg.com/mermaid@7.1.2/dist/mermaid.min.js',
    '/js/custom.js',
  ],

  // On page navigation for the current documentation page.
  onPageNav: 'separate',
  // No .html extensions for paths.
  cleanUrl: true,

  // Open Graph and Twitter card images.
  // ogImage: 'img/undraw_online.svg',
  // twitterImage: 'img/undraw_tweetstorm.svg',

  // Show documentation's last contributor's name.
  // enableUpdateBy: true,

  // Show documentation's last update time.
  enableUpdateTime: true,

  // You may provide arbitrary config keys to be used as needed by your
  // template. For example, if you need your repo's URL...
  repoUrl: 'https://github.com/ndidplatform/ndidplatform.github.io',

  markdownPlugins: [
    function mermaidify(md) {
      md.renderer.rules.fence_custom['mermaid'] = function(tokens, idx) {
        const token = tokens[idx];
        return `<div class="mermaid">${Remarkable.utils.escapeHtml(
          token.content
        )}</div>`;
      };
    },
    function(md) {
      md.use(extLink, {
        host: 'ndidplatform.github.io',
      });
    },
  ],
};

module.exports = siteConfig;
