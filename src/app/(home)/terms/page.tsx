"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown, ChevronUp, Mail, Globe, Calendar } from "lucide-react";

const TermsAndConditions = () => {
  const [expandedSections, setExpandedSections] = useState<Set<number>>(
    new Set()
  );

  const toggleSection = (index: number) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedSections(newExpanded);
  };

  const expandAll = () => {
    setExpandedSections(new Set(Array.from({ length: 22 }, (_, i) => i)));
  };

  const collapseAll = () => {
    setExpandedSections(new Set());
  };

  const termsData = [
    {
      title: "Overview & Acceptance",
      content: `These Terms & Conditions govern participation in the CONCES Logo Rebrand Challenge ("Contest"). By submitting an entry, you confirm you have read, understood, and agree to be bound by these Terms, the Contest Rules posted on the website, and any instructions we issue during the Contest.`,
    },
    {
      title: "Definitions",
      content: `• Entrant: A person who submits an entry to the Contest.
• Finalist: An Entrant selected by judges for the public voting phase.
• Winner(s): Entrants selected for prizes at the Grand Finale.
• Entry: All materials you submit, including images, source files, descriptions, and optional videos.`,
    },
    {
      title: "Eligibility",
      content: `• Open only to current students of engineering or technology faculties in Nigerian higher institutions (universities, polytechnics, colleges of technology).
• Geographic limitation: Nigeria.
• Age: If you are under 18, a parent/guardian must consent (see Section 15).
• Ineligible parties: CONCES directors, officers, employees, judges, and their immediate family/household members are not eligible to enter.
• You must use accurate personal details; we may verify with your department/institution.
• One entry per person or team. If a team enters, one individual must be the lead contact.`,
    },
    {
      title: "How to Enter",
      content: `• Complete the online sign-up form and submit your logo files by the stated deadline on the Contest site.
• Entry is by online form and digital file upload only. Social media actions are not required to enter or win - You can use social media to get attention to vote on the site. Mail-in entries are not accepted.
• No purchase necessary. There is no fee to enter or win.
• Late, corrupt, or unreadable files may be rejected at our discretion.`,
    },
    {
      title: "Submission Requirements (Design Deliverables)",
      content: `• Preview image: PNG or JPG (transparent background preferred), at least 2000 px wide.
• Source file: SVG or PDF (preferred) OR AI/PSD/Figma package.
• Optional wordmark/lockup if part of your concept.
• Concept note: 100–200 words explaining idea, symbolism, and fit with CONCES.
• Mockup image (e.g., T-shirt, notebook, website header).
• File naming: lastname_firstname_school_CONCES_logo.(png/svg/pdf)`,
    },
    {
      title: "Content Standards & IP Safety",
      content: `• Your Entry must be your original work and must not infringe third-party rights.
• You are responsible for securing rights to any fonts or assets used. Do not include materials you cannot license to CONCES.
• AI-assisted work is allowed only if you have full rights to all outputs and inputs. You remain responsible for originality and compliance.
• Harassment, hate, or inappropriate content is prohibited and may result in disqualification.`,
    },
    {
      title: "Judging & Selection",
      content: `• Judges shortlist approximately 20 Finalists from eligible Entries.
• Final results use combined scoring: Judges (60%) + Public Votes (40%).
• Judging criteria (weights): Relevance to CONCES (20%), Creativity & Originality (20%), Simplicity & Memorability (15%), Versatility & Scalability (15%), Technical Execution (15%), Concept/Rationale (15%).
• In the event of a tie or irregularity, judges' decision is final.`,
    },
    {
      title: "Public Voting",
      content: `• Only Finalists appear in the Voting Suite on the Contest site.
• Voting window: as posted on the site. Limit: one (1) vote per person.
• We may audit, delay, hide, or remove suspicious votes and disqualify Entries for fraud, bots, or manipulation.
• We may hide running vote totals to reduce bias.`,
    },
    {
      title: "Prizes & Payments",
      content: `Prizes (subject to verification):
• Grand Prize: ₦500,000 (one winner)
• Second Prize: ₦150,000 (one winner)
• Third Prize: ₦100,000 (one winner)
• Finalist Awards: ₦50,000 each (up to 7 finalists)
• Other consolation prizes

• Prizes are not transferable or exchangeable. If a listed prize becomes unavailable, we may substitute a prize of equal or greater value.
• Winners may be required to provide ID, student verification, bank details, and sign required documents.
• Payment method: bank transfer. Timing: within 14 business days after verification and completion of documents.
• Taxes or charges (if any) are the responsibility of the recipient.`,
    },
    {
      title: "Odds of Winning",
      content: `This is a skill-based contest with a public voting component. Odds of winning are not applicable; winners are determined by the published scoring method.`,
    },
    {
      title: "Licenses & Ownership",
      content: `A) For all Entrants
By submitting, you grant CONCES a non-exclusive, royalty-free, worldwide, perpetual license to use, reproduce, display, and share your Entry for judging, marketing, publicity, livestreams, and archival purposes related to this Contest. You retain ownership of your work.

B) For Finalists
Finalists grant the same license as above and consent to use of their name, school, and Entry in press releases, social posts, livestreams, and recap content. Ownership is retained unless you become the Winner.

C) For the Winner (exclusive)
As a condition of receiving the prize, the Winner agrees to assign and transfer to CONCES all rights, title, and interest in the winning logo and related assets, including copyright. The Winner will deliver editable source files and any fonts or alternatives CONCES can legally use. The Winner waives any rights to object to reasonable adaptations or modifications. CONCES may register and enforce trademarks based on the winning design. No further payment is due beyond the published prize unless agreed in writing.`,
    },
    {
      title: "Warranties & Indemnity",
      content: `• You warrant that your Entry is original and that you have all necessary rights and permissions.
• You agree to indemnify and hold harmless CONCES from claims, losses, and costs arising out of breach of these warranties.`,
    },
    {
      title: "Finale Videos",
      content: `Finalists may be asked to submit a 60–90 second video (e.g., Unlisted YouTube link). By submitting, you grant us permission to download, lightly edit for technical fit, and broadcast the video during the live event and in recap content.`,
    },
    {
      title: "Conduct & Disqualification",
      content: `We may, at our discretion, remove or disqualify any Entry that breaches these Terms, university policy, or applicable law; contains inappropriate content; or is associated with fraudulent activity or vote manipulation.`,
    },
    {
      title: "Under-18 Entrants",
      content: `If you are under 18, a parent/guardian must consent to your participation and, if you are the Winner, to the assignment of rights described in Section 11(C).`,
    },
    {
      title: "Privacy & Data Use",
      content: `We collect and process personal data to administer the Contest, verify eligibility, communicate with Entrants, and share results and related opportunities. We do not sell your data.`,
    },
    {
      title: "Liability & Disclaimer",
      content: `To the extent permitted by law, CONCES is not responsible for lost, late, misdirected, corrupted, or incomplete entries; technical failures; or platform outages beyond our control. Our liability is limited to re-running the process or replacing the prize.`,
    },
    {
      title: "Changes, Cancellation & Force Majeure",
      content: `We may update these Terms, adjust dates, or cancel the Contest if necessary (e.g., due to technical issues, low participation, or events beyond our reasonable control). Any changes will be posted on the Contest site and take effect upon posting unless stated otherwise.`,
    },
    {
      title: "Platform Independence",
      content: `This Contest is not sponsored, endorsed, administered by, or associated with any social media platform (including Meta, X, YouTube). You release those platforms from any liability related to this Contest.`,
    },
    {
      title: "Governing Law & Disputes",
      content: `These Terms are governed by the laws of Nigeria. Any dispute will be handled under Nigerian law and, where applicable, in Nigerian courts.`,
    },
    {
      title: "Contact",
      content: `Questions? Email: goodnews@conces.org`,
    },
    {
      title: "Acceptance",
      content: `By submitting an Entry (and, if applicable, a Finale video), you confirm that you have read and accepted these Terms & Conditions.`,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-conces-blue to-primary-800">
        <div className="container mx-auto px-4 py-8 sm:py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
              Terms & Conditions
            </h1>
            <p className="text-lg sm:text-xl text-primary-100 mb-6">
              CONCES Logo Rebrand Challenge
            </p>

            {/* Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="bg-white/10 backdrop-blur-sm rounded-lg p-4 flex items-center justify-center space-x-3"
              >
                <Calendar className="w-5 h-5 text-conces-gold" />
                <span className="text-white font-medium">
                  Effective: August 2025
                </span>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="bg-white/10 backdrop-blur-sm rounded-lg p-4 flex items-center justify-center space-x-3"
              >
                <Globe className="w-5 h-5 text-conces-gold" />
                <span className="text-white font-medium">
                  brandchallenge.conces.org
                </span>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="bg-white/10 backdrop-blur-sm rounded-lg p-4 flex items-center justify-center space-x-3"
              >
                <Mail className="w-5 h-5 text-conces-gold" />
                <span className="text-white font-medium">
                  goodnews@conces.org
                </span>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 sm:py-12">
        <div className="max-w-4xl mx-auto">
          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-white rounded-lg shadow-lg p-6 mb-8"
          >
            <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
              <div>
                <h2 className="text-xl font-bold text-conces-blue mb-2">
                  Quick Navigation
                </h2>
                <p className="text-gray-600">
                  Expand or collapse sections for easier reading
                </p>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={expandAll}
                  className="px-4 py-2 bg-conces-green text-white rounded-md hover:bg-conces-green/90 transition-colors duration-200 font-medium"
                >
                  Expand All
                </button>
                <button
                  onClick={collapseAll}
                  className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors duration-200 font-medium"
                >
                  Collapse All
                </button>
              </div>
            </div>
          </motion.div>

          {/* Organizer Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="bg-gradient-to-r from-conces-gold/10 to-conces-green/10 rounded-lg p-6 mb-8 border border-conces-gold/20"
          >
            <h3 className="text-lg font-bold text-conces-blue mb-3">
              Contest Organizer
            </h3>
            <p className="text-gray-700 mb-2">
              <strong>Organization:</strong> Conference of Nigerian Christian
              Engineering Students (CONCES)
            </p>
            <p className="text-gray-700 mb-2">
              <strong>Contact Email:</strong>{" "}
              <a
                href="mailto:goodnews@conces.org"
                className="text-conces-green hover:underline"
              >
                goodnews@conces.org
              </a>
            </p>
            <p className="text-gray-700">
              <strong>Website:</strong>{" "}
              <a
                href="https://brandchallenge.conces.org"
                className="text-conces-green hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                brandchallenge.conces.org
              </a>
            </p>
          </motion.div>

          {/* Terms Sections */}
          <div className="space-y-4">
            {termsData.map((section, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 * index }}
                className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200"
              >
                <button
                  onClick={() => toggleSection(index)}
                  className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-primary-50 transition-colors duration-200"
                >
                  <div className="flex items-center space-x-3">
                    <span className="bg-conces-blue text-white px-3 py-1 rounded-full text-sm font-medium">
                      {(index + 1).toString().padStart(2, "0")}
                    </span>
                    <h3 className="text-lg font-semibold text-conces-blue">
                      {section.title}
                    </h3>
                  </div>
                  {expandedSections.has(index) ? (
                    <ChevronUp className="w-5 h-5 text-conces-blue" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-conces-blue" />
                  )}
                </button>

                {expandedSections.has(index) && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="px-6 pb-6"
                  >
                    <div className="pt-4 border-t border-gray-100">
                      <div className="prose prose-gray max-w-none">
                        {section.content.split("\n").map((line, lineIndex) => (
                          <p
                            key={lineIndex}
                            className="text-gray-700 leading-relaxed mb-3 whitespace-pre-line"
                          >
                            {line}
                          </p>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>

          {/* Footer Notice */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="bg-gradient-to-r from-conces-blue to-primary-800 rounded-lg p-6 mt-12 text-center"
          >
            <h3 className="text-xl font-bold text-white mb-3">
              Important Notice
            </h3>
            <p className="text-primary-100 leading-relaxed">
              By participating in the CONCES Logo Rebrand Challenge, you
              acknowledge that you have read, understood, and agree to abide by
              all the terms and conditions outlined above. If you have any
              questions or concerns, please contact us at{" "}
              <a
                href="mailto:goodnews@conces.org"
                className="text-conces-gold hover:underline font-medium"
              >
                goodnews@conces.org
              </a>
            </p>
            <div className="mt-4 pt-4 border-t border-white/20">
              <p className="text-white/80 text-sm">
                Last updated: August 2025 • CONCES Logo Rebrand Challenge
              </p>
            </div>
          </motion.div>

          {/* Back to Top Button */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="text-center mt-8"
          >
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="inline-flex items-center px-6 py-3 bg-conces-green text-white rounded-lg hover:bg-conces-green/90 transition-colors duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Back to Top
              <ChevronUp className="w-4 h-4 ml-2" />
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default TermsAndConditions;
