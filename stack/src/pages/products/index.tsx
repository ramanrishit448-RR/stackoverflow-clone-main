import { useEffect, useState } from "react";
import Mainlayout from "@/layout/Mainlayout";
import axiosInstance from "@/lib/axiosinstance";
import { useAuth } from "@/lib/AuthContext";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import { HelpCircle, ChevronRight, Users, Sparkles, Cpu, Layers, Bookmark, Rss } from "lucide-react";
import Link from "next/link";

export default function ProductsIndex() {
  const { user } = useAuth();
  const router = useRouter();

  const [collectives, setCollectives] = useState<any[]>([]);
  const [questions, setQuestions] = useState<any[]>([]);
  const [loadingCollectives, setLoadingCollectives] = useState(true);
  const [activeCollective, setActiveCollective] = useState<any>(null);
  const [filteredQuestions, setFilteredQuestions] = useState<any[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);

  const fetchCollectives = async () => {
    try {
      setLoadingCollectives(true);
      const res = await axiosInstance.get("/collectives");
      setCollectives(res.data.data);
      if (res.data.data.length > 0) {
        // Set the first collective as active initially
        setActiveCollective(res.data.data[0]);
      }
    } catch (error: any) {
      console.error("Error fetching collectives:", error);
    } finally {
      setLoadingCollectives(false);
    }
  };

  const fetchQuestions = async () => {
    try {
      setLoadingQuestions(true);
      const res = await axiosInstance.get("/question/getallquestion");
      setQuestions(res.data.data || []);
    } catch (error: any) {
      console.error("Error fetching questions:", error);
    } finally {
      setLoadingQuestions(false);
    }
  };

  useEffect(() => {
    fetchCollectives();
    fetchQuestions();
  }, []);

  useEffect(() => {
    if (activeCollective && questions.length > 0) {
      const tagToFilter = activeCollective.tag.toLowerCase();
      const matched = questions.filter((q: any) =>
        q.questiontags?.some((t: string) => t.toLowerCase() === tagToFilter)
      );
      setFilteredQuestions(matched);
    } else {
      setFilteredQuestions([]);
    }
  }, [activeCollective, questions]);

  const handleJoinLeaveCollective = async (id: string) => {
    if (!user) {
      toast.info("Please login to join collectives.");
      router.push("/auth");
      return;
    }
    try {
      const res = await axiosInstance.post(`/collectives/${id}/join`);
      toast.success(
        res.data.data.members.includes(user._id)
          ? `Joined ${res.data.data.name}!`
          : `Left ${res.data.data.name}`
      );
      // Refresh collectives list
      const resCol = await axiosInstance.get("/collectives");
      setCollectives(resCol.data.data);
      // Update currently active collective if it's the one modified
      const updated = resCol.data.data.find((c: any) => c._id === id);
      if (updated) setActiveCollective(updated);
    } catch (error: any) {
      toast.error("Failed to update collective membership.");
    }
  };

  return (
    <Mainlayout>
      <div className="mx-auto max-w-6xl space-y-12 pb-12">
        {/* Hero Section */}
        <section className="text-center space-y-4">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight sm:text-4xl">
            Developer Product Suite
          </h1>
          <p className="mt-2 mx-auto max-w-2xl text-sm text-gray-500 leading-relaxed">
            Discover tailored tools, private environments, and structured sub-communities built to accelerate developer workflow and developer collaborations.
          </p>
        </section>

        {/* Highlighted Product: StackOverflow for Teams Banner */}
        <section className="relative overflow-hidden rounded-3xl border border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50 p-6 sm:p-8 shadow-sm">
          <div className="relative z-10 max-w-2xl space-y-4">
            <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-0.5 text-[10px] font-bold text-blue-700">
              <Sparkles className="h-3 w-3" /> Featured Product
            </span>
            <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">
              Stack Overflow for Teams
            </h2>
            <p className="text-xs text-gray-600 leading-relaxed">
              Form private question directories and release boards exclusively for your enterprise or project group. Share knowledge without publishing proprietary code to the public web.
            </p>
            <div>
              <Link
                href="/teams"
                className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 transition"
              >
                Explore Workspaces <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
          <div className="absolute right-0 bottom-0 top-0 hidden w-1/3 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-200/40 via-indigo-100/20 to-transparent md:block" />
        </section>

        {/* Product Collectives section */}
        <section className="space-y-6">
          <div className="border-b border-gray-100 pb-3 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Developer Collectives</h2>
              <p className="text-xs text-gray-500">Sub-communities organized around specific tech stacks.</p>
            </div>
            <span className="text-[10px] text-gray-400 font-mono">Powered by Tags</span>
          </div>

          {loadingCollectives ? (
            <div className="flex min-h-[200px] items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" />
            </div>
          ) : (
            <div className="grid gap-8 lg:grid-cols-3">
              {/* Collectives Side-List */}
              <div className="lg:col-span-1 space-y-3">
                {collectives.map((col) => {
                  const isJoined = user && col.members.includes(user._id);
                  const isActive = activeCollective?._id === col._id;
                  return (
                    <div
                      key={col._id}
                      onClick={() => setActiveCollective(col)}
                      className={`p-4 rounded-2xl border transition cursor-pointer flex items-center justify-between ${
                        isActive
                          ? "border-orange-300 bg-orange-50/20 shadow-sm"
                          : "border-gray-200 bg-white hover:border-gray-300"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 shrink-0 rounded-lg overflow-hidden border border-gray-100 bg-gray-50 flex items-center justify-center">
                          {col.logoUrl ? (
                            <img src={col.logoUrl} alt={col.name} className="h-full w-full object-cover" />
                          ) : (
                            <Cpu className="h-5 w-5 text-gray-400" />
                          )}
                        </div>
                        <div>
                          <h3 className="text-xs font-bold text-gray-900 line-clamp-1">{col.name}</h3>
                          <span className="text-[9px] text-gray-400 font-mono flex items-center gap-1">
                            <Users className="h-3 w-3" /> {col.members?.length || 0} members
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleJoinLeaveCollective(col._id);
                        }}
                        className={`rounded-lg px-2.5 py-1 text-[9px] font-extrabold shadow-sm transition ${
                          isJoined
                            ? "bg-gray-100 text-gray-600 border border-gray-200"
                            : "bg-[#ef8236] text-white hover:bg-[#d96e24]"
                        }`}
                      >
                        {isJoined ? "Joined" : "Join"}
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Collective details and matching questions */}
              <div className="lg:col-span-2 space-y-5 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                {activeCollective ? (
                  <>
                    <div className="space-y-2 border-b border-gray-100 pb-4">
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-extrabold text-gray-900">{activeCollective.name}</h3>
                        <span className="rounded bg-orange-50 px-2 py-0.5 text-[9px] font-bold text-orange-600 font-mono border border-orange-100">
                          #{activeCollective.tag}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">{activeCollective.description}</p>
                    </div>

                    {/* Matching Feed */}
                    <div className="space-y-4">
                      <h4 className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                        <Rss className="h-4 w-4 text-[#ef8236]" /> Recent Q&As in #{activeCollective.tag}
                      </h4>

                      {loadingQuestions ? (
                        <div className="flex py-6 justify-center">
                          <div className="h-6 w-6 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" />
                        </div>
                      ) : filteredQuestions.length === 0 ? (
                        <div className="text-center py-12 rounded-xl bg-gray-50 border border-gray-100">
                          <HelpCircle className="mx-auto h-8 w-8 text-gray-400" />
                          <p className="mt-2 text-xs text-gray-500">No questions found matching this collective's tag.</p>
                        </div>
                      ) : (
                        <div className="space-y-3 divide-y divide-gray-100">
                          {filteredQuestions.slice(0, 5).map((q: any) => (
                            <div key={q._id} className="pt-3 first:pt-0 flex items-start gap-4 text-xs">
                              <div className="flex gap-2.5 shrink-0 text-center text-[10px] text-gray-400 font-semibold mt-0.5">
                                <div>
                                  <span className="block text-gray-800 font-bold">{q.upvote.length - q.downvote.length}</span>
                                  votes
                                </div>
                                <div className={`px-1.5 py-0.5 rounded ${q.noofanswer > 0 ? "bg-green-50 text-green-700 border border-green-200" : ""}`}>
                                  <span className="block font-bold">{q.noofanswer}</span>
                                  answers
                                </div>
                              </div>
                              <div className="min-w-0 flex-1 space-y-1">
                                <h5 className="font-bold text-gray-900 hover:text-orange-500 transition truncate">
                                  <Link href={`/questions/${q._id}`}>{q.questiontitle}</Link>
                                </h5>
                                <p className="text-[10px] text-gray-500 line-clamp-1">{q.questionbody.replace(/<[^>]*>/g, "")}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <p className="text-xs text-gray-400 text-center py-12">Select a collective to explore its feed.</p>
                )}
              </div>
            </div>
          )}
        </section>
      </div>
    </Mainlayout>
  );
}
