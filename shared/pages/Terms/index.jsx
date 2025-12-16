import React from 'react'
import styles from './style.css'

const Terms = () => {
  return (
    <div className={styles.terms}>
      <div className={styles.container}>
        <h1 className={styles.title}>1011 Terms of Service</h1>
        
        <section className={styles.section}>
          <h2>1. Introduction</h2>
          <p>
            Welcome to 1011 (1011). 1011 is a Web3 project platform (hereinafter referred to as the "Platform") designed to provide a form of compensation to users who have suffered losses (including liquidations) from cryptocurrency derivatives or contract trading. We allow users to submit evidence of their trading losses or liquidations ("Submissions") to be evaluated for eligibility to receive an airdrop of our specific native token ("Token").
          </p>
          <p>
            Before accessing or using the 1011 service, please read these Terms of Service (hereinafter referred to as "Terms") carefully. By accessing or using the 1011 service, you agree to comply with all provisions of these Terms. If you do not agree to these Terms, please immediately discontinue using the 1011 service.
          </p>
        </section>

        <section className={styles.section}>
          <h2>2. Definitions</h2>
          <ul>
            <li><strong>1011 Platform:</strong> Refers to the website, applications, and related services operated by 1011.</li>
            <li><strong>User:</strong> An individual or entity using the 1011 services.</li>
            <li><strong>Submission:</strong> Any information uploaded, submitted, and confirmed by a User through the 1011 Platform, including but not limited to trade loss screenshots, liquidation records, related transaction details, and wallet addresses, social media accounts, or email addresses used for verification.</li>
            <li><strong>Token:</strong> The specific cryptocurrency issued and used by the 1011 Platform, intended for distribution as a compensatory airdrop to eligible Users.</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2>3. Service Description</h2>
          <p>1011 provides the following services:</p>
          <ul>
            <li><strong>Loss Evidence Submission:</strong> Users can submit screenshots and related information regarding their contract trading losses or liquidations according to the Platform's guidelines.</li>
            <li><strong>User Verification:</strong> Users can register by binding a crypto wallet, social media account, or email, which serves as their identity for the Submission.</li>
            <li><strong>Token Compensation (Airdrop):</strong> The Platform will, according to its own rules, evaluate the validity of User Submissions. Eligible Users will qualify to receive an airdrop of a certain amount of 1011 Tokens.</li>
            <li><strong>Vesting and Acceleration Mechanism:</strong>
              <ul>
                <li><strong>Vesting Period:</strong> Airdropped Tokens received by Users will be subject to a vesting (or lock-up) period and cannot be immediately withdrawn or traded.</li>
                <li><strong>Referral Acceleration:</strong> Users can accelerate the unlocking or withdrawal timeline of their vested Tokens by inviting new users to register on the 1011 Platform and successfully complete a valid evidence Submission. Specific acceleration rules will be published by the Platform.</li>
              </ul>
            </li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2>4. User Rights and Obligations</h2>
          
          <h3>4.1 User Rights</h3>
          <ul>
            <li><strong>Ownership of Submissions:</strong> Users retain their original intellectual property rights to the content they upload (such as screenshots). However, the User hereby grants 1011 a worldwide, non-exclusive, royalty-free license to use, copy, distribute, and display their Submission for the purposes of operating the Platform, verifying information, statistical analysis (e.g., in an anonymized form), and marketing.</li>
            <li><strong>Privacy Protection:</strong> 1011 will strive to protect the privacy of User Submissions and personal information in accordance with our Privacy Policy.</li>
            <li><strong>Right to Use Services:</strong> Users have the right to use the loss submission and Token reception services provided by the 1011 Platform in accordance with these Terms.</li>
          </ul>

          <h3>4.2 User Obligations</h3>
          <ul>
            <li><strong>Authenticity and Legality:</strong> Users must guarantee that their Submissions are truthful, accurate, complete, legal, and pertain to their own trading records. The use of fabricated, tampered, stolen, or any form of false information is strictly prohibited.</li>
            <li><strong>Account Security:</strong> Users are solely responsible for safeguarding their account information (including passwords) and the security of their bound wallets, social media accounts, and emails. All losses incurred due to User negligence in protecting their account are borne solely by the User.</li>
            <li><strong>Single Account:</strong> Unless explicitly permitted by the Platform, each real User is limited to registering and operating one (1) 1011 account. The use of malicious multi-accounting, bots, or exploiting program vulnerabilities to gain improper benefits is prohibited.</li>
            <li><strong>Compliance:</strong> Users must comply with their local laws and regulations and pledge not to use the 1011 service for any illegal activities, including but not limited to money laundering, terrorist financing, or fraud.</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2>5. Token Airdrop and Referral Mechanism</h2>
          <ul>
            <li><strong>Airdrop Eligibility:</strong> 1011 reserves the final right of decision and interpretation regarding all airdrop rules, eligibility criteria, and distribution amounts. Not all Users who submit evidence are guaranteed to receive an airdrop.</li>
            <li><strong>Vesting Rules:</strong> All airdropped Tokens are subject to a vesting period. The specific vesting and unlocking rules (including schedules and conditions) will be published on the 1011 Platform and may be adjusted at any time.</li>
            <li><strong>Referral Validity:</strong> The effectiveness of the referral acceleration mechanism is dependent on the referred party being a genuine new User who completes registration and a valid evidence Submission (as defined by the project).</li>
            <li><strong>Anti-Fraud:</strong> 1011 has the right to strictly review all Submissions and referral activities. Any behavior deemed by the Platform to be fraudulent, cheating, botting (sybil-attacking), or in violation of Article 4.2 (e.g., submitting false information, malicious multi-accounting) will result in 1011's right to immediately cancel the User's (and any associated accounts') airdrop eligibility, acceleration benefits, revoke any issued Tokens, and suspend or terminate their account.</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2>6. Fees</h2>
          <ul>
            <li><strong>Platform Fees:</strong> 1011 does not currently charge Users fees for submitting evidence or registering.</li>
            <li><strong>On-Chain Fees (Gas Fees):</strong> Users are solely responsible for paying any blockchain network transaction fees (e.g., Gas fees) incurred when claiming, transferring, withdrawing, or performing any on-chain operations related to the 1011 Token.</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2>7. Privacy and Security</h2>
          <ul>
            <li><strong>Information Processing:</strong> The User understands and agrees that their submitted screenshots and verification information will be collected and processed by 1011 for the purpose of verifying eligibility and distributing the airdrop.</li>
            <li><strong>Privacy Protection:</strong> 1011 commits not to sell or share Users' personally identifiable information (such as email or social media accounts) with non-affiliated third parties without the User's explicit consent, unless required by law, regulation, or a competent authority.</li>
            <li><strong>Security Responsibility:</strong> Users are responsible for the absolute security of their private keys, seed phrases, and the devices used to access 1011. 1011 is not liable for any loss of Tokens, information leakage, or account theft resulting from the User's failure to properly secure their access credentials.</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2>8. Disclaimer of Warranties</h2>
          <ul>
            <li><strong>Service Availability:</strong> 1011 does not guarantee that the service (including the website and airdrop claim functionality) will be continuous, timely, secure, or error-free.</li>
            <li><strong>Risk of Use:</strong> Users use the 1011 service at their own risk. 1011 is not liable for any loss of Submissions, airdropped Tokens, or acceleration benefits caused by network failures, hacks, viruses, force majeure, or any other reason.</li>
            <li><strong>Token Value:</strong> The 1011 Token (like any cryptocurrency) is subject to high volatility and its value may drop to zero. 1011 makes no express or implied guarantees or promises regarding the future value, market price, liquidity, or tradability of the Token. The airdrop received should not be considered investment advice.</li>
            <li><strong>Third-Party Risks:</strong> When using the 1011 service, Users may interact with third-party services (e.g., wallet providers, social media platforms, exchanges). 1011 is not responsible for the actions, services, or failures of any third party.</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2>9. Intellectual Property</h2>
          <ul>
            <li><strong>User Submissions:</strong> As stated in Article 4.1, Users retain their IP rights to Submissions but grant 1011 a necessary license to use them.</li>
            <li><strong>1011 Intellectual Property:</strong> The intellectual property rights and ownership of the 1011 Platform (including its protocol, software, code, design, trademarks, and all content) belong to the 1011 project team.</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2>10. Termination and Suspension</h2>
          <ul>
            <li><strong>Termination by User:</strong> Users may stop using the 1011 service at any time.</li>
            <li><strong>Termination by 1011:</strong> If a User violates these Terms (especially the authenticity and anti-fraud provisions in Articles 4.2 and 5.4) or applicable laws, 1011 reserves the right, at its sole discretion, to suspend or terminate the User's account and services at any time without notice.</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2>11. Dispute Resolution</h2>
          <ul>
            <li><strong>Governing Law:</strong> These Terms shall be governed by and construed in accordance with the laws of the State of California.</li>
            <li><strong>Dispute Resolution:</strong> Any dispute arising from or related to these Terms shall first be resolved through friendly negotiation. If negotiation fails, the dispute shall be submitted to arbitration in accordance with its then-effective arbitration rules.</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2>12. Amendments to Terms</h2>
          <p>
            1011 reserves the right to modify these Terms at any time. The revised Terms will be published on the 1011 official website or within the Platform and will take effect upon publication. Your continued use of the 1011 service after the amendments constitutes your acceptance of the revised Terms.
          </p>
        </section>

        <section className={styles.section}>
          <h2>13. Contact Us</h2>
          <p>
            If you have any questions about these Terms or the 1011 service, please contact us at: <a href="mailto:support@1011.wtf">support@1011.wtf</a>
          </p>
        </section>
      </div>
    </div>
  )
}

export default Terms
