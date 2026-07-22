export const downloadUrl =
  process.env.NUXT_PUBLIC_DOWNLOAD_URL || 'https://github.com/ali111887/AuroraPad-Releases/releases'

export const legalPages = {
  terms: {
    kicker: 'Terms and Conditions',
    title: 'Terms and Conditions',
    summary:
      'These terms describe the baseline rules for using the AuroraPad website, downloading releases, and interacting with the public project information presented here.',
    appliesTo: 'Website, releases, and public project information',
    updatedAt: 'April 6, 2026',
    sections: [
      {
        title: '1. Scope',
        paragraphs: [
          'These terms apply to the AuroraPad website and publicly distributed release materials. They are intended to explain how visitors may access the website, download software releases, and interact with the project materials that are made available by the AuroraPad maintainers.',
          'If you are using AuroraPad source code, the applicable source-code license governs your rights to copy, modify, and redistribute that code. These website terms do not replace that license.',
        ],
      },
      {
        title: '2. Use of the Website and Releases',
        paragraphs: [
          'You may browse the website, read project information, and download publicly posted release assets for lawful purposes. You agree not to interfere with the availability, security, or normal operation of the website or release distribution channels.',
          'You are responsible for verifying that a downloaded release is appropriate for your environment and for reviewing the project materials before using AuroraPad in any production or organizational workflow.',
        ],
      },
      {
        title: '3. No Warranty for Public Information',
        paragraphs: [
          'The website and release materials are provided on an as-is basis. The maintainers do not guarantee uninterrupted availability, error-free operation, or fitness for a particular use case through the website content alone.',
          'Nothing on the website should be interpreted as professional legal, compliance, privacy, or security advice. Project materials may evolve over time and should be evaluated in their current form before reliance.',
        ],
      },
      {
        title: '4. Third-Party Platforms',
        paragraphs: [
          'AuroraPad may be distributed or referenced through third-party services such as GitHub and Vercel. Those services operate under their own terms and privacy practices, and AuroraPad maintainers are not responsible for third-party platform behavior outside the project-controlled website content.',
        ],
      },
    ],
  },
  privacy: {
    kicker: 'Privacy',
    title: 'Privacy Notice',
    summary:
      'This page explains the limited privacy expectations for the AuroraPad website and public release distribution pages.',
    appliesTo: 'Website visitors and release downloads',
    updatedAt: 'April 6, 2026',
    sections: [
      {
        title: '1. Data Collected Through the Website',
        paragraphs: [
          'AuroraPad does not currently present account creation, payment flows, or user profile management through this website. In general, the site is intended to be informational and to direct visitors to release assets and project information.',
          'Hosting providers, CDN services, or linked platforms may still process routine technical information such as IP addresses, request logs, browser information, or referral data as part of normal website delivery and security operations.',
        ],
      },
      {
        title: '2. Release Downloads and External Platforms',
        paragraphs: [
          'When you click download links, you may be transferred to GitHub or other third-party services. Those services control their own logging, cookies, analytics, and account systems. AuroraPad maintainers do not control those third-party privacy practices.',
        ],
      },
      {
        title: '3. Cookies and Analytics',
        paragraphs: [
          'This website uses a consent banner to manage optional Google Analytics and any future Google Tag Manager-based measurement. In stricter consent regions such as the EU, EEA, United Kingdom, and Switzerland, optional analytics are intended to remain disabled until a visitor explicitly opts in.',
          'Outside stricter consent regions, visitors are still given a privacy choice and can keep the site on essential-only mode. Search Console verification, when configured, is treated as a technical ownership-verification mechanism rather than advertising or behavioral profiling.',
        ],
      },
      {
        title: '4. Questions',
        paragraphs: [
          'For project-level questions about website content or release information, the release notes and current website content are the best public sources to review.',
        ],
      },
    ],
  },
  usage: {
    kicker: 'Usage Policy',
    title: 'Acceptable Usage',
    summary:
      'AuroraPad is intended for lawful software development, editing, and related project workflows. This page outlines the expected boundaries around public use of the website and software releases.',
    appliesTo: 'Website use and software usage expectations',
    updatedAt: 'April 6, 2026',
    sections: [
      {
        title: '1. Intended Use',
        paragraphs: [
          'AuroraPad is presented as a desktop editor for code, project navigation, terminal workflows, and release-oriented development tasks. It is intended for lawful engineering, writing, and development-related work.',
        ],
      },
      {
        title: '2. Prohibited Use',
        paragraphs: [
          'You should not use the website or software releases in ways that violate applicable law, harm third-party systems, distribute malware, abuse infrastructure, or misrepresent AuroraPad as a supported managed service when it is not being offered as one.',
          'You should not attempt to use the public release channels to overload hosting resources, scrape protected infrastructure, or interfere with the availability of the project website or release resources.',
        ],
      },
      {
        title: '3. Security and Verification',
        paragraphs: [
          'Before deploying AuroraPad in any sensitive or production-like environment, you should review the source code, release notes, and license terms directly. Public binaries should be validated according to your own security and compliance standards.',
        ],
      },
      {
        title: '4. Community Expectations',
        paragraphs: [
          'If you contribute, fork, or build on AuroraPad, the strongest default is transparency: keep changes reviewable, credit the project correctly, and preserve the legal and license information attached to the project.',
        ],
      },
    ],
  },
  license: {
    kicker: 'License',
    title: 'License Overview',
    summary:
      'AuroraPad source distribution is governed by the project license. This page summarizes that relationship and points visitors to the authoritative license file.',
    appliesTo: 'Source code and distribution rights',
    updatedAt: 'April 6, 2026',
    sections: [
      {
        title: '1. Authoritative License Source',
        paragraphs: [
          'The authoritative license text for AuroraPad is the LICENSE file distributed with the project source. If there is any difference between this page and the full license text, the full license file controls.',
          'At the time of this page update, the project source includes a GNU General Public License text in the root LICENSE file.',
        ],
      },
      {
        title: '2. What This Means in Practice',
        paragraphs: [
          'Your rights to use, modify, and redistribute AuroraPad source code depend on the actual license text and any related notices or third-party dependency licenses that apply to bundled components.',
          'If you plan to redistribute AuroraPad or incorporate parts of the project into another distribution, review the project license and any third-party license requirements carefully before proceeding.',
        ],
      },
      {
        title: '3. Third-Party Components',
        paragraphs: [
          'AuroraPad includes dependencies and frameworks that may be governed by their own licenses. Those third-party licenses remain applicable to the components they cover.',
        ],
      },
      {
        title: '4. Where to Review the Full Text',
        paragraphs: [
          'You can review the current license directly in the AuroraPad project source distribution. The full license file is the best place to confirm the latest licensing state before relying on any summary.',
        ],
      },
    ],
  },
} as const
