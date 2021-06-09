import {
  useMemo,
  useEffect,
} from 'react';
import classnames from 'classnames';
import {
  useQuery,
} from 'react-query';
import { useRouter } from 'next/router';
import Link from 'next/link';
import {
  Link as ScrollLink,
  Button,
  Element,
  Events,
  animateScroll as scroll,
  scrollSpy,
  scroller,
} from 'react-scroll';
import { v4 as uuidv4 } from 'uuid';

// components
import LayoutOceanWatch from 'layout/layout/ocean-watch';
import Tabs from 'components/ui/Tabs';
import MiniExplore from 'components/mini-explore';
import CardIndicatorSet from 'components/card-indicator-set';
import CardIndicator from 'components/card-indicator-set/card-indicator';

// services
import { fetchConfigFile } from 'services/ocean-watch';

export default function OceanWatchCountryProfilePage() {
  const router = useRouter();
  const {
    query: {
      iso,
    },
    // pathname,
  } = router;

  // todo: move this fetching to getStaticProps function when getInitialProps is gone
  const {
    data: oceanWatchConfig,
  } = useQuery(
    ['ocean-watch-config-file'],
    () => fetchConfigFile(),
    {
      refetchOnWindowFocus: false,
      placeholderData: {
        intro: [],
        'country-profile': [],
      },
      initialStale: true,
    },
  );

  const indicatorSetConfiguration = useMemo(() => oceanWatchConfig['country-profile']
    .find((rowContent) => !!rowContent.find((blockContent) => blockContent.visualizationType === 'indicators-set'))?.[0], [oceanWatchConfig]);

  const anchors = useMemo(() => {
    const {
      asPath,
    } = router;

    return [
      {
        label: 'Ecosystems and Pressures',
        // route: `${asPath.split('#')[0]}#ecosystems-pressures`,
        value: 'ecosystems-pressures',
      },
      {
        label: 'Catchment Areas and Land Cover',
        // route: `${asPath.split('#')[0]}#catchment-areas-land-cover`,
        value: 'catchment-areas-land-cover',
      },
    ];
  }, [router]);

  const onClickTab = (value) => {
    scroller.scrollTo(value, {
      smooth: true,
    });
  };

  useEffect(() => {
    Events.scrollEvent.register('begin', (to) => {
      const {
        pathname,
        query,
        asPath,
      } = router;

      console.log(router)

      router.push(
        `${asPath.split('#')[0]}#${to}`,
        // `${asPath.split('#')[0]}#${to}`,
        undefined,
        {
          shallow: true,
        },
      );
    });

    return () => {
      Events.scrollEvent.remove('begin');
    };
  }, [router, iso]);

  useEffect(() => {
    const {
      asPath,
    } = router;

    const anchor = asPath.split('#')[1];

    console.log('anchor', anchor);

    if (!anchor) return null;

    scroller.scrollTo(anchor, {
      smooth: true,
    });
  }, [router]);

  return (
    <LayoutOceanWatch
      title="Ocean Watch"
      description="Ocean Watch description" // todo: replace description
    >
      <section className="l-section -small  -secondary">
        <div className="l-container">
          <div className="row">
            <div className="column small-12">
              {indicatorSetConfiguration && (
                <CardIndicatorSet
                  config={indicatorSetConfiguration.config}
                  params={{
                    iso,
                  }}
                  theme={indicatorSetConfiguration?.config?.theme}
                >
                  {(indicatorSetConfiguration?.config?.indicators || [])
                    .map(({ id, title, icon }) => (
                      <CardIndicator
                        key={id}
                        id={id}
                        title={title}
                        icon={icon}
                        theme={indicatorSetConfiguration?.config?.theme}
                      />
                    ))}
                </CardIndicatorSet>
              )}
            </div>
          </div>
        </div>
        <Tabs
          options={anchors}
          onChange={onClickTab}
          className="-dark"
          // defaultSelected={pathname}
          // selected={pathname}
        />
        {/* <ScrollLink
          to="ecosystems-pressures"
          smooth
        >
          Ecosystems and Pressures
        </ScrollLink> */}
      </section>
      <div className="l-container">
        {oceanWatchConfig['country-profile'].map((rowContent) => (
          <section
            key={uuidv4()}
            className="l-section -small"
          >
            <div className="cw-wysiwyg-list-item -isReadOnly">
              <div className="row">
                {rowContent.map((blockContent) => (
                  <div
                    key={uuidv4()}
                    className={classnames({
                      column: true,
                      'small-12': blockContent.grid === '100%',
                      'medium-6': blockContent.grid === '50%',
                    })}
                  >
                    {blockContent.anchor && (
                      <Element name={blockContent.anchor}>
                        <h2 id={blockContent.anchor}>{blockContent.title}</h2>
                      </Element>
                    )}
                    {/* {blockContent.title && (
                      <h2 id={blockContent.anchor}>
                        {blockContent.title}
                      </h2>
                    )} */}
                    {blockContent.text && (
                      <p>
                        {blockContent.text}
                      </p>
                    )}
                    {blockContent.visualizationType === 'mini-explore' && (
                      <MiniExplore
                        config={blockContent.config}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>
        ))}
      </div>
    </LayoutOceanWatch>
  );
}

export async function getStaticProps() {
  // feature flag to avoid display any Ocean Watch development in other environments
  if (process.env.NEXT_PUBLIC_FEATURE_FLAG_OCEAN_WATCH !== 'true') {
    return {
      notFound: true,
    };
  }

  return {
    props: ({}),
  };
}

export async function getStaticPaths() {
  // todo: replace fetching list
  const countryList = [
    'ESP',
    'BRA',
  ];

  const paths = countryList.map((iso) => ({
    params: {
      iso,
    },
  }));

  return {
    paths,
    fallback: false,
  };
}
