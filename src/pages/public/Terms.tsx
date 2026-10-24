import React from 'react';
import { FileText } from 'lucide-react';
import { PolicyLayout, PolicySection } from '../../components/layout/PolicyLayout';

export default function Terms() {
  return (
    <PolicyLayout
      icon={<FileText className="h-7 w-7" />}
      eyebrow="Legal"
      title="Terms & Conditions"
      subtitle="Last updated: 11 October 2026"
    >
      <PolicySection title="1. Acceptance of terms">
        By creating an account, applying for admission, or using the Hostel Monarch platform, you agree to
        these Terms & Conditions and to the hostel's internal rules communicated at the time of admission.
      </PolicySection>
      <PolicySection title="2. Eligibility & accounts">
        Student accounts are created on admission approval; staff accounts are created on verification by
        hostel administration. You are responsible for keeping your login credentials confidential and for
        all activity under your account.
      </PolicySection>
      <PolicySection title="3. Fees & payments">
        Hostel and mess fees are due by the dates shown on your invoice. Fees paid through the platform are
        processed via a licensed third-party payment gateway. Fee structures, applicable semester-wise
        charges and due dates are communicated through the platform and may be revised by hostel management
        with reasonable notice.
      </PolicySection>
      <PolicySection title="4. Room allocation & conduct">
        Room/bed allocation is at the discretion of hostel administration based on availability. Residents
        must comply with hostel rules regarding conduct, visitors, curfew, and safety. Violations may result
        in disciplinary action, including termination of residency, per the hostel's code of conduct.
      </PolicySection>
      <PolicySection title="5. Leave & gate passes">
        Leave requests must be submitted and approved through the platform before departure. Digital gate
        passes are issued for approved leave only and must be presented at the security gate. Misuse of
        gate passes may result in disciplinary action.
      </PolicySection>
      <PolicySection title="6. Platform availability">
        We aim to keep the platform available at all times but do not guarantee uninterrupted access. Planned
        maintenance or unforeseen outages may temporarily affect availability.
      </PolicySection>
      <PolicySection title="7. Limitation of liability">
        Hostel Monarch is not liable for indirect or consequential losses arising from use of the platform,
        to the maximum extent permitted by law. Nothing in these terms limits liability that cannot be
        excluded under applicable Indian law.
      </PolicySection>
      <PolicySection title="8. Changes to these terms">
        We may update these terms from time to time. Continued use of the platform after changes constitutes
        acceptance of the revised terms.
      </PolicySection>
      <PolicySection title="9. Governing law">
        These terms are governed by the laws of India, with courts in Surat, Gujarat having jurisdiction.
      </PolicySection>
    </PolicyLayout>
  );
}
