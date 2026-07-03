import Mainlayout from "@/layout/Mainlayout";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import axiosInstance from "@/lib/axiosinstance";

export default function TagPage() {
  const router = useRouter();
  const rawTag = Array.isArray(router.query.tag)
    ? router.query.tag[0]
    : router.query.tag;
  const tag = rawTag?.trim();
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!tag) {
      setQuestions([]);
      setLoading(false);
      return;
    }

    const fetchQuestions = async () => {
      try {
        const res = await axiosInstance.get("/question/getallquestion");
        const filtered = (res.data.data || []).filter((item: any) =>
          (item.questiontags || []).some(
            (itemTag: string) => itemTag.toLowerCase() === tag.toLowerCase(),
          ),
        );
        setQuestions(filtered);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [tag]);

  if (loading) {
    return (
      <Mainlayout>
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
      </Mainlayout>
    );
  }

  return (
    <Mainlayout>
      <div className="max-w-5xl space-y-6">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">
            Tag
          </p>
          <h1 className="mt-2 text-3xl font-bold text-gray-900">
            {tag ? `#${tag}` : "Tag"}
          </h1>
          <p className="mt-2 text-gray-600">
            {tag
              ? `Questions tagged with this topic.`
              : "Select a tag from the questions list to view related posts."}
          </p>
        </div>

        {!tag ? null : questions.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-8 text-center text-gray-600">
            No questions have been tagged with #{tag} yet.
          </div>
        ) : (
          <div className="space-y-3">
            {questions.map((item) => (
              <Link
                key={item._id}
                href={`/questions/${item._id}`}
                className="block rounded-2xl border border-gray-200 bg-white p-4 shadow-sm hover:border-blue-300"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h2 className="font-semibold text-gray-900">
                      {item.questiontitle}
                    </h2>
                    <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                      {item.questionbody}
                    </p>
                  </div>
                  <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700">
                    {item.noofanswer} answers
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </Mainlayout>
  );
}
