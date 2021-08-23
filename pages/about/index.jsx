// actions
import { getStaticPage } from 'modules/static-pages/actions';

// hoc
import {
  withRedux,
  withUserServerSide,
  withBasicAuth,
} from 'hoc/auth';

// components
import AboutLayout from 'layout/app/about';

export default function AboutPage() {
  return (<AboutLayout />);
}

export const getServerSideProps = withBasicAuth(withRedux(withUserServerSide(async ({ store }) => {
  await store.dispatch(getStaticPage('about'));

  return ({
    props: ({}),
  });
})));
