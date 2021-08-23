// actions
import { getStaticPage } from 'modules/static-pages/actions';

// hoc
import {
  withRedux,
  withUserServerSide,
  withBasicAuth,
} from 'hoc/auth';

// components
import LayoutAttributionRequirements from 'layout/app/attribution-requirements';

export default function AttributionRequirementsPage() {
  return (<LayoutAttributionRequirements />);
}

export const getServerSideProps = withBasicAuth(withRedux(withUserServerSide(async ({ store }) => {
  await store.dispatch(getStaticPage('api-attribution-requirements'));

  return ({
    props: ({}),
  });
})));
