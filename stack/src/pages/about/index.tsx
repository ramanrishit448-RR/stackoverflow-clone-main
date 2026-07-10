import Mainlayout from "@/layout/Mainlayout";
import Link from "next/link";

const reputationEarnings = [
  { action: "Post an answer", points: "+5", icon: "✍️" },
  { action: "Answer is accepted", points: "+10", icon: "✅" },
  { action: "Answer reaches 5 upvotes", points: "+5", icon: "👍" },
  { action: "Question reaches 10 upvotes", points: "+2", icon: "🔼" },
  { action: "Complete your profile", points: "+10", icon: "👤" },
  { action: "Receive transferred points", points: "+varies", icon: "🎁" },
];

const reputationLosses = [
  { action: "Receive a downvote", points: "−2", icon: "👎" },
  { action: "Delete your own answer", points: "−5", icon: "🗑️" },
  { action: "Content removed by admin", points: "−10", icon: "🚫" },
  { action: "Transfer points to someone", points: "−varies", icon: "↗️" },
];

const privileges = [
  {
    threshold: "50",
    label: "Commenter",
    description: "Comment freely on any post across the community.",
    color: "from-blue-500 to-blue-600",
    bg: "bg-blue-50",
    border: "border-blue-200",
    text: "text-blue-700",
  },
  {
    threshold: "100",
    label: "Editor",
    description: "Edit and improve community posts to keep knowledge accurate.",
    color: "from-purple-500 to-purple-600",
    bg: "bg-purple-50",
    border: "border-purple-200",
    text: "text-purple-700",
  },
  {
    threshold: "250",
    label: "Moderator",
    description: "Vote to close off-topic or low-quality questions.",
    color: "from-orange-500 to-orange-600",
    bg: "bg-orange-50",
    border: "border-orange-200",
    text: "text-orange-700",
  },
  {
    threshold: "500",
    label: "Guardian",
    description: "Report inappropriate content and flag it for review.",
    color: "from-red-500 to-red-600",
    bg: "bg-red-50",
    border: "border-red-200",
    text: "text-red-700",
  },
];

