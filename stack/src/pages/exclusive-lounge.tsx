import React, { useState, useEffect } from "react";
import Mainlayout from "@/layout/Mainlayout";
import { useAuth } from "@/lib/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Award, Lock, MessageSquare, Flame, Sparkles } from "lucide-react";
import { toast } from "react-toastify";
import { useRouter } from "next/router";

const Lounge = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [hasMounted, setHasMounted] = useState(false);

  // Mock lounge threads
  const [threads, setThreads] = useState([
    {
      id: 1,
      title: "Google DeepMind's Next Gen Coding Models - Discussion",
      author: "Aditya Sharma",
      plan: "gold",
      comments: 18,
      likes: 42,
      posted: "2 hours ago",
      content: "Let's discuss the architectural breakthroughs in model training speed and context window expansion..."
    },
    {
      id: 2,
      title: "Exclusive: Early Access APIs for StackOverflow AI Assistant",
      author: "Sarah Connor",
      plan: "gold",
      comments: 29,
      likes: 74,
      posted: "1 day ago",
      content: "The dev team has opened early access keys for Gold Lounge users to query the new semantic search index..."
    }
  ]);

  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return null;
  }

  const isGold = user && user.subscriptionStatus === "active" && user.plan === "gold";

  const handlePostSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) {
      toast.warning("Please fill in both title and content!");
      return;
    }
    const newThread = {
      id: threads.length + 1,
      title: newTitle.trim(),
      content: newContent.trim(),
      author: user?.name || "Anonymous",
      plan: "gold",
      comments: 0,
      likes: 0,
      posted: "Just now"
    };
    setThreads([newThread, ...threads]);
    setNewTitle("");
    setNewContent("");
    toast.success("Exclusive lounge post created successfully!");
  };

  const handleUpgradeRedirect = () => {
    if (!user) {
      router.push("/auth");
    } else {
      router.push(`/users/${user._id}`);
    }
  };

  return (
    <Mainlayout>
      <div className="max-w-4xl mx-auto px-4 py-6">
        
        {/* locked view */}
        {!isGold ? (
          <div className="text-center py-16 px-6 bg-gradient-to-b from-yellow-50/60 to-white border border-yellow-200 rounded-3xl shadow-md">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-yellow-100 mb-6 text-yellow-600 animate-pulse">
              <Lock className="w-8 h-8" />
            </div>
            
            <h1 className="text-3xl font-extrabold text-gray-900 mb-3 tracking-tight">
              Exclusive Gold Lounge
            </h1>
            
            <p className="text-sm font-semibold text-yellow-700 max-w-md mx-auto mb-6">
              Welcome to the Gold Lounge—a private community board reserved strictly for Gold Plan members. Here, premium developers collaborate, share early insights, and network.
            </p>

            <div className="max-w-md mx-auto bg-white border border-yellow-200 rounded-2xl p-5 mb-8 shadow-sm text-left">
              <h4 className="text-xs font-bold uppercase tracking-wider text-yellow-600 mb-3">Lounge Perks Include:</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2">✨ Early API keys & private betatests</li>
                <li className="flex items-center gap-2">💬 Ask-Me-Anything sessions with industry leads</li>
                <li className="flex items-center gap-2">🔥 Premium networking discussions</li>
              </ul>
            </div>

            <Button
              onClick={handleUpgradeRedirect}
              className="bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-white font-bold px-8 py-3 rounded-full border-none shadow-lg transform transition hover:scale-105"
            >
              {!user ? "Login to Upgrade" : "Upgrade to Gold Now"}
            </Button>
          </div>
        ) : (
          
          /* unlocked gold lounge view */
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* Header banner */}
            <div className="bg-gradient-to-r from-yellow-500 via-amber-500 to-orange-600 text-white rounded-3xl p-6 lg:p-8 shadow-md relative overflow-hidden">
              <div className="absolute right-0 top-0 transform translate-x-10 -translate-y-10 opacity-15">
                <Sparkles className="w-64 h-64" />
              </div>
              <span className="bg-white/20 text-white text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full flex items-center gap-1 w-max">
                <Award className="w-3.5 h-3.5 fill-current" />
                Premium Exclusive Feature
              </span>
              <h1 className="text-3xl font-black mt-3">Welcome to the Gold Lounge</h1>
              <p className="text-white/90 text-sm mt-2 max-w-xl">
                Collaborate with other elite StackOverflow premium members. Share early project code, read insider technical announcements, and network.
              </p>
            </div>

            {/* Create Lounge Post */}
            <Card className="border-yellow-200">
              <CardHeader>
                <CardTitle className="text-lg text-yellow-800 flex items-center gap-1.5">
                  <Sparkles className="w-5 h-5" />
                  Post an Exclusive Announcement
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePostSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="postTitle">Discussion Title</Label>
                    <Input
                      id="postTitle"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      placeholder="e.g. Early feedback on React Server Components..."
                      className="border-yellow-200 focus:ring-yellow-500 focus:border-yellow-500"
                    />
                  </div>
                  <div>
                    <Label htmlFor="postContent">Share details with other Gold members</Label>
                    <Textarea
                      id="postContent"
                      value={newContent}
                      onChange={(e) => setNewContent(e.target.value)}
                      placeholder="Write your exclusive post content here..."
                      className="min-h-24 border-yellow-200 focus:ring-yellow-500 focus:border-yellow-500"
                    />
                  </div>
                  <Button type="submit" className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold">
                    Post to Gold Lounge
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Lounge Threads list */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Flame className="w-5 h-5 text-orange-500" />
                Active Lounge Discussions
              </h3>
              
              {threads.map((thread) => (
                <Card key={thread.id} className="border-yellow-100 hover:border-yellow-300 transition-all shadow-sm">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between gap-3 mb-3">
                      <div className="flex items-center gap-2">
                        <Avatar className="w-6 h-6">
                          <AvatarFallback className="text-[10px] bg-yellow-100 text-yellow-800 font-bold">
                            {thread.author[0]}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs font-semibold text-gray-700">{thread.author}</span>
                        <Badge className="bg-yellow-500 text-white text-[9px] uppercase font-bold border-none px-1.5 py-0.2">
                          Gold
                        </Badge>
                      </div>
                      <span className="text-xs text-gray-400">{thread.posted}</span>
                    </div>

                    <h4 className="text-base font-bold text-gray-900 mb-2">{thread.title}</h4>
                    <p className="text-sm text-gray-600 leading-relaxed mb-4">{thread.content}</p>

                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1.5">
                        <MessageSquare className="w-3.5 h-3.5 text-gray-400" />
                        {thread.comments} Comments
                      </span>
                      <span className="flex items-center gap-1.5">
                        🔥 {thread.likes} Likes
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

          </div>
        )}

      </div>
    </Mainlayout>
  );
};

export default Lounge;
