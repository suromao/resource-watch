// hoc
import {
  withRedux,
  withUserServerSide,
  withAdminRole,
  withBasicAuth,
} from 'hoc/auth';

// components
import LayoutAdminPartnersDetail from 'layout/admin/partners-detail';

export default function AdminPartnersDetailPage() {
  return (<LayoutAdminPartnersDetail />);
}

export const getServerSideProps = withBasicAuth(withRedux(withUserServerSide(withAdminRole())));
