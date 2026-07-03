import Mainlayout from "@/layout/Mainlayout";
import Link from "next/link";

export default function AboutPage() {
  return (
    <Mainlayout>
      <div className="mx-auto max-w-5xl space-y-8">
        <section className="rounded-3xl border border-gray-200 bg-gradient-to-br from-orange-50 via-white to-blue-50 p-8 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-500">
            About the community
          </p>
          <h1 className="mt-3 text-3xl font-bold text-gray-900">
            A better place to ask, learn, and grow together.
          </h1>
          <p className="mt-4 max-w-3xl text-lg text-gray-700">
            This platform brings developers, learners, and teams together around
            practical questions, helpful answers, and thoughtful discussion.
          </p>
        </section>

        <section className="grid gap-6 md:grid-cols-3">
          {[
            {
              title: "Ask confidently",
              text: "Post questions, share progress, and get guidance from people who have been there.",
            },
            {
              title: "Discover topics",
              text: "Follow tags, browse curated filters, and surface ideas that matter to your workflow.",
            },
            {
              title: "Stay connected",
              text: "Get updates, notifications, and delivery preferences that fit the way you work.",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
            >
              <h2 className="text-lg font-semibold text-gray-900">
                {item.title}
              </h2>
              <p className="mt-2 text-sm leading-6 text-gray-600">
                {item.text}
              </p>
            </div>
          ))}
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
          <h2 className="text-2xl font-semibold text-gray-900">
            Why teams use it
          </h2>
          <p className="mt-3 text-gray-700">
            From product launches to debugging support, this experience helps
            teams move faster with shared knowledge and clear communication.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/"
              className="rounded-full bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600"
            >
              Explore questions
            </Link>
            <Link
              href="/ask"
              className="rounded-full border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Start a discussion
            </Link>
          </div>
        </section>
      </div>
    </Mainlayout>
  );
}
