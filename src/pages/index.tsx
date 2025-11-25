import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';

import styles from './index.module.css';

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container">
        <Heading as="h1" className="hero__title">
          {siteConfig.title}
        </Heading>
        <p className="hero__subtitle">{siteConfig.tagline}</p>
        <div className={styles.buttons}>
          <Link
            className="button button--secondary button--lg"
            to="/getting-started/introduction">
            Get Started - 5min ⏱️
          </Link>
        </div>
      </div>
    </header>
  );
}

export default function Home(): JSX.Element {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title={`${siteConfig.title}`}
      description="Event-Sourced Knowledge Backend with AI">
      <HomepageHeader />
      <main>
        <div className="container margin-vert--lg">
          <div className="row">
            <div className="col col--4 margin-bottom--lg">
              <div className="card">
                <div className="card__header">
                  <Heading as="h3">🚀 Getting Started</Heading>
                </div>
                <div className="card__body">
                  <p>
                    Learn how to install and configure Synap for development and production.
                  </p>
                  <Link to="/getting-started/introduction">Get Started →</Link>
                </div>
              </div>
            </div>
            <div className="col col--4 margin-bottom--lg">
              <div className="card">
                <div className="card__header">
                  <Heading as="h3">🏗️ Architecture</Heading>
                </div>
                <div className="card__body">
                  <p>
                    Understand the event-driven architecture, components, and data flows.
                  </p>
                  <Link to="/architecture/overview">Learn More →</Link>
                </div>
              </div>
            </div>
            <div className="col col--4 margin-bottom--lg">
              <div className="card">
                <div className="card__header">
                  <Heading as="h3">💻 Development</Heading>
                </div>
                <div className="card__body">
                  <p>
                    Build custom capabilities, integrate the SDK, and extend Synap.
                  </p>
                  <Link to="/development/setup">Start Building →</Link>
                </div>
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col col--4 margin-bottom--lg">
              <div className="card">
                <div className="card__header">
                  <Heading as="h3">📚 API Reference</Heading>
                </div>
                <div className="card__body">
                  <p>
                    Complete API documentation for Data Pod, Intelligence Hub, and Hub Protocol.
                  </p>
                  <Link to="/api/data-pod/overview">View API Docs →</Link>
                </div>
              </div>
            </div>
            <div className="col col--4 margin-bottom--lg">
              <div className="card">
                <div className="card__header">
                  <Heading as="h3">🚢 Deployment</Heading>
                </div>
                <div className="card__body">
                  <p>
                    Deploy Synap with Docker, configure production, and set up infrastructure.
                  </p>
                  <Link to="/deployment/overview">Deploy Now →</Link>
                </div>
              </div>
            </div>
            <div className="col col--4 margin-bottom--lg">
              <div className="card">
                <div className="card__header">
                  <Heading as="h3">🎯 Strategy</Heading>
                </div>
                <div className="card__body">
                  <p>
                    Learn about Synap's vision, mission, and roadmap.
                  </p>
                  <Link to="/strategy/vision">Explore Vision →</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </Layout>
  );
}
