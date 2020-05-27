import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { toastr } from 'react-redux-toastr';
import classnames from 'classnames';

// Components
import DashboardWidgetCard from 'layout/app/dashboard-detail/dashboard-widget-card';
import PowerGenerationMap from '../power-generation-map';

// Services
import { fetchWidget } from 'services/widget';

// Constants
import { WORLD_COUNTRY } from 'layout/app/dashboard-detail/energy-country-explorer/constants';

// Styles
import './styles.scss';

function CustomSection(props) {
  const { section, bbox, country } = props;
  const { widgets, header, description, map, groups, mapTitle, widgetsWorld } = section;
  const countryIsWorld = !country || (country && country.value === WORLD_COUNTRY.value);
  const widgetBlocks = countryIsWorld ? widgetsWorld : widgets;
  const [data, setData] = useState(null);
  const [widgetsLoading, setWidgetsLoading] = useState(false);

  useEffect(() => {
    if (widgetBlocks) {
      const promises = widgetBlocks.map(wB => fetchWidget(wB.id, { includes: 'metadata' }));
      Promise.all(promises)
        .then((responses) => {
          if (!countryIsWorld) {
            const reducedResult = responses.reduce((acc, resp) => {
              if (resp.widgetConfig.type === 'embed') {

                // TO-DO: we should change the swipe viz here if necessary to adjust
                // the map position to the country selected
                return ({ ...acc, [resp.id]: resp });
              } else if (resp.widgetConfig.type === 'ranking') {

                // temporary implementation for ranking widgets
                let countryName = country.label;
                const key = resp.widgetConfig.sql_config[0].key_params[0].key;

                // --- This patch is necessary since this country name varies for some datasets ----
                if (country.label === 'United States of America') {
                  countryName = 'United States';
                }
                //-----------------------------------------------------------------------------------

                const newURL = resp.widgetConfig.url.replace(new RegExp(
                  '{{where}}', 'g'), `WHERE ${key} = '${countryName}'`);

                const newWidgetConfig = {
                  ...resp.widgetConfig,
                  url: newURL
                };

                const newWidget = {
                  ...resp,
                  widgetConfig: newWidgetConfig
                }

                return ({ ...acc, [resp.id]: newWidget });

              } else {
                const visualizationType = resp.widgetConfig.paramsConfig.visualizationType;
                if (visualizationType === 'chart') {
                  const key = resp.widgetConfig.sql_config[0].key_params[0].key;
                  const isISO = key === 'country_code';
                  const dataObj = resp.widgetConfig.data[0];
                  let countryName = country.label;

                  // --- This patch is necessary since this country name varies for some datasets ----
                  if (country.label === 'United States of America') {
                    countryName = 'United States';
                  }
                  //------------------------------------------------------------------------------------

                  const newDataObj = {
                    ...dataObj,
                    url: dataObj.url.replace(new RegExp(
                      '{{where}}', 'g'), `WHERE ${key} IN ('${isISO ? country.value : countryName}')`)
                  };

                  const newWidgetConfig = {
                    ...resp.widgetConfig,
                    data: [newDataObj, ...resp.widgetConfig.data.slice(1, dataObj.length)]
                  };

                  const newWidget = {
                    ...resp,
                    widgetConfig: newWidgetConfig
                  }

                  return ({ ...acc, [resp.id]: newWidget });
                } else if (visualizationType === 'map') {
                  // Replacing Bounding box with that from the selected country                
                  const newWidgetConfig = {
                    ...resp.widgetConfig,
                    bbox
                  };
                  const newWidget = {
                    ...resp,
                    widgetConfig: newWidgetConfig
                  }
                  return ({ ...acc, [resp.id]: newWidget });
                }
              }
            }, {});

            setData(reducedResult);
          } else {
            setData(responses.reduce((acc, resp) => ({ ...acc, [resp.id]: resp }), {}));
          }
          setWidgetsLoading(false);
        })
        .catch(err => {
          toastr.error(`Error loading widget ${err}`);
          console.error(err);
        });
    }
  }, [country]);

  return (
    <div className="c-custom-section l-section">
      <div className="l-container">
        <div className="row">
          <div className="column small-12">
            <div className="text-container">
              <h2>{header}</h2>
              <p>{description}</p>
            </div>
            {!map &&
              <div className="row">
                {widgetBlocks && widgetBlocks.map(wB => {
                  const widgetBlockClassName = classnames({
                    column: true,
                    'small-12': true,
                    'medium-6': wB.widgetsPerRow === 2,
                    'large-4': wB.widgetsPerRow === 3
                  });
                  return (<div className={widgetBlockClassName}>
                    <DashboardWidgetCard
                      widget={data && data[wB.id]}
                      loading={widgetsLoading}
                      key={`dashboard-widget-card-${wB.id}`}
                    />
                  </div>);
                })}
              </div>
            }
            {map &&
              <PowerGenerationMap
                groups={groups}
                mapTitle={mapTitle}
                bbox={bbox}
              />
            }
          </div>
        </div>
      </div>
    </div>
  );
}

CustomSection.propTypes = {
  section: PropTypes.object.isRequired,
  country: PropTypes.object.isRequired,
  bbox: PropTypes.array
};

CustomSection.defaultProps = {
  bbox: []
};

export default CustomSection;
