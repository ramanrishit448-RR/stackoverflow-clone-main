import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import Mainlayout from "@/layout/Mainlayout";
import axiosInstance from "@/lib/axiosinstance";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";

export default function Home() {
  const [question, setquestion] = useState<any>(null);
  const [loading, setloading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<any>(null);
  const router = useRouter();
  useEffect(() => {
    const fetchquestion = async () => {
      try {
        const res = await axiosInstance.get("/question/getallquestion");
        setquestion(res.data.data);
      } catch (error) {
        console.log(error);
      } finally {
        setloading(false);
      }
    };
    fetchquestion();

    const storedFilter = localStorage.getItem("activeCustomFilter");
    if (storedFilter) {
      setActiveFilter(JSON.parse(storedFilter));
    }

    const handleFilterChange = () => {
      const nextFilter = localStorage.getItem("activeCustomFilter");
      setActiveFilter(nextFilter ? JSON.parse(nextFilter) : null);
    };

    window.addEventListener("customFilterChanged", handleFilterChange);
    return () =>
      window.removeEventListener("customFilterChanged", handleFilterChange);
  }, []);
  const visibleQuestions = useMemo(() => {
    if (!question) return [];
    if (!activeFilter) return question;

    const tagMatches = (activeFilter.tags || []).map((tag: string) =>
      tag.toLowerCase(),
    );
    const searchTerm = (activeFilter.search || "").toLowerCase();

    return question.filter((item: any) => {
      const questionText =
        `${item.questiontitle} ${item.questionbody}`.toLowerCase();
      const hasTag = tagMatches.every((tag: string) =>
        (item.questiontags || []).some(
          (itemTag: string) => itemTag.toLowerCase() === tag,
        ),
      );
      const matchesSearch = !searchTerm || questionText.includes(searchTerm);
      return hasTag && matchesSearch;
    });
  }, [question, activeFilter]);

  if (loading) {
    return (
      <Mainlayout>
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
      </Mainlayout>
    );
  }
  if (!question || question.length === 0) {
    return (
      <Mainlayout>
        <div className="text-center text-gray-500 mt-4">No question found.</div>
      </Mainlayout>
    );
  }

  return (
    <Mainlayout>
      <main className="min-w-0 p-4 lg:p-6 ">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h1 className="text-xl lg:text-2xl font-semibold">Top Questions</h1>
          <button
            onClick={() => router.push("/ask")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-medium whitespace-nowrap"
          >
            Ask Question
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 mb-6">
          <Link
            href="/chat"
            className="group block rounded-3xl border border-gray-200 bg-white p-5 shadow-sm hover:border-blue-300 hover:shadow-md transition"
          >
            <div className="flex items-center justify-between gap-3 mb-4">
              <div>
                <p className="text-sm text-gray-500">Instant help</p>
                <h2 className="text-lg font-semibold text-gray-900">
                  Chat with mentors
                </h2>
              </div>
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                💬
              </span>
            </div>
            <p className="text-sm text-gray-600">
              Jump into a friendly chat space for quick help, code tips, and
              status updates.
            </p>
          </Link>
          <Link
            href="/challenges"
            className="group block rounded-3xl border border-gray-200 bg-white p-5 shadow-sm hover:border-orange-300 hover:shadow-md transition"
          >
            <div className="flex items-center justify-between gap-3 mb-4">
              <div>
                <p className="text-sm text-gray-500">Sharpen skills</p>
                <h2 className="text-lg font-semibold text-gray-900">
                  Explore challenges
                </h2>
              </div>
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-orange-50 text-orange-600">
                🏆
              </span>
            </div>
            <p className="text-sm text-gray-600">
              Solve challenges, earn badges, and practice with curated tasks
              across development topics.
            </p>
          </Link>
        </div>

        <div className="w-full">
          <div className="flex flex-col sm:flex-row items-start sm:items-center mb-4 text-sm gap-2 sm:gap-4">
            <span className="text-gray-600">
              {visibleQuestions.length} questions
            </span>
            <div className="flex flex-wrap gap-1 sm:gap-2">
              <button className="px-2 sm:px-3 py-1 bg-gray-200 text-gray-700 rounded text-xs sm:text-sm">
                Newest
              </button>
              <button className="px-2 sm:px-3 py-1 text-gray-600 hover:bg-gray-100 rounded text-xs sm:text-sm">
                Active
              </button>
              <button className="px-2 sm:px-3 py-1 text-gray-600 hover:bg-gray-100 rounded flex items-center text-xs sm:text-sm">
                Bountied
                <Badge variant="secondary" className="ml-1 text-xs">
                  25
                </Badge>
              </button>
              <button className="px-2 sm:px-3 py-1 text-gray-600 hover:bg-gray-100 rounded text-xs sm:text-sm">
                Unanswered
              </button>
              <button className="px-2 sm:px-3 py-1 text-gray-600 hover:bg-gray-100 rounded text-xs sm:text-sm">
                More ▼
              </button>
              {activeFilter ? (
                <button
                  onClick={() => {
                    localStorage.removeItem("activeCustomFilter");
                    setActiveFilter(null);
                    window.dispatchEvent(new Event("customFilterChanged"));
                  }}
                  className="px-2 sm:px-3 py-1 border border-orange-300 text-orange-600 hover:bg-orange-50 rounded ml-auto text-xs sm:text-sm"
                >
                  Clear {activeFilter.name}
                </button>
              ) : null}
            </div>
          </div>
          <div className="space-y-4">
            {visibleQuestions.map((question: any) => (
              <div key={question._id} className="border-b border-gray-200 pb-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex sm:flex-col items-center sm:items-center text-sm text-gray-600 sm:w-16 lg:w-20 gap-4 sm:gap-2">
                    <div className="text-center">
                      <div className="font-medium">
                        {question.upvote.length}
                      </div>
                      <div className="text-xs">votes</div>
                    </div>
                    <div className="text-center">
                      <div
                        className={`font-medium ${
                          question.answer.length > 0
                            ? "text-green-600 bg-green-100 px-2 py-1 rounded"
                            : ""
                        }`}
                      >
                        {question.noofanswer}
                      </div>
                      <div className="text-xs">
                        {question.noofanswer === 1 ? "answer" : "answers"}
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/questions/${question._id}`}
                      className="text-blue-600 hover:text-blue-800 text-base lg:text-lg font-medium mb-2 block"
                    >
                      {question.questiontitle}
                    </Link>
                    <p className="text-gray-700 text-sm mb-3 line-clamp-2">
                      {question.questionbody}
                    </p>

                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                      <div className="flex flex-wrap gap-1">
                        {(question.questiontags || [])
                          .filter(
                            (tag: any) => typeof tag === "string" && tag.trim(),
                          )
                          .map((tag: any) => (
                            <Link
                              key={tag}
                              href={`/tags/${encodeURIComponent(tag.trim())}`}
                            >
                              <Badge
                                variant="secondary"
                                className="text-xs bg-blue-100 text-blue-800 hover:bg-blue-200 cursor-pointer"
                              >
                                {tag}
                              </Badge>
                            </Link>
                          ))}
                      </div>

                      <div className="flex items-center text-xs text-gray-600 flex-shrink-0">
                        <Link
                          href={`/users/${question.userid}`}
                          className="flex items-center"
                        >
                          <Avatar className="w-4 h-4 mr-1">
                            <AvatarFallback className="text-xs">
                              {question.userposted[0]}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-blue-600 hover:text-blue-800 mr-1">
                            {question.userposted}
                          </span>
                        </Link>

                        <span>
                          asked{" "}
                          {new Date(question.askedon).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </Mainlayout>
  );
}
