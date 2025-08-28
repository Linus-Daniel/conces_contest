export default function ContestPack() {
  return (
    <div className="bg- text-background min-h-screen px-4 py-6 md:px-12">
      {/* Header */}
      <header className="text-center mb-8">
        <h1 className="text-2xl md:text-4xl font-bold text-conces-blue">
          CONCES Logo Rebrand Challenge — Contest Pack
        </h1>
        <p className="mt-2 text-primary-600">
          Everything you need to participate, submit, get votes, and present
          professionally.
        </p>
      </header>

      <main className="space-y-8 max-w-3xl mx-auto">
        {/* Overview */}
        <section>
          <h2 className="text-xl font-semibold text-conces-green mb-2">
            Overview
          </h2>
          <p>
            Welcome to the CONCES Logo Rebrand Challenge. This pack explains how
            the challenge works, what to submit, how voting runs, what judges
            look for, and the legal terms around your entry. Keep this handy
            throughout the contest.
          </p>
        </section>

        {/* Key Dates */}
        <section>
          <h2 className="text-xl font-semibold text-conces-green mb-2">
            Key Dates
          </h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Sign-up opens: September 7 2025</li>
            <li>Submission deadline: October 7 2025 (11:59 pm WAT)</li>
            <li>Finalists announced: [Date]</li>
            <li>Public voting:  October 8 2025 – November 4 2025</li>
            <li>Grand Finale (live): November 7</li>
          </ul>
          <p className="mt-2 text-sm text-primary-500">
            All dates are subject to change and all changes will be communicated
            on the public website.
          </p>
        </section>

        {/* Eligibility */}
        <section>
          <h2 className="text-xl font-semibold text-conces-green mb-2">
            Eligibility
          </h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              Open to current students of engineering or technology faculties in
              Nigerian higher institutions (universities, polytechnics).
            </li>
            <li>One entry per participant.</li>
            <li>Use your real details. We may verify with your institution.</li>
          </ul>
        </section>

        {/* How It Works */}
        <section>
          <h2 className="text-xl font-semibold text-conces-green mb-2">
            How It Works
          </h2>
          <ol className="list-decimal pl-5 space-y-1">
            <li>
              Sign up on the landing page. You’ll receive this pack and the
              submission link by email.
            </li>
            <li>Design and submit your logo files before the deadline.</li>
            <li>Judges shortlist ~20 finalists.</li>
            <li>
              Finalists go live in the Voting Suite. Share your link and
              encourage enough votes (1 vote per person).
            </li>
            <li>
              Finalists present at the Grand Finale. Judges + public votes
              decide winners.
            </li>
          </ol>
        </section>

        {/* What to Submit */}
        <section>
          <h2 className="text-xl font-semibold text-conces-green mb-2">
            What to Submit (Design Deliverables)
          </h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Primary logo design (full-colour).</li>
            <li>Monochrome version (black or single-colour).</li>
            <li>Optional wordmark/lockup if included in your concept.</li>
            <li>
              Exported preview: PNG (transparent background), at least 2000 px
              width.
            </li>
            <li>
              Source file: SVG or PDF (preferred) OR AI/PSD/Figma package.
            </li>
            <li>Short concept note (100–200 words).</li>
            <li>Mock images (e.g., T-shirt, notebook, website header).</li>
          </ul>
        </section>

        {/* File Rules */}
        <section>
          <h2 className="text-xl font-semibold text-conces-green mb-2">
            File Rules & Naming
          </h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Colour space: RGB. Keep colours web-friendly.</li>
            <li>
              Fonts: Use legally licensed or free fonts. Declare any font used.
            </li>
            <li>Naming: lastname_firstname_school_CONCES_logo.(png/svg/pdf)</li>
            <li>Max size per upload: 10 MB.</li>
          </ul>
        </section>

        {/* What We Value */}
        <section>
          <h2 className="text-xl font-semibold text-conces-green mb-2">
            What We Value (Design Principles)
          </h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              Relevance to CONCES: Christian, engineering, service, excellence,
              community.
            </li>
            <li>Simplicity and clarity.</li>
            <li>Originality and memorability.</li>
            <li>Versatility.</li>
            <li>Technical quality.</li>
            <li>Story: your concept connects with our mission and future.</li>
          </ul>
        </section>

        {/* Public Voting Rules */}
        <section>
          <h2 className="text-xl font-semibold text-conces-green mb-2">
            Public Voting Rules
          </h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Only finalists appear in the Voting Suite.</li>
            <li>The voting window lasts 4 weeks.</li>
            <li>Limit: 1 vote per email per day.</li>
            <li>
              Anti-fraud checks: suspicious or automated voting may be removed.
            </li>
            <li>Visible counts may be hidden until voting ends.</li>
          </ul>
        </section>

        {/* Judging & Scoring */}
        <section>
          <h2 className="text-xl font-semibold text-conces-green mb-2">
            Judging & Scoring
          </h2>
          <p>
            Final winners are decided by a combined score: Judges (60%) + Public
            Votes (40%).
          </p>
          <ul className="list-disc pl-5 space-y-1 mt-2">
            <li>Relevance to CONCES (20%)</li>
            <li>Creativity & Originality (20%)</li>
            <li>Simplicity & Memorability (15%)</li>
            <li>Versatility & Scalability (15%)</li>
            <li>Technical Execution (15%)</li>
            <li>Concept Note / Rationale (15%)</li>
          </ul>
        </section>

        {/* Finalist Presentation */}
        <section>
          <h2 className="text-xl font-semibold text-conces-green mb-2">
            Finalist Presentation Guide
          </h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Video length: 60–90 seconds (max 90 seconds).</li>
            <li>Content outline: intro, idea, why it fits, real use.</li>
            <li>
              Recording tips: quiet room, good lighting, speak clearly,
              landscape 1080p MP4.
            </li>
            <li>File naming: lastname_firstname_school_CONCES_pitch.mp4</li>
          </ul>
        </section>

        {/* Legal */}
        <section>
          <h2 className="text-xl font-semibold text-conces-green mb-2">
            Legal & Intellectual Property
          </h2>
          <p className="mb-2">
            Submit only original work. By submitting, you grant CONCES a license
            to display your work. Winners transfer exclusive rights. Minors may
            need parental consent.
          </p>
        </section>

        {/* Conduct */}
        <section>
          <h2 className="text-xl font-semibold text-conces-green mb-2">
            Conduct & Disqualification
          </h2>
          <p>
            No harassment, hate, illegal content, or vote manipulation.
            Violations may lead to disqualification.
          </p>
        </section>

        {/* Privacy */}
        <section>
          <h2 className="text-xl font-semibold text-conces-green mb-2">
            Privacy
          </h2>
          <p>
            We collect your details to run the contest, verify eligibility, and
            contact you about results and related opportunities. We won’t sell
            your data.
          </p>
        </section>

        {/* FAQs */}
        <section>
          <h2 className="text-xl font-semibold text-conces-green mb-2">
            Quick FAQs
          </h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Can I revise my submission? — No.</li>
            <li>Team entries? — Allowed.</li>
            <li>
              Can I use a cross or Christian symbolism? — Yes, keep it
              inclusive.
            </li>
            <li>
              Will I get feedback if I’m not a finalist? — General notes shared
              publicly.
            </li>
            <li>Can I join the Talent Directory? — Yes.</li>
          </ul>
        </section>

        {/* Contacts */}
        <section>
          <h2 className="text-xl font-semibold text-conces-green mb-2">
            Contacts & Support
          </h2>
          <p>
            Email:{" "}
            <a
              href="mailto:goodnews@conces.org"
              className="text-conces-blue underline"
            >
              goodnews@conces.org
            </a>
          </p>
          <p>
            Website:{" "}
            <a
              href="https://brandchallenge.conces.org"
              target="_blank"
              className="text-conces-blue underline"
              rel="noreferrer"
            >
              brandchallenge.conces.org
            </a>
          </p>
        </section>
      </main>
    </div>
  );
}
