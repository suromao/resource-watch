// actions
import { setEmbed, setWebshotMode } from 'redactions/common';

// hoc
import {
  withRedux,
  withUserServerSide,
  withBasicAuth,
} from 'hoc/auth';

// components
import LayoutEmbedSimilarDatasets from 'layout/embed/similar-datasets';

export default function EmbedSimilarDatasetsPage(props) {
  return (<LayoutEmbedSimilarDatasets {...props} />);
}

export const getServerSideProps = withBasicAuth(
  withRedux(withUserServerSide(async ({ store, query }) => {
    const { dispatch } = store;
    const {
      id,
      webshot,
    } = query;

    dispatch(setEmbed(true));
    if (webshot) dispatch(setWebshotMode(true));

    return ({
      props: ({
        id: [id],
      }),
    });
  })),
);
