// hoc
import {
  withRedux,
  withUserServerSide,
  withAdminRole,
  withBasicAuth,
} from 'hoc/auth';

// components
import LayoutAdminDataDetail from 'layout/admin/data-detail';

export default function AdminDataDetailPage() {
  return (<LayoutAdminDataDetail />);
}

export const getServerSideProps = withBasicAuth(withRedux(withUserServerSide(withAdminRole())));
