import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";

export const metadata: Metadata = {
  title: "DMCA Policy",
  description: "Ferro's DMCA takedown policy and designated agent contact information.",
};

const EFFECTIVE_DATE = "August 24, 2026";

export default function DmcaPage() {
  return (
    <LegalPage title="DMCA Policy" effectiveDate={EFFECTIVE_DATE}>
      <p>
        Ferro Fleet LLC (&quot;Ferro&quot;) respects the intellectual
        property rights of others and expects users of the Service to do the
        same. Companies using Ferro operate public storefronts on which they
        upload vehicle photos and related content. This policy explains how
        to report content you believe infringes your copyright, and how
        Ferro responds, in accordance with the Digital Millennium Copyright
        Act (&quot;DMCA&quot;), 17 U.S.C. § 512.
      </p>

      <h2>1. Filing a Takedown Notice</h2>
      <p>
        If you believe content hosted on a Ferro-hosted storefront (for
        example, a vehicle photo) infringes your copyright, send a written
        notice to our designated agent (below) that includes, to the extent
        required by 17 U.S.C. § 512(c)(3):
      </p>
      <ul>
        <li>a physical or electronic signature of a person authorized to act on behalf of the copyright owner;</li>
        <li>identification of the copyrighted work claimed to have been infringed, or a representative list if multiple works are covered by one notice;</li>
        <li>identification of the material you claim is infringing, and information reasonably sufficient to let us locate it — such as the storefront URL (e.g., <code>joinferro.com/[company-slug]/[vehicle-id]</code>) or a screenshot;</li>
        <li>your contact information — name, address, telephone number, and email address;</li>
        <li>a statement that you have a good faith belief that use of the material in the manner complained of is not authorized by the copyright owner, its agent, or the law; and</li>
        <li>a statement, made under penalty of perjury, that the information in the notice is accurate and that you are authorized to act on behalf of the copyright owner.</li>
      </ul>
      <p>
        Notices that don&apos;t substantially comply with these requirements
        may not receive a response. We recommend consulting an attorney or
        the full text of 17 U.S.C. § 512 before filing a notice, as knowingly
        misrepresenting infringement can carry legal consequences.
      </p>

      <h2>2. Designated Agent</h2>
      <p>
        Ferro&apos;s designated agent for notice of claimed infringement
        under the DMCA is:
      </p>
      <p>
        <strong>DMCA Agent</strong>
        <br />
        Ferro Fleet LLC
        <br />
        Email: <a href="mailto:dmca@joinferro.com">dmca@joinferro.com</a>
      </p>
      <p>
        <em>
          Note: Ferro Fleet LLC&apos;s designated agent registration with the
          U.S. Copyright Office should be completed and its details
          reconciled with the contact information above before this policy
          is relied on for actual takedown notices.
        </em>
      </p>

      <h2>3. Our Response Process</h2>
      <p>Upon receiving a compliant notice, we will generally:</p>
      <ul>
        <li>review the notice for the required elements described above;</li>
        <li>remove or disable access to the identified material on the applicable Company&apos;s storefront;</li>
        <li>notify the Company that uploaded the material of the removal and the reason for it; and</li>
        <li>document the notice and our response.</li>
      </ul>

      <h2>4. Counter-Notification</h2>
      <p>
        If you are a Company whose content was removed and you believe it
        was removed in error or misidentification, you may submit a
        counter-notice to our designated agent that includes:
      </p>
      <ul>
        <li>your physical or electronic signature;</li>
        <li>identification of the material that was removed and its location before removal;</li>
        <li>a statement, under penalty of perjury, that you have a good faith belief the material was removed as a result of mistake or misidentification;</li>
        <li>your name, address, and telephone number; and</li>
        <li>a statement that you consent to the jurisdiction of the federal district court for your address (or, if outside the U.S., for any judicial district in which Ferro may be found), and that you will accept service of process from the person who filed the original notice.</li>
      </ul>
      <p>
        Upon receiving a valid counter-notice, we may, as required by the
        DMCA, forward it to the original complaining party. Unless that
        party informs us they have filed a court action to restrain the
        alleged infringer, we may restore the removed material within the
        timeframe the DMCA specifies.
      </p>

      <h2>5. Repeat Infringers</h2>
      <p>
        In appropriate circumstances, Ferro will terminate the accounts of
        Companies who are determined to be repeat infringers.
      </p>

      <h2>6. Safe Harbor</h2>
      <p>
        Ferro is a service provider within the meaning of 17 U.S.C. §
        512(k). Companies — not Ferro — upload and control the vehicle
        photos and other content on their public storefronts. Ferro does not
        select, initiate, or modify that content, and processes takedown
        notices in accordance with this policy in order to qualify for the
        safe harbor protections available under the DMCA. Nothing in this
        policy is an admission that any particular content is or is not
        infringing.
      </p>

      <h2>7. Contact</h2>
      <p>
        For DMCA notices, use the designated agent contact above. For other
        legal questions, contact{" "}
        <a href="mailto:legal@joinferro.com">legal@joinferro.com</a>.
      </p>
    </LegalPage>
  );
}
