// hoc
import {
  withBasicAuth,
} from 'hoc/auth';

// components
import LayoutPulse from 'layout/app/pulse';

export default function PulsePage() {
  return (<LayoutPulse />);
}

export const getServerSideProps = withBasicAuth();
