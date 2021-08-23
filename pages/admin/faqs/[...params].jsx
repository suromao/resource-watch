// hoc
import {
  withRedux,
  withUserServerSide,
  withAdminRole,
  withBasicAuth,
} from 'hoc/auth';

// components
import LayoutAdminFaqsDetail from 'layout/admin/faqs-detail';

export default function AdminFaqsDetailPage() {
  return (<LayoutAdminFaqsDetail />);
}

export const getServerSideProps = withBasicAuth(withRedux(withUserServerSide(withAdminRole())));
