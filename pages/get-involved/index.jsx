// actions
import { fetchStaticData } from 'layout/get-involved/get-involved-actions';

// hoc
import {
  withRedux,
  withUserServerSide,
  withBasicAuth,
} from 'hoc/auth';

// components
import GetInvolved from 'layout/get-involved';

export default function GetInvolvedPage() {
  return (<GetInvolved />);
}

export const getServerSideProps = withBasicAuth(withRedux(withUserServerSide(async ({ store }) => {
  const { dispatch } = store;

  await dispatch(fetchStaticData('get-involved'));

  return ({
    props: ({}),
  });
})));
