import { useEffect, useState } from "react";
import axiosInstance from "@/lib/axiosinstance";
import { useAuth } from "@/lib/AuthContext";
import { useRouter } from "next/router";
import Mainlayout from "@/layout/Mainlayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "react-toastify";
import { Shield, AlertTriangle } from "lucide-react";

export default function AdminPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    if (!user) {
      router.push("/auth");
      return;
    }
    fetchReports();
  }, [user]);

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
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-2 mb-6">
          <Shield className="w-6 h-6 text-orange-500" />
          <h1 className="text-xl font-bold">Admin Moderation</h1>
        </div>

        {loading ? (
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
        )}
      </div>
    </Mainlayout>
  );
}
