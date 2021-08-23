// actions
import { getStaticPage } from 'modules/static-pages/actions';

// hoc
import {
  withRedux,
  withUserServerSide,
  withBasicAuth,
} from 'hoc/auth';

// components
import LayoutTermsOfService from 'layout/app/terms-of-service';

export default function TermsOfServicePage() {
  return (<LayoutTermsOfService />);
}

export const getServerSideProps = withBasicAuth(withRedux(withUserServerSide(async ({ store }) => {
  const { getState, dispatch } = store;
  const { staticPages } = getState();

  if (!Object.keys(staticPages['terms-of-service']).length) await dispatch(getStaticPage('terms-of-service'));

  return ({
    props: ({}),
  });
})));
