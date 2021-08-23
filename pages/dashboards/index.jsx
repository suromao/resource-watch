import PropTypes from 'prop-types';

// hoc
import {
  withRedux,
  withUserServerSide,
  withBasicAuth,
} from 'hoc/auth';

// services
import {
  fetchPage,
} from 'services/pages';

// components
import LayoutDashboards from 'layout/app/dashboards';

export default function DashboardsPage({ dataPage }) {
  return (<LayoutDashboards dataPage={dataPage} />);
}

export const getServerSideProps = withBasicAuth(withRedux(withUserServerSide(async () => {
  const dataPage = await fetchPage('dashboards');

  return ({
    props: ({
      dataPage,
    }),
  });
})));

DashboardsPage.propTypes = {
  dataPage: PropTypes.shape({}).isRequired,
};
