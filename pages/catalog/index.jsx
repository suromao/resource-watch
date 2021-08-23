// hoc
import {
  withBasicAuth,
} from 'hoc/auth';

// components
import LayoutCatalog from 'layout/app/catalog';

export default function CatalogPage() {
  return (<LayoutCatalog />);
}

export const getServerSideProps = withBasicAuth;
