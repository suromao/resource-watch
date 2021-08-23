// hoc
import {
  withRedux,
  withUserServerSide,
  withAdminRole,
  withBasicAuth,
} from 'hoc/auth';

// components
import LayoutAdminTools from 'layout/admin/tools';

export default function AdminToolsPage() {
  return (<LayoutAdminTools />);
}

export const getServerSideProps = withBasicAuth(withRedux(withUserServerSide(withAdminRole())));
