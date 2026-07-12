import Mainlayout from "@/layout/Mainlayout";
import Link from "next/link";
import { useLanguage } from "@/lib/LanguageContext";

const challenges = [
  {
    title: "Build a responsive layout",
    description:
      "Create a mobile-first page with adaptive components and a clean card-based design.",
    badge: "Beginner",
  },
  {
    title: "Fix the chat flow",
    description:
      "Implement a quick chat screen and improve the conversation experience.",
    badge: "Intermediate",
  },
  {
    title: "Optimize question listings",
    description:
      "Refine the question feed for performance and better mobile usability.",
    badge: "Advanced",
  },
];

export default function ChallengesPage() {
  const { t } = useLanguage();
  return (
    <Mainlayout>
      <main className="min-w-0 p-4 lg:p-6">
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="rounded-3xl border border-orange-200 bg-orange-50 dark:bg-orange-950/20 p-6 sm:p-8 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <p className="text-sm text-orange-700 dark:text-orange-400 uppercase tracking-[0.2em]">
                  Challenge
                </p>
                <h1 className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-100">
                  {t("Developer Challenges")}
                </h1>
              </div>
              <span className="rounded-full bg-orange-100 dark:bg-orange-900/50 px-3 py-1 text-sm font-medium text-orange-700 dark:text-orange-400">
                Ready to earn badges
              </span>
            </div>
            <p className="mt-4 text-sm leading-7 text-slate-700 dark:text-slate-300">
              {t("Sharpen your coding skills with curated practice tasks.")}
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {challenges.map((item) => (
              <article
                key={item.title}
                className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md transition"
              >
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-lg font-semibold text-slate-900">
                    {item.title}
                  </h2>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-slate-600">
                    {item.badge}
                  </span>
                </div>
                <p className="mt-3 text-sm text-slate-600">
                  {item.description}
                </p>
                <Link
                  href="/"
                  className="mt-6 inline-flex items-center justify-center rounded-full bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700 transition"
                >
                  Start challenge
                </Link>
              </article>
            ))}
          </div>
        </div>
      </main>
    </Mainlayout>
  );
}
