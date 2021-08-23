// hoc
import {
  withBasicAuth,
} from 'hoc/auth';

// components
import LayoutNewsletterThankYou from 'layout/app/newsletter-thank-you';

export default function NewsletterThankYouPage() {
  return (<LayoutNewsletterThankYou />);
}

export const getServerSideProps = withBasicAuth;
