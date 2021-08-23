// actions
import { getFaqs } from 'redactions/admin/faqs';

// hoc
import {
  withRedux,
  withUserServerSide,
  withBasicAuth,
} from 'hoc/auth';

// components
import LayoutFaqs from 'layout/app/faqs';

export default function FaqsPage() {
  return (<LayoutFaqs />);
}

export const getServerSideProps = withBasicAuth(withRedux(withUserServerSide(async ({ store }) => {
  const { getState, dispatch } = store;
  const { faqs: { list } } = getState();

  if (!list.length) await dispatch(getFaqs());

  return ({
    props: ({}),
  });
})));
