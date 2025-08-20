"use client";
import { useState } from "react";

export default function TermsAndConditions() {
  const [activeSection, setActiveSection] = useState("overview");

  const sections = [
    { id: "overview", title: "Overview & Acceptance" },
    { id: "definitions", title: "Definitions" },
    { id: "eligibility", title: "Eligibility" },
    { id: "how-to-enter", title: "How to Enter" },
    { id: "requirements", title: "Submission Requirements" },
    { id: "content", title: "Content Standards & IP" },
    { id: "judging", title: "Judging & Selection" },
    { id: "voting", title: "Public Voting" },
    { id: "prizes", title: "Prizes & Payments" },
    { id: "odds", title: "Odds of Winning" },
    { id: "licenses", title: "Licenses & Ownership" },
    { id: "warranties", title: "Warranties & Indemnity" },
    { id: "videos", title: "Finale Videos" },
    { id: "conduct", title: "Conduct & Disqualification" },
    { id: "under-18", title: "Under-18 Entrants" },
    { id: "privacy", title: "Privacy & Data Use" },
    { id: "liability", title: "Liability & Disclaimer" },
    { id: "changes", title: "Changes & Cancellation" },
    { id: "platform", title: "Platform Independence" },
    { id: "governing", title: "Governing Law & Disputes" },
    { id: "contact", title: "Contact" },
    { id: "acceptance", title: "Acceptance" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="bg-conces-blue text-white rounded-xl p-6 mb-8 shadow-lg">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            Terms & Conditions
          </h1>
          <p className="text-conces-gold font-medium">
            CONCES Logo Rebrand Challenge
          </p>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-4 gap-2">
            <p className="text-primary-200">Effective date: August 2025</p>
            <p className="text-primary-200">
              Website: brandchallenge.conces.org
            </p>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Table of Contents */}
          <div className="lg:w-1/4">
            <div className="bg-white rounded-xl p-6 shadow-md sticky top-6">
              <h2 className="text-xl font-bold text-conces-blue mb-4">
                Table of Contents
              </h2>
              <ul className="space-y-2">
                {sections.map((section) => (
                  <li key={section.id}>
                    <button
                      onClick={() => setActiveSection(section.id)}
                      className={`w-full text-left py-2 px-4 rounded-lg transition-all ${
                        activeSection === section.id
                          ? "bg-conces-blue text-white"
                          : "text-conces-blue hover:bg-primary-100"
                      }`}
                    >
                      {section.title}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Content */}
          <div className="lg:w-3/4">
            <div className="bg-white rounded-xl p-6 md:p-8 shadow-md">
              {/* Overview & Acceptance */}
              {activeSection === "overview" && (
                <div>
                  <h2 className="text-2xl font-bold text-conces-blue mb-4">
                    1. Overview & Acceptance
                  </h2>
                  <p className="mb-4 text-gray-700">
                    These Terms & Conditions govern participation in the CONCES
                    Logo Rebrand Challenge ("Contest"). By submitting an entry,
                    you confirm you have read, understood, and agree to be bound
                    by these Terms, the Contest Rules posted on the website, and
                    any instructions we issue during the Contest.
                  </p>
                  <div className="bg-primary-50 p-4 rounded-lg border-l-4 border-conces-blue">
                    <p className="font-medium text-conces-blue">
                      Organizer ("we", "us"):
                    </p>
                    <p>
                      Conference of Nigerian Christian Engineering Students
                      (CONCES)
                    </p>
                    <p className="font-medium text-conces-blue mt-2">
                      Contact:
                    </p>
                    <p>goodnews@conces.org</p>
                  </div>
                </div>
              )}

              {/* Definitions */}
              {activeSection === "definitions" && (
                <div>
                  <h2 className="text-2xl font-bold text-conces-blue mb-4">
                    2. Definitions
                  </h2>
                  <ul className="list-disc pl-5 space-y-2 text-gray-700">
                    <li>
                      <span className="font-medium text-conces-blue">
                        Entrant:
                      </span>{" "}
                      A person who submits an entry to the Contest.
                    </li>
                    <li>
                      <span className="font-medium text-conces-blue">
                        Finalist:
                      </span>{" "}
                      An Entrant selected by judges for the public voting phase.
                    </li>
                    <li>
                      <span className="font-medium text-conces-blue">
                        Winner(s):
                      </span>{" "}
                      Entrants selected for prizes at the Grand Finale.
                    </li>
                    <li>
                      <span className="font-medium text-conces-blue">
                        Entry:
                      </span>{" "}
                      All materials you submit, including images, source files,
                      descriptions, and optional videos.
                    </li>
                  </ul>
                </div>
              )}

              {/* Eligibility */}
              {activeSection === "eligibility" && (
                <div>
                  <h2 className="text-2xl font-bold text-conces-blue mb-4">
                    3. Eligibility
                  </h2>
                  <ul className="list-disc pl-5 space-y-2 text-gray-700">
                    <li>
                      Open only to current students of engineering or technology
                      faculties in Nigerian higher institutions (universities,
                      polytechnics, colleges of technology).
                    </li>
                    <li>Geographic limitation: Nigeria.</li>
                    <li>
                      Age: If you are under 18, a parent/guardian must consent
                      (see Section 15).
                    </li>
                    <li>
                      Ineligible parties: CONCES directors, officers, employees,
                      judges, and their immediate family/household members are
                      not eligible to enter.
                    </li>
                    <li>
                      You must use accurate personal details; we may verify with
                      your department/institution.
                    </li>
                    <li>
                      One entry per person or team. If a team enters, one
                      individual must be the lead contact.
                    </li>
                  </ul>
                </div>
              )}

              {/* How to Enter */}
              {activeSection === "how-to-enter" && (
                <div>
                  <h2 className="text-2xl font-bold text-conces-blue mb-4">
                    4. How to Enter
                  </h2>
                  <ul className="list-disc pl-5 space-y-2 text-gray-700">
                    <li>
                      Complete the online sign-up form and submit your logo
                      files by the stated deadline on the Contest site.
                    </li>
                    <li>
                      Entry is by online form and digital file upload only.
                      Social media actions are not required to enter or win -
                      You can use social media to get attention to vote on the
                      site. Mail-in entries are not accepted.
                    </li>
                    <li>
                      No purchase necessary. There is no fee to enter or win.
                    </li>
                    <li>
                      Late, corrupt, or unreadable files may be rejected at our
                      discretion.
                    </li>
                  </ul>
                </div>
              )}

              {/* Submission Requirements */}
              {activeSection === "requirements" && (
                <div>
                  <h2 className="text-2xl font-bold text-conces-blue mb-4">
                    5. Submission Requirements (Design Deliverables)
                  </h2>
                  <ul className="list-disc pl-5 space-y-2 text-gray-700">
                    <li>
                      Preview image: PNG or JPG (transparent background
                      preferred), at least 2000 px wide.
                    </li>
                    <li>
                      Source file: SVG or PDF (preferred) OR AI/PSD/Figma
                      package.
                    </li>
                    <li>Optional wordmark/lockup if part of your concept.</li>
                    <li>
                      Concept note: 100–200 words explaining idea, symbolism,
                      and fit with CONCES.
                    </li>
                    <li>
                      Mockup image (e.g., T-shirt, notebook, website header).
                    </li>
                    <li>
                      File naming:
                      lastname_firstname_school_CONCES_logo.(png/svg/pdf)
                    </li>
                  </ul>
                </div>
              )}

              {/* Content Standards & IP */}
              {activeSection === "content" && (
                <div>
                  <h2 className="text-2xl font-bold text-conces-blue mb-4">
                    6. Content Standards & IP Safety
                  </h2>
                  <ul className="list-disc pl-5 space-y-2 text-gray-700">
                    <li>
                      Your Entry must be your original work and must not
                      infringe third-party rights.
                    </li>
                    <li>
                      You are responsible for securing rights to any fonts or
                      assets used. Do not include materials you cannot license
                      to CONCES.
                    </li>
                    <li>
                      AI-assisted work is allowed only if you have full rights
                      to all outputs and inputs. You remain responsible for
                      originality and compliance.
                    </li>
                    <li>
                      Harassment, hate, or inappropriate content is prohibited
                      and may result in disqualification.
                    </li>
                  </ul>
                </div>
              )}

              {/* Judging & Selection */}
              {activeSection === "judging" && (
                <div>
                  <h2 className="text-2xl font-bold text-conces-blue mb-4">
                    7. Judging & Selection
                  </h2>
                  <ul className="list-disc pl-5 space-y-2 text-gray-700">
                    <li>
                      Judges shortlist approximately 20 Finalists from eligible
                      Entries.
                    </li>
                    <li>
                      Final results use combined scoring: Judges (60%) + Public
                      Votes (40%).
                    </li>
                    <li>
                      Judging criteria (weights): Relevance to CONCES (20%),
                      Creativity & Originality (20%), Simplicity & Memorability
                      (15%), Versatility & Scalability (15%), Technical
                      Execution (15%), Concept/Rationale (15%).
                    </li>
                    <li>
                      In the event of a tie or irregularity, judges' decision is
                      final.
                    </li>
                  </ul>
                </div>
              )}

              {/* Public Voting */}
              {activeSection === "voting" && (
                <div>
                  <h2 className="text-2xl font-bold text-conces-blue mb-4">
                    8. Public Voting
                  </h2>
                  <ul className="list-disc pl-5 space-y-2 text-gray-700">
                    <li>
                      Only Finalists appear in the Voting Suite on the Contest
                      site.
                    </li>
                    <li>
                      Voting window: as posted on the site. Limit: one (1) vote
                      per person.
                    </li>
                    <li>
                      We may audit, delay, hide, or remove suspicious votes and
                      disqualify Entries for fraud, bots, or manipulation.
                    </li>
                    <li>We may hide running vote totals to reduce bias.</li>
                  </ul>
                </div>
              )}

              {/* Prizes & Payments */}
              {activeSection === "prizes" && (
                <div>
                  <h2 className="text-2xl font-bold text-conces-blue mb-4">
                    9. Prizes & Payments
                  </h2>
                  <p className="mb-4 text-gray-700">
                    Prizes (subject to verification):
                  </p>
                  <ul className="list-disc pl-5 space-y-2 text-gray-700">
                    <li>Grand Prize: ₦500,000 (one winner)</li>
                    <li>Second Prize: ₦150,000 (one winner)</li>
                    <li>Third Prize: ₦100,000 (one winner)</li>
                    <li>Finalist Awards: ₦50,000 each (up to 7 finalists)</li>
                    <li>Other consolation prizes</li>
                  </ul>
                  <p className="mt-4 text-gray-700">
                    Prizes are not transferable or exchangeable. If a listed
                    prize becomes unavailable, we may substitute a prize of
                    equal or greater value.
                  </p>
                  <p className="mt-2 text-gray-700">
                    Winners may be required to provide ID, student verification,
                    bank details, and sign required documents.
                  </p>
                  <p className="mt-2 text-gray-700">
                    Payment method: bank transfer. Timing: within 14 business
                    days after verification and completion of documents.
                  </p>
                  <p className="mt-2 text-gray-700">
                    Taxes or charges (if any) are the responsibility of the
                    recipient.
                  </p>
                </div>
              )}

              {/* Odds of Winning */}
              {activeSection === "odds" && (
                <div>
                  <h2 className="text-2xl font-bold text-conces-blue mb-4">
                    10. Odds of Winning
                  </h2>
                  <p className="text-gray-700">
                    This is a skill-based contest with a public voting
                    component. Odds of winning are not applicable; winners are
                    determined by the published scoring method.
                  </p>
                </div>
              )}

              {/* Licenses & Ownership */}
              {activeSection === "licenses" && (
                <div>
                  <h2 className="text-2xl font-bold text-conces-blue mb-4">
                    11. Licenses & Ownership
                  </h2>

                  <h3 className="text-xl font-semibold text-conces-blue mt-4 mb-2">
                    A) For all Entrants
                  </h3>
                  <p className="text-gray-700">
                    By submitting, you grant CONCES a non-exclusive,
                    royalty-free, worldwide, perpetual license to use,
                    reproduce, display, and share your Entry for judging,
                    marketing, publicity, livestreams, and archival purposes
                    related to this Contest. You retain ownership of your work.
                  </p>

                  <h3 className="text-xl font-semibold text-conces-blue mt-4 mb-2">
                    B) For Finalists
                  </h3>
                  <p className="text-gray-700">
                    Finalists grant the same license as above and consent to use
                    of their name, school, and Entry in press releases, social
                    posts, livestreams, and recap content. Ownership is retained
                    unless you become the Winner.
                  </p>

                  <h3 className="text-xl font-semibold text-conces-blue mt-4 mb-2">
                    C) For the Winner (exclusive)
                  </h3>
                  <p className="text-gray-700">
                    As a condition of receiving the prize, the Winner agrees to
                    assign and transfer to CONCES all rights, title, and
                    interest in the winning logo and related assets, including
                    copyright. The Winner will deliver editable source files and
                    any fonts or alternatives CONCES can legally use. The Winner
                    waives any rights to object to reasonable adaptations or
                    modifications. CONCES may register and enforce trademarks
                    based on the winning design. No further payment is due
                    beyond the published prize unless agreed in writing.
                  </p>
                </div>
              )}

              {/* Warranties & Indemnity */}
              {activeSection === "warranties" && (
                <div>
                  <h2 className="text-2xl font-bold text-conces-blue mb-4">
                    12. Warranties & Indemnity
                  </h2>
                  <p className="text-gray-700">
                    You warrant that your Entry is original and that you have
                    all necessary rights and permissions.
                  </p>
                  <p className="mt-2 text-gray-700">
                    You agree to indemnify and hold harmless CONCES from claims,
                    losses, and costs arising out of breach of these warranties.
                  </p>
                </div>
              )}

              {/* Finale Videos */}
              {activeSection === "videos" && (
                <div>
                  <h2 className="text-2xl font-bold text-conces-blue mb-4">
                    13. Finale Videos
                  </h2>
                  <p className="text-gray-700">
                    Finalists may be asked to submit a 60–90 second video (e.g.,
                    Unlisted YouTube link). By submitting, you grant us
                    permission to download, lightly edit for technical fit, and
                    broadcast the video during the live event and in recap
                    content.
                  </p>
                </div>
              )}

              {/* Conduct & Disqualification */}
              {activeSection === "conduct" && (
                <div>
                  <h2 className="text-2xl font-bold text-conces-blue mb-4">
                    14. Conduct & Disqualification
                  </h2>
                  <p className="text-gray-700">
                    We may, at our discretion, remove or disqualify any Entry
                    that breaches these Terms, university policy, or applicable
                    law; contains inappropriate content; or is associated with
                    fraudulent activity or vote manipulation.
                  </p>
                </div>
              )}

              {/* Under-18 Entrants */}
              {activeSection === "under-18" && (
                <div>
                  <h2 className="text-2xl font-bold text-conces-blue mb-4">
                    15. Under-18 Entrants
                  </h2>
                  <p className="text-gray-700">
                    If you are under 18, a parent/guardian must consent to your
                    participation and, if you are the Winner, to the assignment
                    of rights described in Section 11(C).
                  </p>
                </div>
              )}

              {/* Privacy & Data Use */}
              {activeSection === "privacy" && (
                <div>
                  <h2 className="text-2xl font-bold text-conces-blue mb-4">
                    16. Privacy & Data Use
                  </h2>
                  <p className="text-gray-700">
                    We collect and process personal data to administer the
                    Contest, verify eligibility, communicate with Entrants, and
                    share results and related opportunities. We do not sell your
                    data.
                  </p>
                </div>
              )}

              {/* Liability & Disclaimer */}
              {activeSection === "liability" && (
                <div>
                  <h2 className="text-2xl font-bold text-conces-blue mb-4">
                    17. Liability & Disclaimer
                  </h2>
                  <p className="text-gray-700">
                    To the extent permitted by law, CONCES is not responsible
                    for lost, late, misdirected, corrupted, or incomplete
                    entries; technical failures; or platform outages beyond our
                    control. Our liability is limited to re-running the process
                    or replacing the prize.
                  </p>
                </div>
              )}

              {/* Changes & Cancellation */}
              {activeSection === "changes" && (
                <div>
                  <h2 className="text-2xl font-bold text-conces-blue mb-4">
                    18. Changes, Cancellation & Force Majeure
                  </h2>
                  <p className="text-gray-700">
                    We may update these Terms, adjust dates, or cancel the
                    Contest if necessary (e.g., due to technical issues, low
                    participation, or events beyond our reasonable control). Any
                    changes will be posted on the Contest site and take effect
                    upon posting unless stated otherwise.
                  </p>
                </div>
              )}

              {/* Platform Independence */}
              {activeSection === "platform" && (
                <div>
                  <h2 className="text-2xl font-bold text-conces-blue mb-4">
                    19. Platform Independence
                  </h2>
                  <p className="text-gray-700">
                    This Contest is not sponsored, endorsed, administered by, or
                    associated with any social media platform (including Meta,
                    X, YouTube). You release those platforms from any liability
                    related to this Contest.
                  </p>
                </div>
              )}

              {/* Governing Law & Disputes */}
              {activeSection === "governing" && (
                <div>
                  <h2 className="text-2xl font-bold text-conces-blue mb-4">
                    20. Governing Law & Disputes
                  </h2>
                  <p className="text-gray-700">
                    These Terms are governed by the laws of Nigeria. Any dispute
                    will be handled under Nigerian law and, where applicable, in
                    Nigerian courts.
                  </p>
                </div>
              )}

              {/* Contact */}
              {activeSection === "contact" && (
                <div>
                  <h2 className="text-2xl font-bold text-conces-blue mb-4">
                    21. Contact
                  </h2>
                  <p className="text-gray-700">
                    Questions? Email: goodnews@conces.org
                  </p>
                </div>
              )}

              {/* Acceptance */}
              {activeSection === "acceptance" && (
                <div>
                  <h2 className="text-2xl font-bold text-conces-blue mb-4">
                    22. Acceptance
                  </h2>
                  <p className="text-gray-700">
                    By submitting an Entry (and, if applicable, a Finale video),
                    you confirm that you have read and accepted these Terms &
                    Conditions.
                  </p>
                </div>
              )}

              {/* Navigation buttons */}
              <div className="flex justify-between mt-8 pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    const currentIndex = sections.findIndex(
                      (s) => s.id === activeSection
                    );
                    if (currentIndex > 0)
                      setActiveSection(sections[currentIndex - 1].id);
                  }}
                  className="px-4 py-2 bg-conces-blue text-white rounded-lg hover:bg-conces-blue/90 disabled:opacity-50"
                  disabled={activeSection === "overview"}
                >
                  Previous
                </button>

                <button
                  onClick={() => {
                    const currentIndex = sections.findIndex(
                      (s) => s.id === activeSection
                    );
                    if (currentIndex < sections.length - 1)
                      setActiveSection(sections[currentIndex + 1].id);
                  }}
                  className="px-4 py-2 bg-conces-gold text-conces-blue rounded-lg hover:bg-conces-gold/90 disabled:opacity-50"
                  disabled={activeSection === "acceptance"}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
