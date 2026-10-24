import React from 'react';
import { Wallet } from 'lucide-react';
import { PolicyLayout, PolicySection } from '../../components/layout/PolicyLayout';

export default function RefundPolicy() {
  return (
    <PolicyLayout
      icon={<Wallet className="h-7 w-7" />}
      eyebrow="Legal"
      title="Refund & Cancellation Policy"
      subtitle="Last updated: 11 October 2026"
    >
      <PolicySection title="1. Hostel fee payments">
        Hostel and mess fees paid through the platform are generally non-refundable once the billing period
        they cover has begun, except as described below or as required by applicable law.
      </PolicySection>
      <PolicySection title="2. Admission withdrawal before joining">
        If an admitted student withdraws before their joining/check-in date, any fees paid in advance are
        eligible for a refund minus a processing charge, as communicated at the time of admission. Refund
        requests should be raised with the accounts office through the Contact page.
      </PolicySection>
      <PolicySection title="3. Security deposit">
        The refundable security deposit collected at admission is returned after a student vacates the
        hostel, subject to deduction of any outstanding dues, unpaid fines, or damages to hostel property,
        as assessed by hostel administration.
      </PolicySection>
      <PolicySection title="4. Mid-term withdrawal">
        Students withdrawing mid-term for documented medical or academic transfer reasons may be eligible for
        a pro-rated refund of unused mess fees, at the discretion of hostel administration.
      </PolicySection>
      <PolicySection title="5. Failed or duplicate payments">
        If a payment is deducted from your account but not reflected as "Paid" on your invoice within a
        reasonable time, contact the accounts office with your transaction ID. Verified duplicate or failed
        transactions are refunded to the original payment method, typically within 5–7 business days,
        subject to the payment gateway's processing timelines.
      </PolicySection>
      <PolicySection title="6. How to request a refund">
        Email hello@hostelmonarch.in or use the Contact page with your student ID, invoice/transaction number,
        and reason for the refund request. Approved refunds are processed to the original payment source.
      </PolicySection>
    </PolicyLayout>
  );
}
