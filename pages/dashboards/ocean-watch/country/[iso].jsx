import {
  useState,
  useMemo,
  useCallback,
} from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import {
  useQuery,
  QueryClient,
  useQueryClient,
} from 'react-query';
import { dehydrate } from 'react-query/hydration';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import Link from 'next/link';
import {
  useSelector,
} from 'react-redux';
import { v4 as uuidv4 } from 'uuid';
import Select from 'react-select';
import Sticky from 'react-stickynode';
import {
  Link as ScrollLink,
} from 'react-scroll';
import flattenDeep from 'lodash/flattenDeep';

// components
import LayoutOceanWatch from 'layout/layout/ocean-watch';
import Header from 'layout/header';
import OceanWatchHero from 'layout/layout/ocean-watch/hero';
import InView from 'components/in-view';
import MiniExplore from 'components/mini-explore';
import MiniExploreWidgets from 'components/mini-explore-widgets';
import CardIndicatorSet from 'components/card-indicator-set';
import CardIndicator from 'components/card-indicator-set/card-indicator';
import NumericCardIndicator from 'components/card-indicator-set/numeric-card-indicator';
import MapWidget from 'components/widgets/types/map';
import SwipeMapWidget from 'components/widgets/types/map-swipe';
import ChartWidget from 'components/widgets/types/chart';
import Banner from 'components/app/common/Banner';

// hooks
import {
  useOceanWatchAreas,
} from 'hooks/ocean-watch';

// services
import {
  fetchConfigFile,
  fetchOceanWatchAreas,
} from 'services/ocean-watch';

// utils
import {
  getRWAdapter,
} from 'utils/widget-editor';
import {
  isStagingAPI,
} from 'utils/api';

const isStaging = isStagingAPI();

const WidgetShareModal = dynamic(() => import('../../../../components/widgets/share-modal'), { ssr: false });

