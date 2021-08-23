// hoc
import {
  withBasicAuth,
} from 'hoc/auth';

// components
import LayoutContactUs from 'layout/app/contact-us';

export default function ContactUsPage() {
  return (<LayoutContactUs />);
}

export const getServerSideProps = withBasicAuth;
