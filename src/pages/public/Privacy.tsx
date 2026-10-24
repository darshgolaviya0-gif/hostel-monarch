import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { PolicyLayout, PolicySection } from '../../components/layout/PolicyLayout';

export default function Privacy() {
  return (
    <PolicyLayout
      icon={<ShieldCheck className="h-7 w-7" />}
      eyebrow="Legal"
      title="Privacy Policy"
      subtitle="Last updated: 11 October 2026"
    >
      <PolicySection title="1. Who we are">
        Hostel Monarch ("we", "us", "our") operates a residential hostel and this companion digital platform for
        admissions, room allocation, fee collection, leave/gate-pass management, mess, visitor and complaint
        services. This policy explains what information we collect from students, parents/guardians and staff,
        and how we use it.
      </PolicySection>
      <PolicySection title="2. Information we collect">
        We collect information you provide directly — such as your name, contact details, academic details,
        guardian/emergency contact information, identity documents submitted during admission, and payment
        records — as well as information generated through your use of the platform, such as attendance,
        complaints, leave requests and gate-pass activity.
      </PolicySection>
      <PolicySection title="3. How we use your information">
        We use your information to operate the hostel: process admissions, allocate rooms, raise and collect
        fee invoices, manage leave and gate passes, respond to complaints, communicate notices, and maintain
        safety and security records (including gate entry/exit logs). We do not sell personal information to
        third parties.
      </PolicySection>
      <PolicySection title="4. Payment information">
        Fee payments are processed by a licensed third-party payment gateway. We do not store your full card,
        UPI PIN, or net-banking credentials on our servers — these are handled directly by the payment gateway
        under its own security and compliance standards (PCI-DSS where applicable).
      </PolicySection>
      <PolicySection title="5. Data sharing">
        We share information only with: hostel staff and wardens who need it to perform their duties, the
        payment gateway (for processing fee payments), and government/regulatory authorities where legally
        required (for example, local police verification for residential safety).
      </PolicySection>
      <PolicySection title="6. Data retention">
        We retain student and financial records for as long as your account is active and for a reasonable
        period afterward to meet legal, accounting and dispute-resolution requirements.
      </PolicySection>
      <PolicySection title="7. Your rights">
        You may request access to, correction of, or deletion of your personal information (subject to our
        legal recordkeeping obligations) by contacting us using the details on our Contact page.
      </PolicySection>
      <PolicySection title="8. Contact us">
        Questions about this policy can be sent to hello@hostelmonarch.in or to the address listed on our
        Contact page.
      </PolicySection>
    </PolicyLayout>
  );
}
