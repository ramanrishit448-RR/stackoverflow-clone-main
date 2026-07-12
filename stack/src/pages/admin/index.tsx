import { useEffect, useState } from "react";
import axiosInstance from "@/lib/axiosinstance";
import { useAuth } from "@/lib/AuthContext";
import { useRouter } from "next/router";
import Mainlayout from "@/layout/Mainlayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "react-toastify";
import { Shield, AlertTriangle, Lock } from "lucide-react";

export default function AdminPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Tab State
  const [activeTab, setActiveTab] = useState("reports");
  const [loginLogs, setLoginLogs] = useState<any[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  const fetchReports = async () => {
    try {
      const res = await axiosInstance.get("/admin/reports?status=pending");
      setReports(res.data.data || []);
    } catch {
      toast.error("Access denied or failed to load reports");
      router.push("/feed");
    } finally {
      setLoading(false);
    }
  };

  const fetchLoginLogs = async () => {
    setLoadingLogs(true);
    try {
      const res = await axiosInstance.get("/admin/login-activity");
      if (res.data.success) {
        setLoginLogs(res.data.data || []);
      }
    } catch {
      toast.error("Failed to load security activity logs");
    } finally {
      setLoadingLogs(false);
    }
  };

  useEffect(() => {
    if (!user) {
      router.push("/auth");
      return;
    }
    if (user.role !== "admin") {
      toast.error("Access denied. Admin role required.");
      router.push("/feed");
      return;
    }
    if (activeTab === "reports") {
      fetchReports();
    } else if (activeTab === "loginLogs") {
      fetchLoginLogs();
    }
  }, [user, activeTab]);

  const handleReview = async (
    reportId: string,
    action: "dismiss" | "remove" | "suspend"
  ) => {
    try {
      await axiosInstance.patch(`/admin/reports/${reportId}`, {
        status: action === "dismiss" ? "dismissed" : "reviewed",
        removePost: action === "remove" || action === "suspend",
        suspendUser: action === "suspend",
        suspendDays: action === "suspend" ? 7 : undefined,
        adminNote: `Action: ${action}`,
      });
      toast.success(`Report ${action === "dismiss" ? "dismissed" : "reviewed"}`);
      fetchReports();
    } catch {
      toast.error("Failed to review report");
    }
  };

  return (
    <Mainlayout>
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex items-center gap-2 mb-6">
          <Shield className="w-6 h-6 text-orange-500" />
          <h1 className="text-xl font-bold">Admin Moderation Portal</h1>
        </div>

        {/* Admin Tabs */}
        <div className="flex border-b border-gray-200 mb-6 gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab("reports")}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === "reports" ? "border-orange-500 text-orange-600" : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            Pending Reports ({reports.length})
          </button>

          <button
            onClick={() => setActiveTab("loginLogs")}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === "loginLogs" ? "border-orange-500 text-orange-600" : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            Login Security Auditing Logs ({loginLogs.length})
          </button>
        </div>

        {activeTab === "reports" ? (
          loading ? (
            <p className="text-gray-400 text-center py-8">Loading reports...</p>
          ) : reports.length === 0 ? (
            <div className="bg-white border rounded-lg p-8 text-center">
              <p className="text-gray-500">No pending reports. All clear!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reports.map((report) => (
                <div key={report._id} className="bg-white border rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="destructive" className="text-xs">
                          Pending
                        </Badge>
                        <span className="text-xs text-gray-400">
                          by {report.reporterId?.name || "Unknown"}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-gray-800 mb-1">
                        Reason: {report.reason}
                      </p>
                      {report.postId && (
                        <p className="text-sm text-gray-600 bg-gray-50 rounded p-2 mb-3">
                          Post by {report.postId.authorName}: &quot;
                          {report.postId.content?.slice(0, 150)}
                          {report.postId.content?.length > 150 ? "..." : ""}&quot;
                        </p>
                      )}
                      <div className="flex flex-wrap gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleReview(report._id, "dismiss")}
                        >
                          Dismiss
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleReview(report._id, "remove")}
                        >
                          Remove Post
                        </Button>
                        <Button
                          size="sm"
                          className="bg-red-700 hover:bg-red-800"
                          onClick={() => handleReview(report._id, "suspend")}
                        >
                          Remove & Suspend User (7d)
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          loadingLogs ? (
            <p className="text-gray-400 text-center py-8">Loading security auditing logs...</p>
          ) : loginLogs.length === 0 ? (
            <div className="bg-white border rounded-lg p-8 text-center">
              <p className="text-gray-500">No login security logs registered yet.</p>
            </div>
          ) : (
            <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-gray-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-gray-150">
                    <tr>
                      <th className="px-5 py-3.5">User / Email</th>
                      <th className="px-5 py-3.5">Browser & OS</th>
                      <th className="px-5 py-3.5">IP & Location</th>
                      <th className="px-5 py-3.5">Security Status</th>
                      <th className="px-5 py-3.5 text-right">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-slate-700">
                    {loginLogs.map((log) => (
                      <tr key={log._id} className="hover:bg-slate-50/50 transition">
                        <td className="px-5 py-3.5 font-medium">
                          <div>{log.userId?.name || "Unregistered Guest"}</div>
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5">{log.email}</div>
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="font-semibold">{log.browser}</div>
                          <div className="text-[10px] text-slate-500 mt-0.5">{log.os} • {log.deviceType}</div>
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="font-mono text-slate-600">{log.ip}</div>
                          <div className="text-[10px] text-slate-500 mt-0.5">{log.location}</div>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className={`inline-flex px-2 py-0.5 text-[9px] font-bold rounded-full uppercase tracking-wider ${
                            log.status === "success" ? "bg-green-100 text-green-800" :
                            log.status === "pending_otp" ? "bg-amber-100 text-amber-800" :
                            log.status === "failed_password" || log.status === "otp_failed" ? "bg-red-100 text-red-800" :
                            "bg-slate-100 text-slate-800"
                          }`}>
                            {log.status}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-right text-slate-400 font-medium">
                          {new Date(log.timestamp).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )
        )}
      </div>
    </Mainlayout>
  );
}
