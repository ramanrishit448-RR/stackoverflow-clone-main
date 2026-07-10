import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Mainlayout from "@/layout/Mainlayout";
import { useAuth } from "@/lib/AuthContext";
import axiosInstance from "@/lib/axiosinstance";
import { Calendar, Edit, Plus, X, Award, ShieldAlert, CreditCard, HelpCircle, Mail, Download, Check, Users, BookOpen, MessageSquare, Rss, History } from "lucide-react";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";

const index = () => {
  const { user, refreshUser } = useAuth();
  const router = useRouter();
  const { id } = router.query;
  
  const [users, setusers] = useState<any>(null);
  const [loading, setloading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  
  // Tab control: "profile" | "billing" | "support"
  const [activeTab, setActiveTab] = useState<string>("profile");
  
  // Edit Profile Form
  const [editForm, setEditForm] = useState({
    name: "",
    about: "",
    tags: [] as string[],
    emailNotifications: true,
    smsNotifications: false,
  });
  const [newTag, setNewTag] = useState("");
  const [following, setFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);

  // Reputation States
  const [reputationHistory, setReputationHistory] = useState<any[]>([]);
  const [reputationTransfers, setReputationTransfers] = useState<any[]>([]);
  const [loadingReputation, setLoadingReputation] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [transferAmount, setTransferAmount] = useState("");
  const [transferReason, setTransferReason] = useState("");

  // Billing & Invoices state
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loadingInvoices, setLoadingInvoices] = useState(false);
  const [billingForm, setBillingForm] = useState({
    billingName: "",
    billingEmail: "",
    billingAddress: "",
  });
  const [isUpdatingBilling, setIsUpdatingBilling] = useState(false);

  // Checkout simulation state
  const [selectedUpgradePlan, setSelectedUpgradePlan] = useState<string | null>(null);
  const [isMockModalOpen, setIsMockModalOpen] = useState(false);
  const [mockOrderId, setMockOrderId] = useState("");
  const [mockAmount, setMockAmount] = useState(0);
  const [mockForm, setMockForm] = useState({
    name: "",
    email: "",
    address: "",
  });

  // Support Ticketing state
  const [supportForm, setSupportForm] = useState({
    subject: "",
    message: "",
  });
  const [isSubmittingSupport, setIsSubmittingSupport] = useState(false);

  const [userPosts, setUserPosts] = useState<any[]>([]);
  const [userArticles, setUserArticles] = useState<any[]>([]);
  const [userTeams, setUserTeams] = useState<any[]>([]);
  const [loadingUserActivity, setLoadingUserActivity] = useState(false);

  const fetchUserActivity = async () => {
    if (!id) return;
    try {
      setLoadingUserActivity(true);
      const postsRes = await axiosInstance.get(`/feed?authorId=${id}`);
      setUserPosts(postsRes.data.data || []);

      const articlesRes = await axiosInstance.get(`/articles?authorId=${id}`);
      setUserArticles(articlesRes.data.data || []);

      if (user) {
        const teamsRes = await axiosInstance.get("/teams");
        const joined = (teamsRes.data.data || []).filter((t: any) =>
          t.members.some((m: any) => (m._id || m) === id)
        );
        setUserTeams(joined);
      }
    } catch (err) {
      console.error("Failed to fetch user activity:", err);
    } finally {
      setLoadingUserActivity(false);
    }
  };

  const fetchInvoices = async () => {
    if (!id || id !== user?._id) return;
    setLoadingInvoices(true);
    try {
      const res = await axiosInstance.get("/payment/invoices");
      if (res.data.success) {
        setInvoices(res.data.data);
      }
    } catch (err) {
      console.error("Failed to fetch invoices:", err);
    } finally {
      setLoadingInvoices(false);
    }
  };

  useEffect(() => {
    const fetchuser = async () => {
      if (!id) return;
      try {
        const res = await axiosInstance.get("/user/getalluser");
        const matcheduser = res.data.data.find((u: any) => u._id === id);
        setusers(matcheduser);
        
        if (matcheduser) {
          setBillingForm({
            billingName: matcheduser.billingName || matcheduser.name || "",
            billingEmail: matcheduser.billingEmail || matcheduser.email || "",
            billingAddress: matcheduser.billingAddress || "",
          });
        }

        if (user) {
          const followRes = await axiosInstance.get(
            `/follow/${id}/follow-status`,
          );
          setFollowing(followRes.data.data.following);
          setFollowerCount(followRes.data.data.followerCount);
        }
      } catch (error) {
        console.log(error);
      } finally {
        setloading(false);
      }
    };
    const fetchReputationData = async () => {
      if (!id) return;
      try {
        setLoadingReputation(true);
        const historyRes = await axiosInstance.get(`/user/reputation/history/${id}`);
        setReputationHistory(historyRes.data.data || []);
        
        const transfersRes = await axiosInstance.get(`/user/reputation/transfers/${id}`);
        setReputationTransfers(transfersRes.data.data || []);
      } catch (err) {
        console.error("Failed to fetch reputation data:", err);
      } finally {
        setLoadingReputation(false);
      }
    };

    fetchuser();
    fetchUserActivity();
    fetchReputationData();
    
    if (id && user && id === user._id) {
      fetchInvoices();
    }
  }, [id, user]);

  const handleTransferSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axiosInstance.post("/user/reputation/transfer", {
        receiverId: id,
        amount: transferAmount,
        reason: transferReason
      });
      
      if (res.data) {
        toast.success(res.data.message);
        setIsTransferModalOpen(false);
        setTransferAmount("");
        setTransferReason("");
        
        const resUser = await axiosInstance.get("/user/getalluser");
        const matcheduser = resUser.data.data.find((u: any) => u._id === id);
        setusers(matcheduser);
        
        // Refresh history and parent user context
        const historyRes = await axiosInstance.get(`/user/reputation/history/${id}`);
        setReputationHistory(historyRes.data.data || []);
        const transfersRes = await axiosInstance.get(`/user/reputation/transfers/${id}`);
        setReputationTransfers(transfersRes.data.data || []);
        refreshUser();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to transfer points");
    }
  };

  const handleFollow = async () => {
    if (!user) {
      router.push("/auth");
      return;
    }
    try {
      if (following) {
        await axiosInstance.delete(`/follow/${id}/follow`);
        setFollowing(false);
        setFollowerCount((c) => Math.max(0, c - 1));
        toast.info("Unfollowed");
      } else {
        await axiosInstance.post(`/follow/${id}/follow`);
        setFollowing(true);
        setFollowerCount((c) => c + 1);
        toast.success("Following!");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update follow");
    }
  };

  const handleSaveProfile = async () => {
    try {
      const res = await axiosInstance.patch(`/user/update/${user?._id}`, {
        editForm,
      });
      if (res.data.data) {
        const updatedUser = {
          ...users,
          name: editForm.name,
          about: editForm.about,
          tags: editForm.tags,
          emailNotifications: editForm.emailNotifications,
          smsNotifications: editForm.smsNotifications,
        };

        setusers(updatedUser);
        setIsEditing(false);
        toast.success("Profile updated successfully!");
        refreshUser();
      }
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong");
    }
  };

  const handleAddTag = () => {
    const trimmedTag = newTag.trim();
    if (trimmedTag && !editForm.tags.includes(trimmedTag)) {
      setEditForm({ ...editForm, tags: [...editForm.tags, trimmedTag] });
      setNewTag("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setEditForm({
      ...editForm,
      tags: editForm.tags.filter((tag: any) => tag !== tagToRemove),
    });
  };

  // Billing Update Submit
  const handleBillingUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingBilling(true);
    try {
      const res = await axiosInstance.post("/payment/update-billing", billingForm);
      if (res.data.success) {
        toast.success("Billing details updated successfully!");
        setusers({
          ...users,
          billingName: billingForm.billingName,
          billingEmail: billingForm.billingEmail,
          billingAddress: billingForm.billingAddress,
        });
        refreshUser();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update billing details");
    } finally {
      setIsUpdatingBilling(false);
    }
  };

  // Load Razorpay Script
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if ((window as any).Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // Initiate Plan Upgrade Order
  const handleUpgradeOrder = async (plan: string) => {
    setSelectedUpgradePlan(plan);
    try {
      const res = await axiosInstance.post("/payment/create-order", { plan });
      if (res.data.success) {
        if (res.data.isMock) {
          // Fallback to Mock Payment Dialog
          setMockOrderId(res.data.orderId);
          setMockAmount(res.data.amount);
          setMockForm({
            name: user?.billingName || user?.name || "",
            email: user?.billingEmail || user?.email || "",
            address: user?.billingAddress || "",
          });
          setIsMockModalOpen(true);
        } else {
          // Razorpay Sandbox checkout flow
          const sdkLoaded = await loadRazorpayScript();
          if (!sdkLoaded) {
            toast.error("Failed to load Razorpay checkout script.");
            return;
          }
          const options = {
            key: res.data.key,
            amount: res.data.amount,
            currency: "INR",
            name: "StackOverflow Premium",
            description: `${plan.toUpperCase()} Plan Subscription`,
            order_id: res.data.orderId,
            handler: async function (response: any) {
              try {
                const verifyRes = await axiosInstance.post("/payment/verify", {
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  plan,
                  billingDetails: {
                    name: user?.billingName || user?.name,
                    email: user?.billingEmail || user?.email,
                    address: user?.billingAddress || "Razorpay Payment Gateway",
                  },
                });
                if (verifyRes.data.success) {
                  toast.success(`Successfully upgraded to ${plan.toUpperCase()} Plan!`);
                  const updatedUser = await refreshUser();
                  setusers(updatedUser);
                  fetchInvoices();
                }
              } catch (verifyErr: any) {
                toast.error(verifyErr.response?.data?.message || "Signature validation failed");
              }
            },
            prefill: {
              name: user?.name,
              email: user?.email,
            },
            theme: {
              color: "#ef8236",
            },
          };
          const rzp = new (window as any).Razorpay(options);
          rzp.open();
        }
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to initiate transaction");
    }
  };

  // Mock checkout submit
  const handleMockVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUpgradePlan) return;
    try {
      const verifyRes = await axiosInstance.post("/payment/verify", {
        isMock: true,
        razorpay_order_id: mockOrderId,
        razorpay_payment_id: `mock_txn_${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
        plan: selectedUpgradePlan,
        billingDetails: {
          name: mockForm.name,
          email: mockForm.email,
          address: mockForm.address,
        },
      });
      if (verifyRes.data.success) {
        toast.success(`Mock Payment Successful! Upgraded to ${selectedUpgradePlan.toUpperCase()}`);
        setIsMockModalOpen(false);
        const updatedUser = await refreshUser();
        setusers(updatedUser);
        fetchInvoices();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Mock verification failed");
    }
  };

  // Invoice Download handler
  const handleInvoiceDownload = async (invoiceId: string, invoiceNumber: string) => {
    try {
      const response = await axiosInstance.get(`/payment/invoices/${invoiceId}/download`, {
        responseType: "blob",
      });
      const blob = new Blob([response.data], { type: "application/pdf" });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.setAttribute("download", `invoice-${invoiceNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate and download invoice PDF");
    }
  };

  // Priority Support Submit handler
  const handleSupportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supportForm.subject.trim() || !supportForm.message.trim()) {
      toast.warning("Please fill in all fields.");
      return;
    }
    setIsSubmittingSupport(true);
    try {
      const res = await axiosInstance.post("/payment/support-ticket", supportForm);
      if (res.data.success) {
        toast.success("Priority Support Ticket Submitted successfully!");
        setSupportForm({ subject: "", message: "" });
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to submit priority support request");
    } finally {
      setIsSubmittingSupport(false);
    }
  };

  if (loading) {
    return (
      <Mainlayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-orange-500"></div>
        </div>
      </Mainlayout>
    );
  }

  if (!users) {
    return (
      <Mainlayout>
        <div className="text-center text-gray-500 mt-4">No user found.</div>
      </Mainlayout>
    );
  }

  const currentUserId = user?._id;
  const isOwnProfile = id === currentUserId;
  
  const activePlan = users.subscriptionStatus === "active" ? (users.plan || "free") : "free";

  return (
    <Mainlayout>
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* User Header Block */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6 mb-8 bg-white border border-gray-200 rounded-3xl p-6 shadow-sm">
          <div className="relative">
            <Avatar className="w-24 h-24 lg:w-32 lg:h-32 border-4 border-white shadow-md">
              <AvatarFallback className="text-2xl lg:text-3xl bg-orange-100 text-orange-800 font-bold">
                {users.name
                  .split(" ")
                  .map((n: any) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            {activePlan !== "free" && (
              <span className={`absolute -bottom-2 -right-2 px-3 py-1 text-xs font-bold text-white rounded-full uppercase shadow-md ${
                activePlan === "gold" ? "bg-gradient-to-r from-amber-500 to-yellow-400" :
                activePlan === "silver" ? "bg-gradient-to-r from-slate-400 to-gray-300 text-slate-900" :
                "bg-amber-700"
              }`}>
                {activePlan}
              </span>
            )}
          </div>

          <div className="flex-grow min-w-0">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-3">
              <div>
                <h1 className="text-2xl lg:text-3xl font-extrabold text-gray-900 flex items-center gap-2">
                  {users.name}
                  {activePlan === "gold" && <Award className="w-6 h-6 text-yellow-500 fill-current animate-pulse" />}
                  {activePlan === "silver" && <Award className="w-6 h-6 text-slate-400 fill-current" />}
                  {activePlan === "bronze" && <Award className="w-6 h-6 text-amber-700 fill-current" />}
                  <Badge className="bg-orange-500 text-white font-bold text-xs px-2 py-0.5 rounded-full ml-1">
                    {users.reputation || 0} Rep
                  </Badge>
                </h1>
                <p className="text-sm text-gray-500 font-medium">@{users.email.split("@")[0]}</p>
              </div>

              <div className="flex gap-2">
                {!isOwnProfile && user && (
                  <Button
                    onClick={handleFollow}
                    className={
                      following
                        ? "bg-gray-200 text-gray-800 hover:bg-gray-300"
                        : "bg-orange-500 hover:bg-orange-600 text-white"
                    }
                  >
                    {following ? "Following" : "Follow"}
                  </Button>
                )}
                {isOwnProfile && (
                  <Dialog
                    open={isEditing}
                    onOpenChange={(open) => {
                      if (open) {
                        setEditForm({
                          name: users?.name || "",
                          about: users?.about || "",
                          tags: users?.tags || [],
                          emailNotifications: users?.emailNotifications ?? true,
                          smsNotifications: users?.smsNotifications ?? false,
                        });
                      }
                      setIsEditing(open);
                    }}
                  >
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        className="flex items-center gap-2 border-gray-300 text-gray-700 bg-transparent hover:bg-gray-50"
                      >
                        <Edit className="w-4 h-4" />
                        Edit Profile
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white text-gray-900">
                      <DialogHeader>
                        <DialogTitle>Edit Profile</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-6 py-4">
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold">Basic Information</h3>
                          <div>
                            <Label htmlFor="name">Display Name</Label>
                            <Input
                              id="name"
                              value={editForm.name}
                              onChange={(e) =>
                                setEditForm({
                                  ...editForm,
                                  name: e.target.value,
                                })
                              }
                            />
                          </div>
                        </div>

                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold">About</h3>
                          <Textarea
                            id="about"
                            value={editForm.about}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                about: e.target.value,
                              })
                            }
                            className="min-h-24"
                          />
                        </div>

                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold">Skills & Technologies</h3>
                          <div className="flex gap-2">
                            <Input
                              value={newTag}
                              onChange={(e) => setNewTag(e.target.value)}
                              placeholder="Add a technology"
                              onKeyPress={(e) => e.key === "Enter" && handleAddTag()}
                            />
                            <Button onClick={handleAddTag} className="bg-orange-600 text-white">
                              <Plus className="w-4 h-4" />
                            </Button>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {editForm.tags.map((tag: any) => (
                              <Badge key={tag} className="bg-orange-100 text-orange-800 border-none flex items-center gap-1">
                                {tag}
                                <button onClick={() => handleRemoveTag(tag)} className="ml-1 hover:text-red-600">
                                  <X className="w-3 h-3" />
                                </button>
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t">
                          <Button variant="outline" onClick={() => setIsEditing(false)}>
                            Cancel
                          </Button>
                          <Button onClick={handleSaveProfile} className="bg-blue-600 text-white">
                            Save Changes
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-500 mb-4">
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4 text-gray-400" />
                Member since {new Date(users.joinDate).toLocaleDateString()}
              </span>
              <span>{followerCount} followers</span>
              {users.subscriptionStatus === "active" && users.plan && (
                <span className="bg-green-100 text-green-800 font-semibold px-2 py-0.5 rounded text-xs">
                  Active {users.plan.toUpperCase()} Plan
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Tab Selection Row */}
        <div className="flex border-b border-gray-200 mb-6 gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab("profile")}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
              activeTab === "profile" ? "border-orange-500 text-orange-600" : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            User Profile
          </button>

          <button
            onClick={() => setActiveTab("reputation")}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === "reputation" ? "border-orange-500 text-orange-600" : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            Reputation
          </button>

          <button
            onClick={() => setActiveTab("activity")}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === "activity" ? "border-orange-500 text-orange-600" : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <Rss className="w-3.5 h-3.5" />
            Activity ({userPosts.length + userArticles.length})
          </button>

          <button
            onClick={() => setActiveTab("teams")}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === "teams" ? "border-orange-500 text-orange-600" : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            Workspaces ({userTeams.length})
          </button>
          
          {isOwnProfile && (
            <>
              <button
                onClick={() => setActiveTab("billing")}
                className={`py-3 px-4 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === "billing" ? "border-orange-500 text-orange-600" : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                <CreditCard className="w-3.5 h-3.5" />
                Membership & Billing
              </button>

              <button
                onClick={() => setActiveTab("support")}
                className={`py-3 px-4 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === "support" ? "border-orange-500 text-orange-600" : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                <HelpCircle className="w-3.5 h-3.5" />
                Priority Support
              </button>
            </>
          )}
        </div>

        {/* Tab 1: Profile View */}
        {activeTab === "profile" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="space-y-6">
              <Card className="border-gray-200">
                <CardHeader>
                  <CardTitle className="text-lg">About Me</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {users.about || "This user hasn't added a bio yet."}
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card className="border-gray-200">
                <CardHeader>
                  <CardTitle className="text-lg">Skills & Badges</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Technologies</h4>
                    {users.tags && users.tags.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {users.tags.map((tag: string) => (
                          <Badge key={tag} variant="secondary" className="bg-blue-50 text-blue-700 border border-blue-100 font-medium">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-400">No skills added yet.</p>
                    )}
                  </div>

                  <div>
                    <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Membership Status</h4>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                      activePlan === "gold" ? "bg-amber-100 text-amber-800" :
                      activePlan === "silver" ? "bg-slate-100 text-slate-800" :
                      activePlan === "bronze" ? "bg-amber-50 text-amber-800" :
                      "bg-gray-100 text-gray-600"
                    }`}>
                      {activePlan === "free" ? "Free Tier Member" : `${activePlan.toUpperCase()} Plan`}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Tab: Reputation History & Transfer */}
        {activeTab === "reputation" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gray-50 border border-gray-200 rounded-3xl p-6 shadow-sm">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Reputation Overview</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Manage points and view how they were earned or lost.
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="bg-orange-100 text-orange-800 rounded-2xl px-5 py-3 text-center border border-orange-200">
                  <span className="text-xs uppercase font-semibold text-orange-600 block">Total Points</span>
                  <span className="text-3xl font-black">{users.reputation || 0}</span>
                </div>
                
                {!isOwnProfile && user && (user.reputation || 0) > 50 && (
                  <Dialog open={isTransferModalOpen} onOpenChange={setIsTransferModalOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-orange-500 hover:bg-orange-600 text-white font-semibold">
                        Transfer Reputation
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-white text-gray-900">
                      <DialogHeader>
                        <DialogTitle>Transfer Reputation Points</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleTransferSubmit} className="space-y-4 py-4">
                        <div className="bg-orange-50 border border-orange-100 rounded-xl p-3 text-xs text-orange-800">
                          <p className="font-semibold">Transfer Rules:</p>
                          <ul className="list-disc pl-4 mt-1 space-y-1">
                            <li>You can transfer up to 50 points per transaction.</li>
                            <li>Daily transfer limit is 100 points.</li>
                            <li>Your reputation will decrease by the transferred amount.</li>
                          </ul>
                        </div>
                        <div>
                          <Label htmlFor="transferAmount">Amount (Max 50)</Label>
                          <Input
                            id="transferAmount"
                            type="number"
                            min="1"
                            max="50"
                            value={transferAmount}
                            onChange={(e) => setTransferAmount(e.target.value)}
                            required
                            className="h-10 text-sm"
                          />
                        </div>
                        <div>
                          <Label htmlFor="transferReason">Reason for transfer</Label>
                          <Textarea
                            id="transferReason"
                            placeholder="e.g. Helpful help during backend testing"
                            value={transferReason}
                            onChange={(e) => setTransferReason(e.target.value)}
                            required
                            className="min-h-20"
                          />
                        </div>
                        <div className="flex justify-end gap-3 pt-3 border-t">
                          <Button type="button" variant="outline" onClick={() => setIsTransferModalOpen(false)}>
                            Cancel
                          </Button>
                          <Button type="submit" className="bg-orange-600 text-white">
                            Confirm Transfer
                          </Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            </div>

            {loadingReputation ? (
              <div className="flex justify-center py-12">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" />
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Reputation Activity History */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-gray-800 border-b border-gray-150 pb-2 flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-orange-500" />
                    Activity History ({reputationHistory.length})
                  </h3>
                  {reputationHistory.length === 0 ? (
                    <p className="text-xs text-gray-400 italic py-4">No reputation activity logged yet.</p>
                  ) : (
                    <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                      {reputationHistory.map((item) => (
                        <div key={item._id} className="p-4 rounded-xl border border-gray-200 bg-white shadow-sm flex justify-between items-center">
                          <div>
                            <p className="text-xs font-semibold text-gray-800">{item.reason}</p>
                            <span className="text-[10px] text-gray-400 block mt-1">
                              {new Date(item.timestamp).toLocaleString()}
                            </span>
                          </div>
                          <span className={`text-sm font-black px-2 py-1 rounded-lg ${
                            item.change >= 0 
                              ? "bg-green-50 text-green-700" 
                              : "bg-red-50 text-red-700"
                          }`}>
                            {item.change >= 0 ? `+${item.change}` : item.change}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Reputation Transaction History */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-gray-800 border-b border-gray-150 pb-2 flex items-center gap-1.5">
                    <History className="w-4 h-4 text-blue-500" />
                    Transaction History ({reputationTransfers.length})
                  </h3>
                  {reputationTransfers.length === 0 ? (
                    <p className="text-xs text-gray-400 italic py-4">No points transfer transactions logged.</p>
                  ) : (
                    <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                      {reputationTransfers.map((item) => {
                        const senderIdStr = typeof item.senderId === 'object' ? item.senderId?._id : item.senderId;
                        const isSender = senderIdStr === id;
                        return (
                          <div key={item._id} className="p-4 rounded-xl border border-gray-200 bg-white shadow-sm space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-xs font-bold text-gray-700">
                                {isSender ? "Sent to: " : "Received from: "}
                                <span className="text-blue-600">
                                  {isSender ? item.receiverId?.name : item.senderId?.name}
                                </span>
                              </span>
                              <span className={`text-xs font-extrabold px-2 py-0.5 rounded-full ${
                                isSender ? "bg-orange-50 text-orange-700" : "bg-green-50 text-green-700"
                              }`}>
                                {isSender ? `-${item.amount} pts` : `+${item.amount} pts`}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500 italic">" {item.reason} "</p>
                            <span className="text-[9px] text-gray-400 block">
                              {new Date(item.timestamp).toLocaleString()}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab: Activity View (Posts & Articles) */}
        {activeTab === "activity" && (
          <div className="space-y-8">
            {loadingUserActivity ? (
              <div className="flex justify-center py-12">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left side: Posts */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-gray-800 flex items-center gap-1.5 border-b border-gray-150 pb-2">
                    <MessageSquare className="w-4 h-4 text-blue-500" />
                    Community Updates & Posts ({userPosts.length})
                  </h3>
                  {userPosts.length === 0 ? (
                    <p className="text-xs text-gray-400 italic py-4">No social posts published yet.</p>
                  ) : (
                    <div className="space-y-3">
                      {userPosts.map((post: any) => (
                        <div key={post._id} className="p-4 rounded-xl border border-gray-200 bg-white shadow-sm space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="rounded bg-blue-50 px-2 py-0.5 text-[9px] font-bold text-blue-600 border border-blue-100 capitalize">
                              {post.type}
                            </span>
                            <span className="text-[9px] text-gray-400">
                              {new Date(post.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-xs text-gray-700 line-clamp-3">{post.content}</p>
                          <div className="flex flex-wrap gap-1">
                            {post.hashtags?.map((tag: string) => (
                              <span key={tag} className="text-[9px] text-gray-400 font-mono">
                                #{tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Right side: Articles */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-gray-800 flex items-center gap-1.5 border-b border-gray-150 pb-2">
                    <BookOpen className="w-4 h-4 text-orange-500" />
                    Technical Articles ({userArticles.length})
                  </h3>
                  {userArticles.length === 0 ? (
                    <p className="text-xs text-gray-400 italic py-4">No developer articles published yet.</p>
                  ) : (
                    <div className="space-y-3">
                      {userArticles.map((article: any) => (
                        <div
                          key={article._id}
                          onClick={() => router.push(`/articles/${article._id}`)}
                          className="group p-4 rounded-xl border border-gray-200 bg-white shadow-sm hover:border-orange-300 hover:shadow-sm cursor-pointer transition flex gap-3"
                        >
                          {article.coverImage && (
                            <img
                              src={article.coverImage}
                              alt={article.title}
                              className="h-14 w-20 object-cover rounded-lg shrink-0 border border-gray-100"
                            />
                          )}
                          <div className="min-w-0 flex-grow">
                            <h4 className="text-xs font-bold text-gray-900 group-hover:text-orange-500 transition line-clamp-1">
                              {article.title}
                            </h4>
                            <span className="rounded bg-orange-50 px-2 py-0.5 text-[9px] font-bold text-orange-600 inline-block mt-1">
                              {article.category}
                            </span>
                            <div className="text-[9px] text-gray-400 mt-2 flex items-center gap-2">
                              <span>{new Date(article.createdAt).toLocaleDateString()}</span>
                              <span>•</span>
                              <span>{article.readTime}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab: Teams View */}
        {activeTab === "teams" && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-800 border-b border-gray-150 pb-2 flex items-center gap-1.5">
              <Users className="w-4 h-4 text-green-500" />
              Joined Team Workspaces ({userTeams.length})
            </h3>
            {loadingUserActivity ? (
              <div className="flex justify-center py-12">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" />
              </div>
            ) : userTeams.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-300 p-8 text-center">
                <p className="text-xs text-gray-400 italic">This user hasn't joined any team workspaces.</p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {userTeams.map((team) => (
                  <div
                    key={team._id}
                    onClick={() => router.push(`/teams/${team._id}`)}
                    className="group p-4 rounded-2xl border border-gray-200 bg-white hover:border-orange-300 hover:shadow-sm cursor-pointer transition flex items-center gap-3"
                  >
                    <div className="h-10 w-10 shrink-0 rounded-lg overflow-hidden border border-gray-150 bg-gray-50 flex items-center justify-center font-bold text-orange-600">
                      {team.logoUrl ? (
                        <img src={team.logoUrl} alt={team.name} className="h-full w-full object-cover" />
                      ) : (
                        team.name.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-gray-900 group-hover:text-orange-500 transition truncate">
                        {team.name}
                      </h4>
                      <p className="text-[10px] text-gray-500 line-clamp-1">{team.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Membership & Billing */}
        {activeTab === "billing" && isOwnProfile && (
          <div className="space-y-8">
            {/* Current plan detail layout */}
            <div className="bg-gradient-to-r from-orange-500 to-amber-600 text-white rounded-3xl p-6 lg:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <span className="bg-white/20 text-white text-xs font-bold uppercase px-3 py-1 rounded-full">
                  Active Subscription
                </span>
                <h2 className="text-3xl font-extrabold mt-3 capitalize">{activePlan} Plan</h2>
                <div className="mt-3 text-white/90 text-sm space-y-1">
                  <p>Status: <span className="font-semibold capitalize">{users.subscriptionStatus || "Active"}</span></p>
                  {users.subscriptionEndDate && (
                    <p>Renews/Expires on: <span className="font-semibold">{new Date(users.subscriptionEndDate).toLocaleDateString()}</span></p>
                  )}
                </div>
              </div>

              {activePlan !== "gold" && (
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 text-center md:text-right max-w-xs">
                  <p className="text-sm font-semibold mb-2">Unlock Full Capabilities!</p>
                  <p className="text-xs text-white/80 mb-3">Upgrade to Gold for unlimited postings, featured visibility, and custom lounge chat.</p>
                </div>
              )}
            </div>

            {/* Billing address form */}
            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle className="text-lg">Billing & Invoice Details</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleBillingUpdate} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="billingName">Billing Name</Label>
                      <Input
                        id="billingName"
                        value={billingForm.billingName}
                        onChange={(e) => setBillingForm({ ...billingForm, billingName: e.target.value })}
                        placeholder="e.g. John Doe"
                      />
                    </div>
                    <div>
                      <Label htmlFor="billingEmail">Billing Email</Label>
                      <Input
                        id="billingEmail"
                        type="email"
                        value={billingForm.billingEmail}
                        onChange={(e) => setBillingForm({ ...billingForm, billingEmail: e.target.value })}
                        placeholder="e.g. john@example.com"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="billingAddress">Billing Address</Label>
                    <Input
                      id="billingAddress"
                      value={billingForm.billingAddress}
                      onChange={(e) => setBillingForm({ ...billingForm, billingAddress: e.target.value })}
                      placeholder="e.g. 123 Main St, New Delhi, India"
                    />
                  </div>
                  <Button type="submit" disabled={isUpdatingBilling} className="bg-orange-600 hover:bg-orange-700 text-white">
                    {isUpdatingBilling ? "Updating..." : "Update Billing Info"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Comparison Grid & Upgrades */}
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-6">Compare Subscription Plans</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                
                {/* Plan Card: Free */}
                <div className={`border rounded-3xl p-6 bg-white flex flex-col justify-between shadow-sm relative ${activePlan === "free" ? "border-orange-500 ring-2 ring-orange-500/20" : "border-gray-200"}`}>
                  <div>
                    {activePlan === "free" && <span className="absolute -top-3 left-6 bg-orange-500 text-white text-xs font-extrabold px-3 py-1 rounded-full">CURRENT</span>}
                    <h4 className="text-lg font-bold text-gray-900">Free Plan</h4>
                    <p className="text-gray-500 text-xs mt-1">Basic Search Only</p>
                    <div className="my-6">
                      <span className="text-3xl font-black">₹0</span>
                      <span className="text-gray-500 text-xs"> / month</span>
                    </div>
                    <ul className="space-y-2 text-sm text-gray-600 mb-6">
                      <li className="flex items-center gap-2">✓ 1 Question per day</li>
                      <li className="flex items-center gap-2">✓ Basic keyword search</li>
                      <li className="flex items-center gap-2">✓ Up to 3 bookmarks</li>
                      <li className="text-gray-300">✗ Profile Badge</li>
                      <li className="text-gray-300">✗ Priority support</li>
                    </ul>
                  </div>
                  <Button variant="outline" disabled className="w-full border-gray-300 text-gray-400">Included</Button>
                </div>

                {/* Plan Card: Bronze */}
                <div className={`border rounded-3xl p-6 bg-white flex flex-col justify-between shadow-sm relative ${activePlan === "bronze" ? "border-orange-500 ring-2 ring-orange-500/20" : "border-gray-200"}`}>
                  <div>
                    {activePlan === "bronze" && <span className="absolute -top-3 left-6 bg-orange-500 text-white text-xs font-extrabold px-3 py-1 rounded-full">CURRENT</span>}
                    <h4 className="text-lg font-bold text-gray-900">Bronze Plan</h4>
                    <p className="text-gray-500 text-xs mt-1">Unlock Advanced Filters</p>
                    <div className="my-6">
                      <span className="text-3xl font-black">₹99</span>
                      <span className="text-gray-500 text-xs"> / month</span>
                    </div>
                    <ul className="space-y-2 text-sm text-gray-600 mb-6">
                      <li className="flex items-center gap-2">✓ 5 Questions per day</li>
                      <li className="flex items-center gap-2 font-semibold text-orange-600">✓ Bronze Profile Badge</li>
                      <li className="flex items-center gap-2">✓ Custom advanced search</li>
                      <li className="flex items-center gap-2">✓ Up to 7 bookmarks</li>
                      <li className="text-gray-300">✗ Priority support</li>
                    </ul>
                  </div>
                  {activePlan === "bronze" ? (
                    <Button variant="outline" disabled className="w-full border-gray-300 text-gray-400">Active</Button>
                  ) : (
                    <Button onClick={() => handleUpgradeOrder("bronze")} className="w-full bg-orange-500 hover:bg-orange-600 text-white">Upgrade</Button>
                  )}
                </div>

                {/* Plan Card: Silver */}
                <div className={`border rounded-3xl p-6 bg-white flex flex-col justify-between shadow-sm relative ${activePlan === "silver" ? "border-orange-500 ring-2 ring-orange-500/20" : "border-gray-200"}`}>
                  <div>
                    {activePlan === "silver" && <span className="absolute -top-3 left-6 bg-orange-500 text-white text-xs font-extrabold px-3 py-1 rounded-full">CURRENT</span>}
                    <h4 className="text-lg font-bold text-gray-900">Silver Plan</h4>
                    <p className="text-gray-500 text-xs mt-1">Unlimited Bookmarks</p>
                    <div className="my-6">
                      <span className="text-3xl font-black">₹299</span>
                      <span className="text-gray-500 text-xs"> / month</span>
                    </div>
                    <ul className="space-y-2 text-sm text-gray-600 mb-6">
                      <li className="flex items-center gap-2">✓ 15 Questions per day</li>
                      <li className="flex items-center gap-2 font-semibold text-slate-500">✓ Silver Profile Badge</li>
                      <li className="flex items-center gap-2">✓ Unlimited bookmarks</li>
                      <li className="flex items-center gap-2">✓ Enhanced profile listing</li>
                      <li className="flex items-center gap-2 font-semibold text-blue-600">✓ Priority support form</li>
                    </ul>
                  </div>
                  {activePlan === "silver" ? (
                    <Button variant="outline" disabled className="w-full border-gray-300 text-gray-400">Active</Button>
                  ) : activePlan === "gold" ? (
                    <Button variant="outline" disabled className="w-full border-gray-300 text-gray-400">Active</Button>
                  ) : (
                    <Button onClick={() => handleUpgradeOrder("silver")} className="w-full bg-orange-500 hover:bg-orange-600 text-white">Upgrade</Button>
                  )}
                </div>

                {/* Plan Card: Gold */}
                <div className={`border rounded-3xl p-6 bg-gradient-to-b from-yellow-50 to-white flex flex-col justify-between shadow-md relative ${activePlan === "gold" ? "border-yellow-500 ring-2 ring-yellow-500/20" : "border-yellow-200"}`}>
                  <div>
                    {activePlan === "gold" && <span className="absolute -top-3 left-6 bg-yellow-500 text-white text-xs font-extrabold px-3 py-1 rounded-full">CURRENT</span>}
                    <h4 className="text-lg font-bold text-yellow-800">Gold Plan</h4>
                    <p className="text-yellow-600 text-xs mt-1">Maximum Priority</p>
                    <div className="my-6">
                      <span className="text-3xl font-black text-yellow-700">₹999</span>
                      <span className="text-gray-500 text-xs"> / month</span>
                    </div>
                    <ul className="space-y-2 text-sm text-gray-600 mb-6">
                      <li className="flex items-center gap-2 font-semibold">✓ Unlimited questions</li>
                      <li className="flex items-center gap-2 font-bold text-yellow-600">✓ Gold Profile Badge</li>
                      <li className="flex items-center gap-2 font-medium text-yellow-700">✓ Featured profile visibility</li>
                      <li className="flex items-center gap-2">✓ Highest feed priority</li>
                      <li className="flex items-center gap-2 font-semibold text-blue-600">✓ Priority support ticket</li>
                      <li className="flex items-center gap-2 text-orange-600 font-semibold">✓ Exclusive Lounge Access</li>
                    </ul>
                  </div>
                  {activePlan === "gold" ? (
                    <Button variant="outline" disabled className="w-full border-yellow-300 text-yellow-700">Active</Button>
                  ) : (
                    <Button onClick={() => handleUpgradeOrder("gold")} className="w-full bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-white border-none shadow-md font-bold">Upgrade</Button>
                  )}
                </div>

              </div>
            </div>

            {/* Payment history invoice table */}
            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle className="text-lg">Payment History & Invoices</CardTitle>
              </CardHeader>
              <CardContent>
                {loadingInvoices ? (
                  <p className="text-sm text-gray-500 py-4 text-center">Loading invoices...</p>
                ) : invoices.length === 0 ? (
                  <p className="text-sm text-gray-400 py-6 text-center">No payment history found. Upgrade to premium to view invoices here.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500">
                      <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                          <th className="px-6 py-3">Date</th>
                          <th className="px-6 py-3">Invoice Number</th>
                          <th className="px-6 py-3">Plan Upgraded</th>
                          <th className="px-6 py-3">Amount</th>
                          <th className="px-6 py-3">Status</th>
                          <th className="px-6 py-3 text-right">Download</th>
                        </tr>
                      </thead>
                      <tbody>
                        {invoices.map((inv: any) => (
                          <tr key={inv._id} className="bg-white border-b border-gray-100">
                            <td className="px-6 py-4">{new Date(inv.createdAt).toLocaleDateString()}</td>
                            <td className="px-6 py-4 font-mono text-gray-700">{inv.invoiceNumber}</td>
                            <td className="px-6 py-4 capitalize">{inv.planName}</td>
                            <td className="px-6 py-4 font-bold text-gray-800">₹{inv.amount}</td>
                            <td className="px-6 py-4">
                              <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full font-semibold">
                                {inv.paymentStatus || "Paid"}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleInvoiceDownload(inv._id, inv.invoiceNumber)}
                                className="flex items-center gap-1.5 hover:bg-gray-100 ml-auto"
                              >
                                <Download className="w-3.5 h-3.5" />
                                PDF
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>

          </div>
        )}

        {/* Tab 3: Priority Support System */}
        {activeTab === "support" && isOwnProfile && (
          <div className="max-w-2xl mx-auto space-y-6">
            {activePlan !== "silver" && activePlan !== "gold" ? (
              <Card className="border-gray-200 p-8 text-center bg-gray-50">
                <ShieldAlert className="w-12 h-12 text-orange-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-800 mb-2">Priority Support Locked</h3>
                <p className="text-sm text-gray-500 mb-6">
                  Priority customer support tickets are exclusively available for Silver and Gold membership plan tiers.
                </p>
                <Button onClick={() => setActiveTab("billing")} className="bg-orange-500 text-white">
                  Upgrade Subscription Plan
                </Button>
              </Card>
            ) : (
              <Card className="border-gray-200">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Mail className="w-5 h-5 text-orange-500" />
                    Submit Priority Helpdesk Ticket
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSupportSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="supportSubject">Subject / Query Title</Label>
                      <Input
                        id="supportSubject"
                        value={supportForm.subject}
                        onChange={(e) => setSupportForm({ ...supportForm, subject: e.target.value })}
                        placeholder="e.g. Database connection timeouts in Production"
                      />
                    </div>
                    <div>
                      <Label htmlFor="supportMessage">Details of your request</Label>
                      <Textarea
                        id="supportMessage"
                        value={supportForm.message}
                        onChange={(e) => setSupportForm({ ...supportForm, message: e.target.value })}
                        placeholder="Please describe your technical issue in detail..."
                        className="min-h-36"
                      />
                    </div>
                    <Button type="submit" disabled={isSubmittingSupport} className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold">
                      {isSubmittingSupport ? "Submitting priority request..." : "Submit High-Priority Support Ticket"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}
          </div>
        )}

      </div>

      {/* -------------------- MOCK PAYMENT SANDBOX MODAL -------------------- */}
      {isMockModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in-50 zoom-in-95 duration-200">
            <div className="bg-gradient-to-r from-orange-500 to-amber-600 p-6 text-white text-center">
              <CreditCard className="w-12 h-12 mx-auto mb-3 opacity-90 animate-bounce" />
              <h3 className="text-xl font-bold">Razorpay Sandbox</h3>
              <p className="text-xs text-white/80 mt-1">Developer Mode Simulation Payment Gateway</p>
            </div>
            
            <form onSubmit={handleMockVerify} className="p-6 space-y-4">
              <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 text-sm space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-gray-500">Plan selection:</span>
                  <span className="font-bold text-gray-800 capitalize">{selectedUpgradePlan}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Amount due:</span>
                  <span className="font-bold text-green-600">₹{mockAmount / 100}.00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Order ID:</span>
                  <span className="font-mono text-xs text-gray-700">{mockOrderId}</span>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Billing details for invoice</h4>
                <div>
                  <Label htmlFor="mockBillingName" className="text-xs">Billing Name</Label>
                  <Input
                    id="mockBillingName"
                    value={mockForm.name}
                    onChange={(e) => setMockForm({ ...mockForm, name: e.target.value })}
                    required
                    className="h-9 text-sm"
                  />
                </div>
                <div>
                  <Label htmlFor="mockBillingEmail" className="text-xs">Billing Email</Label>
                  <Input
                    id="mockBillingEmail"
                    type="email"
                    value={mockForm.email}
                    onChange={(e) => setMockForm({ ...mockForm, email: e.target.value })}
                    required
                    className="h-9 text-sm"
                  />
                </div>
                <div>
                  <Label htmlFor="mockBillingAddress" className="text-xs">Billing Address</Label>
                  <Input
                    id="mockBillingAddress"
                    value={mockForm.address}
                    onChange={(e) => setMockForm({ ...mockForm, address: e.target.value })}
                    required
                    placeholder="e.g. 45 Park Ave, Mumbai"
                    className="h-9 text-sm"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsMockModalOpen(false)}
                  className="flex-1 border-gray-300"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold"
                >
                  Authorize Payment
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

    </Mainlayout>
  );
};

export default index;
