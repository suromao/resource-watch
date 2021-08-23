// actions
import { getStaticPage } from 'modules/static-pages/actions';

// hoc
import {
  withRedux,
  withUserServerSide,
  withBasicAuth,
} from 'hoc/auth';

// component
import LayoutHowTo from 'layout/app/how-to';

export default function HowToPage() {
  return (<LayoutHowTo />);
}

export const getServerSideProps = withBasicAuth(withRedux(withUserServerSide(async ({ store }) => {
  const { getState, dispatch } = store;
  const { staticPages } = getState();

  if (!Object.keys(staticPages['how-to']).length) await dispatch(getStaticPage('how-to'));

  return ({
    props: ({}),
  });
})));