export default function OceanWatchCountryProfilePage({
  iso,
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [widgetToShare, setWidgetToShare] = useState(null);
  const RWAdapter = useSelector((state) => getRWAdapter(state));

  const handleAreaChange = useCallback(({ value }) => {
    router.push({
      pathname: '/dashboards/ocean-watch/country/[iso]',
      query: {
        iso: value,
      },
    });
  }, [router]);

  const handleShareWidget = useCallback((_widget) => {
    setWidgetToShare(_widget);
  }, []);

  const handleCloseShareWidget = useCallback(() => {
    setWidgetToShare(null);
  }, []);

  const {
    data: areas,
  } = useOceanWatchAreas({
    placeholderData: queryClient.getQueryData('ocean-watch-areas') || [],
  });

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

  const serializedConfiguration = useMemo(() => (oceanWatchConfig['country-profile'])
    .map((rowContent) => {
      const rowId = uuidv4();

      return ([
        ...rowContent.map((blockContent) => ({
          ...blockContent,
          id: uuidv4(),
          rowId,
        })),
      ]);
    }), [oceanWatchConfig]);

  const indicatorSetConfiguration = useMemo(() => {
    const configuration = serializedConfiguration
      .find((rowContent) => !!rowContent.find((blockContent) => blockContent.content?.[0]?.[0]?.visualizationType === 'main-indicators-set'))?.[0];

    if (configuration) {
      const {
        content,
        ...restConfiguration
      } = configuration;

      return ({
        ...restConfiguration,
        ...content && flattenDeep(content)?.[0],
      });
    }

    return null;
  }, [serializedConfiguration]);

  const area = useMemo(() => areas.find(({ iso: areaId }) => iso === areaId), [areas, iso]);

  const areaOptions = useMemo(() => areas.map(({
    name: label,
    iso: value,
  }) => ({
    label,
    value,
  })), [areas]);

  const defaultAreaOption = useMemo(
    () => areaOptions.find(({ value }) => iso === value),
    [areaOptions, iso],
  );

  const dashboardTabs = useMemo(() => flattenDeep(oceanWatchConfig['country-profile'] || [])
    .filter(({ anchor }) => Boolean(anchor))
    .map(({
      title: label,
      anchor: value,
    }) => ({
      label,
      value,
    })), [oceanWatchConfig]);

  return (
    <LayoutOceanWatch
      title="Ocean Watch"
      description="Ocean Watch description" // todo: replace description
    >
      <Header className="-transparent" />
      <OceanWatchHero className="-ocean-watch" />
      <section
        className="l-section -small -secondary"
        style={{
          paddingBottom: 0,
        }}
      >
        <div className="l-container">
          <div className="row">
            <div className="column small-12">
              <div style={{
                paddingBottom: 30,
              }}
              >
                <Select
                  instanceId="area-selector"
                  options={areaOptions}
                  className="-large"
                  onChange={handleAreaChange}
                  clearable={false}
                  value={defaultAreaOption}
                  placeholder="Select a country"
                />
              </div>
            </div>
          </div>
          <div className="row">
            <div className="column small-12">
              {indicatorSetConfiguration && (
                <CardIndicatorSet
                  config={indicatorSetConfiguration.config}
                  params={{
                    iso,
                  }}
                  theme={indicatorSetConfiguration.config?.theme}
                >
                  {(indicatorSetConfiguration.config?.indicators || [])
                    .map(({
                      id,
                      title,
                      icon,
                    }) => (
                      <CardIndicator
                        key={id}
                        id={id}
                        title={title}
                        icon={icon}
                        theme={indicatorSetConfiguration.config?.theme}
                      />
                    ))}
                </CardIndicatorSet>
              )}
            </div>
          </div>
        </div>
        <Sticky
          bottomBoundary="#dashboard-content"
          innerZ={10}
          className="sticky-dashboard-content-bar"
        >
          <div
            style={{
              width: '100%',
              backgroundColor: '#f4f6f7',
            }}
          >
            <div className="l-container">
              <div className="row">
                <div className="column small-12">
                  <ul className="dashboard-anchors-list">
                    {dashboardTabs.map(({ label, value }) => (
                      <li className="dashboard-anchors-list-item">
                        <ScrollLink
                          activeClass="-active"
                          to={value}
                          spy
                          smooth
                          offset={-25}
                          isDynamic
                        >
                          {label}
                        </ScrollLink>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </Sticky>
      </section>
      <div className="l-container">
        <div id="dashboard-content">
          {serializedConfiguration.map((rowContent) => (
            <div
              key={rowContent[0]?.rowId}
              {...rowContent[0]?.anchor && { id: rowContent[0].anchor }}
            >
              {(rowContent[0]?.content || []).map((blockContent) => {
                if (blockContent?.[0].visualizationType === 'main-indicators-set') return null;

                return (
                  <div
                    className="l-section -small"
                    style={{
                      height: '100%',
                    }}
                  >
                    <div className="row">
                      {blockContent.map((blockElement) => (
                        <div
                          key={blockContent.id}
                          className={classnames({
                            column: true,
                            'small-12': blockElement.grid === '100%',
                            'medium-6': blockElement.grid === '50%',
                          })}
                        >
                          <div
                            style={{
                              height: '100%',
                            }}
                          >
                            {blockElement.title && (
                            <h2>
                              {blockElement.title}
                            </h2>
                            )}
                            {blockElement.text && (
                            <p>
                              {blockElement.text}
                            </p>
                            )}
                            {blockElement.visualizationType === 'mini-explore' && (
                            <InView
                              triggerOnce
                              threshold={0.25}
                            >
                              {({ ref, inView }) => (
                                <div ref={ref}>
                                  {inView && (
                                  <MiniExplore
                                    config={{
                                      ...blockElement.config,
                                      ...area?.geostore && { areaOfInterest: area.geostore },
                                    }}
                                  />
                                  )}
                                </div>
                              )}
                            </InView>
                            )}
                            {blockElement.visualizationType === 'mini-explore-widgets' && (
                            <InView
                              triggerOnce
                              threshold={0.25}
                            >
                              {({ ref, inView }) => (
                                <div ref={ref}>
                                  {inView && (
                                  <MiniExploreWidgets
                                    adapter={RWAdapter}
                                    config={{
                                      ...blockElement.config,
                                      ...area?.geostore && { areaOfInterest: area.geostore },
                                    }}
                                  />
                                  )}
                                </div>
                              )}
                            </InView>
                            )}
                            {(blockElement.widget && blockElement.type === 'map') && (
                            <MapWidget
                              widgetId={blockElement.widget}
                              params={{
                                geostore_env: isStaging ? 'geostore_staging' : 'geostore_prod',
                                ...area?.geostore && { geostore_id: area.geostore },
                              }}
                              {...area?.geostore && { areaOfInterest: area.geostore }}
                              onToggleShare={handleShareWidget}
                            />
                            )}
                            {(blockElement.widget && blockElement.type === 'map-swipe') && (
                            <SwipeMapWidget
                              widgetId={blockElement.widget}
                              params={{
                                geostore_env: isStaging ? 'geostore_staging' : 'geostore_prod',
                                ...area?.geostore && { geostore_id: area.geostore },
                              }}
                              {...area?.geostore && { areaOfInterest: area.geostore }}
                              onToggleShare={handleShareWidget}
                            />
                            )}
                            {(blockElement.widget && blockElement.type === 'chart') && (
                            <ChartWidget
                              adapter={RWAdapter}
                              widgetId={blockElement.widget}
                              {...area?.geostore && { areaOfInterest: area.geostore }}
                              onToggleShare={handleShareWidget}
                            />
                            )}
                            {blockElement.visualizationType === 'indicators-set' && (
                            <InView
                              triggerOnce
                              threshold={0.25}
                            >
                              {({ ref, inView }) => (
                                <div ref={ref}>
                                  {inView && (
                                  <CardIndicatorSet
                                    config={blockElement.config}
                                    params={{
                                      iso,
                                    }}
                                    theme={blockElement?.config?.theme}
                                  >
                                    {(blockElement?.config?.indicators || [])
                                      .map(({
                                        id,
                                        title,
                                        description,
                                        query,
                                        format,
                                        unit,
                                      }) => (
                                        <NumericCardIndicator
                                          key={id}
                                          id={id}
                                          data={{
                                            id,
                                            title,
                                            query,
                                            description,
                                            format,
                                            unit,
                                          }}
                                          title={title}
                                          theme={indicatorSetConfiguration?.config?.theme}
                                          params={{
                                            iso,
                                          }}
                                        />
                                      ))}
                                  </CardIndicatorSet>
                                  )}
                                </div>
                              )}
                            </InView>
                            )}

                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
        <section className="l-section">
          <div className="row">
            <div className="column small-12">
              <Banner
                useDim
                className="-text-center"
                bgImage="/static/images/pages/app/banner-coral.jpg"
              >
                <p className="-claim">
                  Check the Coral Reefs dashboard
                </p>
                <a
                  className="c-button -alt -primary"
                  href="https://resourcewatch.org/dashboards/coral-reefs"
                >
                  Coral Reefs
                </a>
              </Banner>
            </div>
            <div
              className="column small-6"
              style={{
                margin: '20px 0 0',
              }}
            >
              <Banner
                bgImage="/static/images/homepage/home-data-bg1.png"
                styles={{
                  padding: 40,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                  }}
                >
                  <div>
                    <p className="-claim">
                      Did you miss something?
                    </p>
                    <p>
                      Know of a data set that you&apos;d like to see on Resource Watch or have
                      a specific area of interest you&apos;d like us to cover?
                    </p>
                  </div>
                  <Link href="/get-involved/contribute-data">
                    <a className="c-button -alt -primary">
                      Request data
                    </a>
                  </Link>
                </div>
              </Banner>
            </div>
            <div
              className="column small-6"
              style={{
                margin: '20px 0 0',
              }}
            >
              <Banner
                bgImage="/static/images/backgrounds/jellyfish.jpg"
                styles={{
                  padding: 40,
                  height: '100%',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    height: '100%',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <p className="-claim">
                      Suggest a story
                    </p>
                    <p>
                      Have you uncovered an interesting connection in the data
                      we should tell a story about?
                    </p>
                  </div>
                  <Link href="/get-involved/suggest-a-story">
                    <a className="c-button -alt -primary">
                      Suggest a story
                    </a>
                  </Link>
                </div>
              </Banner>
            </div>
            <div
              className="column small-12"
              style={{
                margin: '20px 0 0',
              }}
            >
              <Banner
                useDim
                className="-text-center"
                bgImage="/static/images/pages/app/banner-ocean-watch.jpg"
              >
                <p className="-claim">
                  Check out the Ocean Watch data
                  <br />
                  on the Explore page
                </p>
                <Link href="/data/explore?section=All data&topics=[&quot;ocean&quot;]">
                  <a className="c-button -alt -primary">
                    Go to explore
                  </a>
                </Link>
              </Banner>
            </div>
          </div>
        </section>
      </div>
      {(!!widgetToShare) && (
        <WidgetShareModal
          isVisible
          widget={widgetToShare}
          onClose={handleCloseShareWidget}
        />
      )}
    </LayoutOceanWatch>
  );
}

OceanWatchCountryProfilePage.propTypes = {
  iso: PropTypes.string.isRequired,
};

export async function getStaticProps({
  params,
}) {
  const {
    iso,
  } = params;
  const queryClient = new QueryClient();

  // feature flag to avoid display any Ocean Watch development in other environments
  if (process.env.NEXT_PUBLIC_FEATURE_FLAG_OCEAN_WATCH !== 'true') {
    return ({
      notFound: true,
    });
  }

  return {
    props: ({
      iso,
      dehydratedState: JSON.parse(JSON.stringify(dehydrate(queryClient))),
    }),
    revalidate: 300,
  };
}

export async function getStaticPaths() {
  const queryClient = new QueryClient();

  // prefetch areas
  await queryClient.prefetchQuery('ocean-watch-areas', fetchOceanWatchAreas);
  const areas = queryClient.getQueryData('ocean-watch-areas');

  return {
    paths: areas.map(({ iso }) => ({
      params: {
        iso,
      },
    })),
    fallback: false,
  };
}
