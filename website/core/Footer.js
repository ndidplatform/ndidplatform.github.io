const React = require('react');

class Footer extends React.Component {
  docUrl(doc, language) {
    const baseUrl = this.props.config.baseUrl;
    const docsUrl = this.props.config.docsUrl;
    const docsPart = `${docsUrl ? `${docsUrl}/` : ''}`;
    const langPart = `${language ? `${language}/` : ''}`;
    return `${baseUrl}${docsPart}${langPart}${doc}`;
  }

  pageUrl(doc, language) {
    const baseUrl = this.props.config.baseUrl;
    return baseUrl + (language ? `${language}/` : '') + doc;
  }

  render() {
    return (
      <footer className="nav-footer" id="footer">
        <section className="sitemap">
          <a href={this.props.config.baseUrl} className="nav-home">
            {this.props.config.footerIcon && (
              <img
                src={this.props.config.baseUrl + this.props.config.footerIcon}
                alt={this.props.config.title}
                width="66"
                height="58"
              />
            )}
          </a>
          <div>
            <h5>Docs</h5>
            <a href={this.docUrl('introduction')}>Introduction</a>
            <a href={this.docUrl('getting-started-setup')}>Getting Started</a>
            {/* <a href={this.docUrl('doc2.html', this.props.language)}>
              Guides (or other categories)
            </a> */}
            <a href={this.docUrl('api')}>API Reference</a>
          </div>
          <div>
            <h5>Community</h5>
            {/* <a href={this.pageUrl('users.html', this.props.language)}>
              User Showcase
            </a> */}
            <a
              href="http://www.ndid.co.th/"
              target="_blank"
              rel="noreferrer noopener"
            >
              Official Site
            </a>
            <a
              href="https://www.facebook.com/NationalDigitalID/"
              target="_blank"
              rel="noreferrer noopener"
            >
              Facebook
            </a>
            <a
              href="https://national-digital-id.slack.com/"
              target="_blank"
              rel="noreferrer noopener"
            >
              Slack
            </a>
          </div>
          <div>
            <h5>More</h5>
            {/* <a href={`${this.props.config.baseUrl}blog`}>Blog</a> */}
            <a
              href="https://goo.gl/v4Cfpe"
              target="_blank"
              rel="noreferrer noopener"
            >
              Whitepaper
            </a>
            <a
              href="https://github.com/ndidplatform"
              target="_blank"
              rel="noreferrer noopener"
            >
              GitHub
            </a>
            {/* <a
              className="github-button"
              href={this.props.config.repoUrl}
              data-icon="octicon-star"
              data-count-href="/facebook/docusaurus/stargazers"
              data-show-count="true"
              data-count-aria-label="# stargazers on GitHub"
              aria-label="Star this project on GitHub"
            >
              Star
            </a> */}
          </div>
        </section>

        {/* <a
          href="https://opensource.facebook.com/"
          target="_blank"
          rel="noreferrer noopener"
          className="fbOpenSource"
        >
          <img
            src={`${this.props.config.baseUrl}img/oss_logo.png`}
            alt="Facebook Open Source"
            width="170"
            height="45"
          />
        </a> */}
        <section className="copyright">{this.props.config.copyright}</section>
      </footer>
    );
  }
}

module.exports = Footer;
