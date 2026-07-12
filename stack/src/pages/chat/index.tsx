import Link from "next/link";
import Mainlayout from "@/layout/Mainlayout";
import { useLanguage } from "@/lib/LanguageContext";

export default function ChatPage() {
  const { t } = useLanguage();
  return (
    <Mainlayout>
      <main className="min-w-0 p-4 lg:p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="rounded-3xl border border-blue-200 bg-blue-50 dark:bg-blue-950/20 p-6 sm:p-8 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <p className="text-sm text-blue-700 dark:text-blue-400 uppercase tracking-[0.2em]">
                  Live chat
                </p>
                <h1 className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-100">
                  {t("Chat Room")}
                </h1>
              </div>
              <div className="flex items-center gap-3">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-2xl">
                  💬
                </span>
                <span className="rounded-full bg-blue-100 dark:bg-blue-900/50 px-3 py-1 text-sm font-medium text-blue-700 dark:text-blue-400">
                  Available now
                </span>
              </div>
            </div>
            <p className="mt-4 text-sm leading-7 text-slate-700">
              Get answers faster with a dedicated chat experience for asking
              quick questions, troubleshooting code, and coordinating community
              help in real time.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900">
                Quick support
              </h2>
              <p className="mt-3 text-sm text-slate-600">
                Start a new chat session for instant guidance on your current
                problem. Share your code, error details, or ask for feature
                ideas.
              </p>
              <Link
                href="/"
                className="inline-flex mt-5 items-center justify-center rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition"
              >
                Open first chat
              </Link>
            </div>
            <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900">
                Stay connected
              </h2>
              <p className="mt-3 text-sm text-slate-600">
                Keep track of your conversations, recent help, and chat topics
                so you can return to the right answer whenever you need it.
              </p>
              <div className="mt-5 space-y-3">
                <div className="rounded-2xl bg-slate-50 p-3 text-sm text-slate-700">
                  • Ask about UI layout or responsiveness
                </div>
                <div className="rounded-2xl bg-slate-50 p-3 text-sm text-slate-700">
                  • Get quick feedback on API design and routing
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </Mainlayout>
  );
}