export default function AboutPage() {
  return (
    <Mainlayout>
      <div className="mx-auto max-w-5xl space-y-10">

        {/* Hero */}
        <section className="rounded-3xl border border-gray-200 bg-gradient-to-br from-orange-50 via-white to-blue-50 p-10 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-500">
            About the community
          </p>
          <h1 className="mt-3 text-4xl font-bold text-gray-900">
            A better place to ask, learn, and grow together.
          </h1>
          <p className="mt-4 max-w-3xl text-lg text-gray-600">
            This platform brings developers, learners, and teams together around
            practical questions, helpful answers, and thoughtful discussion — all
            powered by a community reputation system that rewards real
            contributions.
          </p>
        </section>

        {/* Feature cards */}
        <section className="grid gap-6 md:grid-cols-3">
          {[
            {
              title: "Ask confidently",
              text: "Post questions, share progress, and get guidance from people who have been there.",
              icon: "💬",
            },
            {
              title: "Discover topics",
              text: "Follow tags, browse curated filters, and surface ideas that matter to your workflow.",
              icon: "🔍",
            },
            {
              title: "Stay connected",
              text: "Get updates, notifications, and delivery preferences that fit the way you work.",
              icon: "🔔",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
            >
              <span className="text-3xl">{item.icon}</span>
              <h2 className="mt-3 text-lg font-semibold text-gray-900">
                {item.title}
              </h2>
              <p className="mt-2 text-sm leading-6 text-gray-600">{item.text}</p>
            </div>
          ))}
        </section>

        {/* ── REPUTATION SYSTEM ── */}
        <section className="space-y-8">
          {/* Section header */}
          <div className="rounded-3xl border border-orange-200 bg-gradient-to-r from-orange-500 to-amber-500 p-8 text-white shadow-md">
            <div className="flex items-center gap-3">
              <span className="text-4xl">🏆</span>
              <div>
                <p className="text-sm font-semibold uppercase tracking-widest text-orange-100">
                  Community Feature
                </p>
                <h2 className="mt-1 text-3xl font-bold">The Reputation System</h2>
              </div>
            </div>
            <p className="mt-4 max-w-3xl text-orange-50 text-base leading-7">
              Reputation is the community's way of saying <em>"we trust you."</em> It's earned
              by helping others — posting quality answers, asking great questions, and engaging
              meaningfully. As your reputation grows, you unlock new abilities to shape and
              moderate the community.
            </p>
          </div>

          {/* Earn & Lose grid */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Earn */}
            <div className="rounded-2xl border border-green-200 bg-green-50 p-6 shadow-sm">
              <h3 className="flex items-center gap-2 text-lg font-bold text-green-800">
                <span className="text-2xl">📈</span> How You Earn Points
              </h3>
              <ul className="mt-4 space-y-3">
                {reputationEarnings.map((item) => (
                  <li key={item.action} className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-sm text-gray-700">
                      <span>{item.icon}</span> {item.action}
                    </span>
                    <span className="rounded-full bg-green-600 px-3 py-0.5 text-xs font-bold text-white">
                      {item.points}
                    </span>
                  </li>
                ))}
              </ul>
              <p className="mt-4 rounded-xl bg-green-100 p-3 text-xs text-green-700">
                💡 <strong>Profile bonus</strong> is a one-time reward for completing your name,
                bio, tags, and phone number.
              </p>
            </div>

            {/* Lose */}
            <div className="rounded-2xl border border-red-200 bg-red-50 p-6 shadow-sm">
              <h3 className="flex items-center gap-2 text-lg font-bold text-red-800">
                <span className="text-2xl">📉</span> How You Lose Points
              </h3>
              <ul className="mt-4 space-y-3">
                {reputationLosses.map((item) => (
                  <li key={item.action} className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-sm text-gray-700">
                      <span>{item.icon}</span> {item.action}
                    </span>
                    <span className="rounded-full bg-red-500 px-3 py-0.5 text-xs font-bold text-white">
                      {item.points}
                    </span>
                  </li>
                ))}
              </ul>
              <p className="mt-4 rounded-xl bg-red-100 p-3 text-xs text-red-700">
                ⚠️ When an admin removes your content for violating community guidelines, all
                reputation earned from that content is reversed plus an additional −10 penalty.
              </p>
            </div>
          </div>

          {/* Privileges */}
          <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
            <h3 className="text-xl font-bold text-gray-900">
              🔓 Privileges You Unlock
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              As your reputation grows, new community powers become available to you automatically.
            </p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {privileges.map((p) => (
                <div
                  key={p.threshold}
                  className={`relative overflow-hidden rounded-xl border ${p.border} ${p.bg} p-5`}
                >
                  <div className={`absolute right-4 top-4 rounded-full bg-gradient-to-br ${p.color} px-3 py-1 text-xs font-bold text-white shadow`}>
                    {p.threshold} pts
                  </div>
                  <p className={`text-sm font-bold uppercase tracking-wider ${p.text}`}>
                    {p.label}
                  </p>
                  <p className="mt-1 text-sm text-gray-600">{p.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Transfer */}
          <div className="rounded-2xl border border-purple-200 bg-gradient-to-br from-purple-50 to-white p-8 shadow-sm">
            <h3 className="flex items-center gap-2 text-xl font-bold text-purple-900">
              <span className="text-2xl">🤝</span> Transferring Reputation
            </h3>
            <p className="mt-3 text-sm leading-7 text-gray-600">
              High-reputation members can gift points to other community members as a sign of
              gratitude. Here's how it works:
            </p>
            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              {[
                { icon: "🔑", label: "Eligibility", text: "You must have more than 50 reputation points to initiate a transfer." },
                { icon: "📦", label: "Per transfer limit", text: "You can send up to 50 points in a single transaction." },
                { icon: "📅", label: "Daily cap", text: "A maximum of 100 points can be sent per calendar day." },
              ].map((rule) => (
                <div key={rule.label} className="rounded-xl border border-purple-100 bg-white p-4 text-center shadow-sm">
                  <span className="text-3xl">{rule.icon}</span>
                  <p className="mt-2 text-sm font-semibold text-purple-800">{rule.label}</p>
                  <p className="mt-1 text-xs text-gray-500">{rule.text}</p>
                </div>
              ))}
            </div>
            <p className="mt-5 rounded-xl bg-purple-100 p-4 text-xs text-purple-700">
              🗂️ All transfers are logged and visible on both users' public profiles under the <strong>Reputation → Transaction History</strong> tab.
            </p>
          </div>

          {/* How to view */}
          <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
            <h3 className="text-xl font-bold text-gray-900">📋 Where to See Your Reputation</h3>
            <p className="mt-3 text-sm text-gray-600">
              Every user has a public <strong>Reputation tab</strong> on their profile page. It shows:
            </p>
            <ul className="mt-4 space-y-2 text-sm text-gray-600">
              {[
                "Your total reputation score displayed prominently",
                "A full Activity History of every point earned or lost — with reason and date",
                "A Transaction History log of all reputation transfers sent and received",
              ].map((point) => (
                <li key={point} className="flex items-start gap-2">
                  <span className="mt-0.5 text-orange-500">▸</span>
                  {point}
                </li>
              ))}
            </ul>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/users"
                className="rounded-full bg-orange-500 px-5 py-2 text-sm font-medium text-white hover:bg-orange-600 transition-colors"
              >
                View Community Members
              </Link>
              <Link
                href="/"
                className="rounded-full border border-gray-300 px-5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Explore Questions
              </Link>
              <Link
                href="/ask"
                className="rounded-full border border-gray-300 px-5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Start a Discussion
              </Link>
            </div>
          </div>
        </section>

        {/* Teams section */}
        <section className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
          <h2 className="text-2xl font-semibold text-gray-900">Why teams use it</h2>
          <p className="mt-3 text-gray-600">
            From product launches to debugging support, this platform helps teams move faster
            with shared knowledge, clear communication, and a reputation-driven culture of
            quality contributions.
          </p>
        </section>

      </div>
    </Mainlayout>
  );
}
