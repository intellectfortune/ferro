import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";

export const metadata: Metadata = {
  title: "End User License Agreement",
  description: "Ferro's end user license agreement.",
};

const EFFECTIVE_DATE = "August 24, 2026";

export default function EulaPage() {
  return (
    <LegalPage title="End User License Agreement" effectiveDate={EFFECTIVE_DATE}>
      <p>
        This End User License Agreement (&quot;EULA&quot;) governs your use
        of the Ferro software and application (the &quot;Software&quot;),
        provided by Ferro Fleet LLC (&quot;Ferro,&quot; &quot;we,&quot;
        &quot;us&quot;). It is separate from, and supplements, our{" "}
        <a href="/terms">Terms of Service</a>, which govern your commercial
        relationship with us (billing, data handling, liability, etc.). This
        EULA specifically covers what you are and are not permitted to do
        with the Software itself. If there is a direct conflict between this
        EULA and the Terms of Service on a matter of software use, this EULA
        controls.
      </p>

      <h2>1. License Grant</h2>
      <p>
        Subject to your compliance with this EULA and the Terms of Service,
        Ferro grants you a limited, non-exclusive, non-transferable,
        revocable license to access and use the Software through your web
        browser, solely for your Company&apos;s internal business purposes
        of managing its rental vehicle fleet, for as long as your
        subscription remains active.
      </p>

      <h2>2. Permitted Use</h2>
      <p>You may:</p>
      <ul>
        <li>access the Software using accounts you create or are invited to;</li>
        <li>use the Software&apos;s features to manage your own Company&apos;s fleet, bookings, customers, documents, and related business data;</li>
        <li>connect your own third-party accounts (Stripe, Bouncie, DocuSign, PandaDoc) to the Software for your Company&apos;s use; and</li>
        <li>access the Software via standard, unmodified web browsers on devices you control.</li>
      </ul>

      <h2>3. Prohibited Use</h2>
      <p>You may not, and may not permit or assist anyone else to:</p>
      <ul>
        <li>copy, modify, translate, or create derivative works of the Software;</li>
        <li>reverse engineer, decompile, or disassemble the Software, except to the extent applicable law expressly permits despite this restriction;</li>
        <li>rent, lease, sell, sublicense, distribute, or otherwise make the Software available to any third party outside your own Company&apos;s authorized users;</li>
        <li>use automated means (bots, scrapers, crawlers) to access the Software outside of documented, authorized APIs;</li>
        <li>probe, scan, or test the vulnerability of the Software or any related system, or attempt to breach or circumvent any authentication or security measure, except as expressly permitted under a responsible-disclosure or bug-bounty process we&apos;ve authorized in writing;</li>
        <li>access or use the Software to build a competing product or service;</li>
        <li>use the Software to store, transmit, or process data you do not have the legal right to hold, or in a manner that violates the rights of any third party (including a renter or employee whose data you upload);</li>
        <li>attempt to access another Company&apos;s data, or circumvent the multi-tenant access controls that separate Companies&apos; data; or</li>
        <li>introduce viruses, malware, or other harmful code into the Software, or otherwise interfere with or disrupt its integrity or performance.</li>
      </ul>

      <h2>4. Third-Party Integrations</h2>
      <p>
        The Software may let you connect third-party accounts and services
        (for example, Stripe, Bouncie, DocuSign, PandaDoc, and Google Maps).
        Your use of those integrations is also governed by the applicable
        third party&apos;s own terms, and this EULA does not grant you any
        rights in those third-party services beyond what the integration
        itself provides within the Software.
      </p>

      <h2>5. Updates</h2>
      <p>
        Because the Software is a hosted, cloud-based service, we may update,
        modify, or change it at any time without requiring you to install
        anything. We are not obligated to maintain backward compatibility
        with every prior version of the Software&apos;s behavior, though we
        will make reasonable efforts to communicate material changes.
      </p>

      <h2>6. Ownership</h2>
      <p>
        The Software, including its source code, design, and all related
        intellectual property, is owned by Ferro Fleet LLC and its
        licensors. This EULA does not transfer any ownership rights to you.
        All rights not expressly granted are reserved.
      </p>

      <h2>7. Suspension of the License</h2>
      <p>
        We may suspend or terminate your license to use the Software
        immediately if you violate this EULA, in addition to any rights we
        have under the Terms of Service to suspend or terminate your
        account.
      </p>

      <h2>8. No Warranty; Limitation of Liability</h2>
      <p>
        The Software is licensed on an &quot;as is&quot; basis. The
        disclaimers, limitations of liability, and indemnification
        obligations in our <a href="/terms">Terms of Service</a> apply
        equally to this EULA and are incorporated here by reference.
      </p>

      <h2>9. Changes to This EULA</h2>
      <p>
        We may update this EULA from time to time. If we make material
        changes, we will provide reasonable notice before they take effect.
        Continued use of the Software after changes take effect constitutes
        acceptance of the updated EULA.
      </p>

      <h2>10. Contact</h2>
      <p>
        Questions about this EULA can be sent to{" "}
        <a href="mailto:legal@joinferro.com">legal@joinferro.com</a>.
      </p>
    </LegalPage>
  );
}
