// actions
import { getPartners } from 'redactions/admin/partners';

// hoc
import {
  withRedux,
  withUserServerSide,
  withBasicAuth,
} from 'hoc/auth';

// components
import LayoutPartners from 'layout/app/partners';

export default function PartnersPage() {
  return (<LayoutPartners />);
}

export const getServerSideProps = withBasicAuth(withRedux(withUserServerSide(async ({ store }) => {
  const { dispatch, getState } = store;
  const { partners: { published } } = getState();

  if (!published.list.length) await dispatch(getPartners());

  return ({
    props: ({}),
  });
})));
