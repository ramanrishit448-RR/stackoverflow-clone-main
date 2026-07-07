import { useEffect, useState } from "react";
import Mainlayout from "@/layout/Mainlayout";
import axiosInstance from "@/lib/axiosinstance";
import { useRouter } from "next/router";
import { useAuth } from "@/lib/AuthContext";
import { toast } from "react-toastify";
import { Users, PlusCircle, ArrowRight, Shield, Layers, HelpCircle, Lock } from "lucide-react";

export default function TeamsIndex() {
  const { user } = useAuth();
  const router = useRouter();

  const [teams, setTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMounted, setHasMounted] = useState(false);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [teamName, setTeamName] = useState("");
  const [teamDesc, setTeamDesc] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [creating, setCreating] = useState(false);

  const fetchTeams = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const res = await axiosInstance.get("/teams");
      setTeams(res.data.data);
    } catch (error: any) {
      console.error("Error fetching teams:", error);
      toast.error("Failed to load teams workspace.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setHasMounted(true);
    fetchTeams();
  }, [user]);

  const handleCreateTeamSubmit = async (e: any) => {
    e.preventDefault();
    if (!teamName.trim() || !teamDesc.trim()) {
      toast.warning("Team Name and Description are required.");
      return;
    }
    try {
      setCreating(true);
      const res = await axiosInstance.post("/teams", {
        name: teamName,
        description: teamDesc,
        logoUrl: logoUrl,
      });
      toast.success("Team created successfully!");
      setShowModal(false);
      setTeamName("");
      setTeamDesc("");
      setLogoUrl("");
      // Redirect to newly created team
      router.push(`/teams/${res.data.data._id}`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create team.");
    } finally {
      setCreating(false);
    }
  };

  const handleJoinTeam = async (teamId: string) => {
    try {
      await axiosInstance.post(`/teams/${teamId}/join`);
      toast.success("Successfully joined the team!");
      fetchTeams();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to join team.");
    }
  };

  if (!hasMounted) {
    return (
      <Mainlayout>
        <div className="flex min-h-[300px] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" />
        </div>
      </Mainlayout>
    );
  }

  if (!user) {
    return (
      <Mainlayout>
        <div className="mx-auto max-w-5xl space-y-12 py-6">
          {/* Landing Showcase for Logged-Out Users */}
          <section className="rounded-3xl border border-blue-100 bg-gradient-to-br from-indigo-50 via-white to-sky-50 p-8 text-center shadow-sm">
            <Lock className="mx-auto h-12 w-12 text-[#ef8236] mb-4" />
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
              Stack Overflow for Teams
            </h1>
            <p className="mt-3 mx-auto max-w-2xl text-base text-gray-600 leading-relaxed">
              Bring your developers together in a private, secure collaboration workspace. Ask private questions, share announcements, and organize institutional knowledge.
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <button
                onClick={() => router.push("/auth")}
                className="rounded-xl bg-[#ef8236] px-5 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-[#d96e24] transition-all"
              >
                Log In to Get Started
              </button>
            </div>
          </section>

          {/* Benefits Grid */}
          <section className="grid gap-6 md:grid-cols-3">
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <Shield className="h-8 w-8 text-blue-500 mb-3" />
              <h3 className="text-sm font-bold text-gray-900">Private & Secure</h3>
              <p className="mt-2 text-xs text-gray-500 leading-relaxed">
                Ensure sensitive code questions and company details remain restricted solely to verified team members.
              </p>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <Layers className="h-8 w-8 text-orange-500 mb-3" />
              <h3 className="text-sm font-bold text-gray-900">Centralized Knowledge</h3>
              <p className="mt-2 text-xs text-gray-500 leading-relaxed">
                Publish team announcements, release updates, and build an internal repository of developer information.
              </p>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <HelpCircle className="h-8 w-8 text-green-500 mb-3" />
              <h3 className="text-sm font-bold text-gray-900">Structured Discussions</h3>
              <p className="mt-2 text-xs text-gray-500 leading-relaxed">
                Keep project documentation alive through collaborative discussion boards and announcement feeds.
              </p>
            </div>
          </section>
        </div>
      </Mainlayout>
    );
  }

  // Filter teams user belongs to vs teams they can join
  const myTeams = teams.filter((t) => t.members.includes(user._id));
  const publicTeams = teams.filter((t) => !t.members.includes(user._id));

  return (
    <Mainlayout>
      <div className="mx-auto max-w-5xl space-y-8">
        {/* Header Dashboard section */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-gray-100 pb-5">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">Internal Teams Dashboard</h1>
            <p className="text-xs text-gray-500">Access private workspaces or explore public collaborative groups.</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-orange-500 px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-orange-600 transition"
          >
            <PlusCircle className="h-4.5 w-4.5" />
            Create Team Workspace
          </button>
        </div>

        {loading ? (
          <div className="flex min-h-[300px] items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" />
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2">
            {/* My Teams */}
            <div className="space-y-4">
              <h2 className="text-base font-bold text-gray-800 flex items-center gap-2">
                <Shield className="h-4.5 w-4.5 text-blue-500" />
                Joined Workspaces ({myTeams.length})
              </h2>

              {myTeams.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-gray-300 p-8 text-center space-y-3">
                  <p className="text-xs text-gray-500">You are not a member of any workspace yet.</p>
                  <button
                    onClick={() => setShowModal(true)}
                    className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 transition"
                  >
                    Create one now
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {myTeams.map((team) => (
                    <div
                      key={team._id}
                      onClick={() => router.push(`/teams/${team._id}`)}
                      className="group flex items-center justify-between p-4 rounded-xl border border-gray-200 bg-white hover:border-orange-300 hover:shadow-sm cursor-pointer transition"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 shrink-0 rounded-lg overflow-hidden border border-gray-100 bg-gray-50 flex items-center justify-center font-bold text-[#ef8236]">
                          {team.logoUrl ? (
                            <img src={team.logoUrl} alt={team.name} className="h-full w-full object-cover" />
                          ) : (
                            team.name.charAt(0).toUpperCase()
                          )}
                        </div>
                        <div>
                          <h3 className="text-xs font-bold text-gray-900 group-hover:text-[#ef8236] transition">
                            {team.name}
                          </h3>
                          <p className="text-[10px] text-gray-500 line-clamp-1">{team.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-medium">
                        <Users className="h-3.5 w-3.5" /> {team.members?.length || 1} members
                        <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Discover Public Teams */}
            <div className="space-y-4">
              <h2 className="text-base font-bold text-gray-800 flex items-center gap-2">
                <Layers className="h-4.5 w-4.5 text-orange-500" />
                Discover Public Groups ({publicTeams.length})
              </h2>

              {publicTeams.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-gray-300 p-8 text-center">
                  <p className="text-xs text-gray-500">No other public groups are available to join.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {publicTeams.map((team) => (
                    <div
                      key={team._id}
                      className="flex items-center justify-between p-4 rounded-xl border border-gray-200 bg-white hover:border-gray-300 transition"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="h-10 w-10 shrink-0 rounded-lg overflow-hidden border border-gray-100 bg-gray-50 flex items-center justify-center font-bold text-gray-400">
                          {team.logoUrl ? (
                            <img src={team.logoUrl} alt={team.name} className="h-full w-full object-cover" />
                          ) : (
                            team.name.charAt(0).toUpperCase()
                          )}
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-xs font-bold text-gray-900 truncate">{team.name}</h3>
                          <p className="text-[10px] text-gray-500 truncate">{team.description}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleJoinTeam(team._id)}
                        className="rounded-lg bg-gray-100 px-3 py-1.5 text-[10px] font-bold text-gray-700 hover:bg-orange-500 hover:text-white transition shrink-0"
                      >
                        Join Team
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Create Team Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
              <div>
                <h3 className="text-base font-bold text-gray-900">Create Private Workspace</h3>
                <p className="text-[10px] text-gray-500">Form a team dashboard for private updates and members.</p>
              </div>

              <form onSubmit={handleCreateTeamSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label htmlFor="name" className="text-[10px] font-semibold text-gray-700">
                    Workspace Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="name"
                    type="text"
                    placeholder="e.g. Next.js Core Devs"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    className="w-full rounded-xl border border-gray-300 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-400 transition"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="logo" className="text-[10px] font-semibold text-gray-700">
                    Logo Image URL
                  </label>
                  <input
                    id="logo"
                    type="url"
                    placeholder="https://images.unsplash.com/photo-..."
                    value={logoUrl}
                    onChange={(e) => setLogoUrl(e.target.value)}
                    className="w-full rounded-xl border border-gray-300 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-400 transition"
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="desc" className="text-[10px] font-semibold text-gray-700">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="desc"
                    rows={3}
                    placeholder="Describe the scope, objectives, or organization of this team..."
                    value={teamDesc}
                    onChange={(e) => setTeamDesc(e.target.value)}
                    className="w-full rounded-xl border border-gray-300 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-400 transition"
                    required
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="rounded-lg border border-gray-300 px-4 py-2 text-[10px] font-bold text-gray-700 hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creating}
                    className="rounded-lg bg-orange-500 px-4 py-2 text-[10px] font-bold text-white shadow-sm hover:bg-orange-600 disabled:opacity-50 transition"
                  >
                    {creating ? "Creating..." : "Create Team"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Mainlayout>
  );
}
