// hoc
import {
  withBasicAuth,
} from 'hoc/auth';

// components
import LayoutNewsletter from 'layout/app/newsletter';

export default function NewsletterPage() {
  return (<LayoutNewsletter />);
}

export const getServerSideProps = withBasicAuth;
