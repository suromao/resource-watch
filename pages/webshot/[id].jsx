// services
import {
  fetchWidget,
} from 'services/widget';

// hoc
import {
  withBasicAuth,
} from 'hoc/auth';

export default function Webshot() {
  return null;
}

export const getServerSideProps = withBasicAuth(async ({ query }) => {
  const {
    id,
  } = query;

  const widget = await fetchWidget(id, {
    application: process.env.NEXT_PUBLIC_APPLICATIONS,
  });
  const { type } = widget?.widgetConfig || {};

  return ({
    props: ({}),
    redirect: {
      destination: `/embed/${type || 'widget'}/${id}?webshot=true`,
      permanent: true,
    },
  });
});
