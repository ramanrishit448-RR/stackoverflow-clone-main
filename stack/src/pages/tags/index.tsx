import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { Search, Tag } from "lucide-react";
import Mainlayout from "@/layout/Mainlayout";
import axiosInstance from "@/lib/axiosinstance";
import { Input } from "@/components/ui/input";

export default function TagsPage() {
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const res = await axiosInstance.get("/question/getallquestion");
        setQuestions(res.data.data || []);
      } catch (error) {
        console.error("Error fetching questions for tags:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, []);

  const tagsList = useMemo(() => {
    const tagsMap: { [key: string]: number } = {};
    questions.forEach((q: any) => {
      (q.questiontags || []).forEach((t: string) => {
        const cleanTag = t.trim();
        if (cleanTag) {
          // Normalize matching but display the casing found
          const lower = cleanTag.toLowerCase();
          const existingKey = Object.keys(tagsMap).find(
            (k) => k.toLowerCase() === lower
          );
          if (existingKey) {
            tagsMap[existingKey] += 1;
          } else {
            tagsMap[cleanTag] = 1;
          }
        }
      });
    });

    return Object.keys(tagsMap)
      .map((name) => ({
        name,
        count: tagsMap[name],
      }))
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
  }, [questions]);

  const filteredTags = useMemo(() => {
    return tagsList.filter((t) =>
      t.name.toLowerCase().includes(searchQuery.toLowerCase().trim())
    );
  }, [tagsList, searchQuery]);

  // Helper to generate a description for tags
  const getTagDescription = (tagName: string) => {
    const name = tagName.toLowerCase();
    if (name === "javascript" || name === "js") {
      return "For queries related to JavaScript, its specifications, dialects, and runtime environments.";
    }
    if (name === "python" || name === "py") {
      return "Python is a multi-paradigm, dynamically typed, multipurpose programming language.";
    }
    if (name === "react" || name === "reactjs") {
      return "React is a popular, declarative, efficient component-based JavaScript library for building user interfaces.";
    }
    if (name === "node" || name === "nodejs") {
      return "Node.js is an event-based, non-blocking asynchronous JavaScript runtime environment built on Chrome's V8 engine.";
    }
    if (name === "html") {
      return "HTML is the standard markup language for documents designed to be displayed in a web browser.";
    }
    if (name === "css") {
      return "CSS is a style sheet language used for describing the presentation of a document written in HTML.";
    }
    if (name === "typescript" || name === "ts") {
      return "TypeScript is a typed superset of JavaScript that compiles to plain JavaScript.";
    }
    if (name === "nextjs" || name === "next") {
      return "Next.js is a flexible React framework that gives you building blocks to create fast web applications.";
    }
    if (name === "mongodb" || name === "mongo") {
      return "MongoDB is a document-oriented database classified as a NoSQL database.";
    }
    if (name === "java") {
      return "Java is a popular general-purpose programming language that is class-based and object-oriented.";
    }
    return `Explore all community discussions, solutions, and questions tagged with #${tagName}.`;
  };

  if (loading) {
    return (
      <Mainlayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600"></div>
        </div>
      </Mainlayout>
    );
  }

  return (
    <Mainlayout>
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Header Block with Premium Aesthetics */}
        <div className="mb-8 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm bg-gradient-to-r from-white to-blue-50/20">
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <Tag className="w-6 h-6 text-orange-500" />
            Tags
          </h1>
          <p className="mt-3 text-gray-600 max-w-2xl text-sm lg:text-base leading-relaxed">
            A tag is a keyword or label that categorizes your question with other,
            similar questions. Using the right tags makes it easier for others to
            find and answer your question.
          </p>
        </div>

        {/* Filter Section */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center">
          <div className="relative max-w-md w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by tag name"
              className="pl-10 h-10 rounded-xl"
            />
          </div>
          <div className="text-sm text-gray-500 self-center">
            Showing {filteredTags.length} of {tagsList.length} tags
          </div>
        </div>

        {/* Tags Grid */}
        {filteredTags.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-gray-200 bg-gray-50 p-12 text-center text-gray-500">
            <Tag className="w-8 h-8 text-gray-400 mx-auto mb-2 opacity-50" />
            No tags found matching "{searchQuery}"
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredTags.map((tag) => (
              <div
                key={tag.name}
                className="border border-gray-200 bg-white rounded-2xl p-5 hover:shadow-md hover:border-blue-200 transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3 gap-2">
                    <Link
                      href={`/tags/${encodeURIComponent(tag.name)}`}
                      className="inline-block bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold px-2.5 py-1 rounded-md transition-colors"
                    >
                      {tag.name}
                    </Link>
                    <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full whitespace-nowrap">
                      {tag.count} {tag.count === 1 ? "question" : "questions"}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 line-clamp-3 leading-relaxed">
                    {getTagDescription(tag.name)}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-gray-50 text-right">
                  <Link
                    href={`/tags/${encodeURIComponent(tag.name)}`}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    View questions &rarr;
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Mainlayout>
  );
}
