// hoc
import {
  withRedux,
  withUserServerSide,
  withAdminRole,
  withBasicAuth,
} from 'hoc/auth';

// components
import LayoutAdminData from 'layout/admin/data';

export default function AdminPage() {
  return (<LayoutAdminData />);
}

export const getServerSideProps = withBasicAuth(withRedux(withUserServerSide(withAdminRole())));
