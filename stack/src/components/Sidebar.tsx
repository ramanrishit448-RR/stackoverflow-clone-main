import { cn } from "@/lib/utils";
import {
  Bookmark,
  Bot,
  Building,
  FileText,
  Home,
  MessageSquare,
  Rss,
  Tag,
  Trophy,
  Users,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import React from "react";
import { Badge } from "./ui/badge";

const Sidebar = ({ isopen, onClose }: any) => {
  return (
    <div className="md:relative">
      <aside
        className={cn(
          "fixed inset-y-[53px] left-0 z-40 w-64 min-h-screen bg-white shadow-lg border-r transition-transform duration-200 ease-in-out md:static md:translate-x-0 md:w-64",
          isopen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        )}
      >
        <nav className="p-2 lg:p-4">
          <ul className="space-y-1">
            <li>
              <Link
                href="/feed"
                onClick={onClose}
                className="flex items-center px-2 py-2 text-gray-700 hover:bg-gray-100 rounded text-sm"
              >
                <Rss className="w-4 h-4 mr-2 lg:mr-3" />
                Community Feed
              </Link>
            </li>
            <li>
              <Link
                href="/"
                onClick={onClose}
                className="flex items-center px-2 py-2 text-gray-700 hover:bg-gray-100 rounded text-sm"
              >
                <Home className="w-4 h-4 mr-2 lg:mr-3" />
                Questions
              </Link>
            </li>
            <li>
              <Link
                href="/ai-assist"
                onClick={onClose}
                className="flex items-center px-2 py-2 text-gray-700 hover:bg-gray-100 rounded text-sm"
              >
                <Bot className="w-4 h-4 mr-2 lg:mr-3" />
                AI Assist
                <Badge variant="secondary" className="ml-auto text-xs">
                  Labs
                </Badge>
              </Link>
            </li>
            <li>
              <Link
                href="/tags"
                onClick={onClose}
                className="flex items-center px-2 py-2 text-gray-700 hover:bg-gray-100 rounded text-sm"
              >
                <Tag className="w-4 h-4 mr-2 lg:mr-3" />
                Tags
              </Link>
            </li>
            <li>
              <Link
                href="/users"
                onClick={onClose}
                className="flex items-center px-2 py-2 text-gray-700 hover:bg-gray-100 rounded text-sm"
              >
                <Users className="w-4 h-4 mr-2 lg:mr-3" />
                Users
              </Link>
            </li>
            <li>
              <Link
                href="/feed/bookmarks"
                onClick={onClose}
                className="flex items-center px-2 py-2 text-gray-700 hover:bg-gray-100 rounded text-sm"
              >
                <Bookmark className="w-4 h-4 mr-2 lg:mr-3" />
                Saves
              </Link>
            </li>
            <li>
              <Link
                href="/exclusive-lounge"
                onClick={onClose}
                className="flex items-center px-2 py-2 text-yellow-800 bg-yellow-50/50 hover:bg-yellow-100/70 rounded text-sm font-semibold border border-yellow-200/50"
              >
                <Sparkles className="w-4 h-4 mr-2 lg:mr-3 text-yellow-600 fill-current" />
                Gold Lounge
              </Link>
            </li>
            <li>
              <Link
                href="/challenges"
                onClick={onClose}
                className="flex items-center px-2 py-2 text-gray-700 hover:bg-gray-100 rounded text-sm"
              >
                <Trophy className="w-4 h-4 mr-2 lg:mr-3" />
                Challenges
                <Badge
                  variant="secondary"
                  className="ml-auto text-xs bg-orange-100 text-orange-800"
                >
                  NEW
                </Badge>
              </Link>
            </li>
            <li>
              <Link
                href="/chat"
                onClick={onClose}
                className="flex items-center px-2 py-2 text-gray-700 hover:bg-gray-100 rounded text-sm"
              >
                <MessageSquare className="w-4 h-4 mr-2 lg:mr-3" />
                Chat
              </Link>
            </li>
            <li>
              <Link
                href="/articles"
                onClick={onClose}
                className="flex items-center px-2 py-2 text-gray-700 hover:bg-gray-100 rounded text-sm"
              >
                <FileText className="w-4 h-4 mr-2 lg:mr-3" />
                Articles
              </Link>
            </li>
            <li>
              <Link
                href="/companies"
                onClick={onClose}
                className="flex items-center px-2 py-2 text-gray-700 hover:bg-gray-100 rounded text-sm"
              >
                <Building className="w-4 h-4 mr-2 lg:mr-3" />
                Companies
              </Link>
            </li>
          </ul>
        </nav>
      </aside>
    </div>
  );
};

export default Sidebar;
