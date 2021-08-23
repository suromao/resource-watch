// hoc
import {
  withBasicAuth,
} from 'hoc/auth';

// components
import LayoutEmbedMapSwipe from 'layout/embed/map-swipe';

const EmbedMapSwipePage = () => (<LayoutEmbedMapSwipe />);

export const getServerSideProps = withBasicAuth;

export default EmbedMapSwipePage;
