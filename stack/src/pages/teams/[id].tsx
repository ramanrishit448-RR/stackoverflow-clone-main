import { useState, useEffect } from "react";
import Mainlayout from "@/layout/Mainlayout";
import axiosInstance from "@/lib/axiosinstance";
import { useRouter } from "next/router";
import { useAuth } from "@/lib/AuthContext";
import { toast } from "react-toastify";
import { ArrowLeft, Users, Send, ShieldAlert, Megaphone } from "lucide-react";

export default function TeamDetail() {
  const { user } = useAuth();
  const router = useRouter();
  const { id } = router.query;

  const [team, setTeam] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [postContent, setPostContent] = useState("");
  const [submittingPost, setSubmittingPost] = useState(false);
  const [errorStatus, setErrorStatus] = useState<number | null>(null);
  const [memberEmail, setMemberEmail] = useState("");
  const [invitingMember, setInvitingMember] = useState(false);

  const fetchTeam = async () => {
    if (!id) return;
    try {
      setLoading(true);
      setErrorStatus(null);
      const res = await axiosInstance.get(`/teams/${id}`);
      setTeam(res.data.data);
    } catch (error: any) {
      console.error("Error fetching team workspace details:", error);
      setErrorStatus(error.response?.status || 500);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeam();
  }, [id, user]);

  const handlePostSubmit = async (e: any) => {
    e.preventDefault();
    if (!postContent.trim()) return;
    try {
      setSubmittingPost(true);
      const res = await axiosInstance.post(`/teams/${id}/posts`, {
        content: postContent,
      });
      setTeam(res.data.data);
      setPostContent("");
      toast.success("Announcement posted successfully!");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to post update.");
    } finally {
      setSubmittingPost(false);
    }
  };

  const handleInviteMember = async (e: any) => {
    e.preventDefault();
    if (!memberEmail.trim()) return;
    try {
      setInvitingMember(true);
      const res = await axiosInstance.post(`/teams/${id}/add-member`, {
        email: memberEmail,
      });
      setTeam(res.data.data);
      setMemberEmail("");
      toast.success(res.data.message || "Member added successfully!");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to add member.");
    } finally {
      setInvitingMember(false);
    }
  };

  if (loading) {
    return (
      <Mainlayout>
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" />
        </div>
      </Mainlayout>
    );
  }

  // Handle Unauthorized or Not Found
  if (errorStatus === 403) {
    return (
      <Mainlayout>
        <div className="mx-auto max-w-md text-center py-16 space-y-5">
          <div className="mx-auto h-16 w-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center border border-red-100">
            <ShieldAlert className="h-8 w-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-gray-900">Access Denied</h2>
            <p className="text-xs text-gray-500 leading-relaxed">
              This is a private developer workspace. You must be invited or join the team to view details.
            </p>
          </div>
          <button
            onClick={() => router.push("/teams")}
            className="rounded-xl border border-gray-300 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition"
          >
            Back to Teams
          </button>
        </div>
      </Mainlayout>
    );
  }

  if (!team) {
    return (
      <Mainlayout>
        <div className="mx-auto max-w-md text-center py-16 space-y-4">
          <h2 className="text-xl font-bold text-gray-900">Workspace Not Found</h2>
          <button
            onClick={() => router.push("/teams")}
            className="rounded-xl bg-orange-500 px-4 py-2 text-xs font-semibold text-white hover:bg-orange-600 transition"
          >
            Back to Teams
          </button>
        </div>
      </Mainlayout>
    );
  }

  return (
    <Mainlayout>
      <div className="mx-auto max-w-5xl space-y-8 pb-12">
        {/* Navigation Header */}
        <button
          onClick={() => router.push("/teams")}
          className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-900 transition"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Teams Dashboard
        </button>

        {/* Workspace Title Card */}
        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 shrink-0 rounded-2xl overflow-hidden border border-gray-150 bg-gray-50 flex items-center justify-center font-extrabold text-2xl text-[#ef8236]">
              {team.logoUrl ? (
                <img src={team.logoUrl} alt={team.name} className="h-full w-full object-cover" />
              ) : (
                team.name.charAt(0).toUpperCase()
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-extrabold text-gray-900">{team.name}</h1>
                <span className="rounded bg-blue-50 px-2 py-0.5 text-[9px] font-bold text-blue-600 border border-blue-100">
                  Private Workspace
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1 max-w-2xl">{team.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-500 font-semibold bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100">
            <Users className="h-4 w-4 text-[#ef8236]" /> {team.members?.length || 1} Members
          </div>
        </div>

        {/* Workspace grid layout */}
        <div className="grid gap-8 md:grid-cols-3">
          {/* Main Feed panel (Announcements) */}
          <div className="md:col-span-2 space-y-6">
            <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
              <Megaphone className="h-4.5 w-4.5 text-[#ef8236]" />
              <h2 className="text-sm font-bold text-gray-800">Team Announcements & Updates</h2>
            </div>

            {/* Announcement post form */}
            <form onSubmit={handlePostSubmit} className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm space-y-3">
              <textarea
                rows={3}
                placeholder="Share a release note, API change, or general update with your team members..."
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
                className="w-full rounded-xl border border-gray-300 p-3 text-xs focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-400 transition"
                required
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={submittingPost || !postContent.trim()}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-orange-500 px-4 py-2 text-xs font-bold text-white hover:bg-orange-600 disabled:opacity-50 transition"
                >
                  <Send className="h-3.5 w-3.5" />
                  Post Update
                </button>
              </div>
            </form>

            {/* Announcements List */}
            <div className="space-y-4">
              {team.posts && team.posts.length > 0 ? (
                team.posts.slice().reverse().map((post: any, index: number) => (
                  <div
                    key={index}
                    className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm space-y-3 hover:border-gray-300 transition"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-full bg-gradient-to-br from-orange-500 to-amber-600 text-white font-bold text-xs flex items-center justify-center">
                          {post.authorName?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-gray-900">{post.authorName}</div>
                          <div className="text-[9px] text-gray-400">Team Collaborator</div>
                        </div>
                      </div>
                      <span className="text-[10px] text-gray-400">
                        {new Date(post.createdAt).toLocaleDateString()} at {new Date(post.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-xs text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {post.content}
                    </p>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-gray-200 p-12 text-center">
                  <p className="text-xs text-gray-400 italic">No updates have been posted to this team yet.</p>
                </div>
              )}
            </div>
          </div>

          {/* Members Sidebar panel */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
              <Users className="h-4.5 w-4.5 text-blue-500" />
              <h2 className="text-sm font-bold text-gray-800">Members Directory</h2>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm space-y-3">
              <p className="text-[10px] text-gray-400">List of verified users with access to this private environment.</p>

              {/* Members listing */}
              <div className="space-y-3 divide-y divide-gray-50">
                {/* Note: In a production scenario, we'd fetch full user objects.
                    We will display fallback placeholders for now. */}
                <div className="flex items-center gap-2 pt-2 first:pt-0">
                  <div className="h-7 w-7 rounded-full bg-blue-100 text-blue-800 font-bold text-[10px] flex items-center justify-center">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-gray-900 block truncate max-w-[150px]">{user?.name} (You)</span>
                    <span className="text-[9px] text-gray-400">Team Admin</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Mainlayout>
  );
}
