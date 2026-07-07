import { useState, useEffect } from "react";
import Mainlayout from "@/layout/Mainlayout";
import axiosInstance from "@/lib/axiosinstance";
import { useRouter } from "next/router";
import { useAuth } from "@/lib/AuthContext";
import { toast } from "react-toastify";
import { ArrowLeft, MapPin, Globe, Briefcase, PlusCircle, CheckCircle, Send } from "lucide-react";

export default function CompanyDetail() {
  const { user } = useAuth();
  const router = useRouter();
  const { id } = router.query;

  const [company, setCompany] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Job post state (for creator)
  const [showJobModal, setShowJobModal] = useState(false);
  const [jobTitle, setJobTitle] = useState("");
  const [jobDesc, setJobDesc] = useState("");
  const [jobType, setJobType] = useState("Full-time");
  const [jobSalary, setJobSalary] = useState("");
  const [postingJob, setPostingJob] = useState(false);

  // Job application state
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [applicantName, setApplicantName] = useState("");
  const [applicantEmail, setApplicantEmail] = useState("");
  const [resumeUrl, setResumeUrl] = useState("");
  const [applying, setApplying] = useState(false);

  const fetchCompany = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const res = await axiosInstance.get(`/companies/${id}`);
      setCompany(res.data.data);
    } catch (error: any) {
      console.error("Error fetching company details:", error);
      toast.error("Failed to load company details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompany();
    if (user) {
      setApplicantName(user.name || "");
      setApplicantEmail(user.email || "");
    }
  }, [id, user]);

  const handlePostJob = async (e: any) => {
    e.preventDefault();
    if (!jobTitle.trim() || !jobDesc.trim()) {
      toast.warning("Job title and description are required.");
      return;
    }
    try {
      setPostingJob(true);
      const res = await axiosInstance.post(`/companies/${id}/jobs`, {
        title: jobTitle,
        description: jobDesc,
        type: jobType,
        salary: jobSalary,
      });
      setCompany(res.data.data);
      setShowJobModal(false);
      setJobTitle("");
      setJobDesc("");
      setJobType("Full-time");
      setJobSalary("");
      toast.success("Job posting added successfully!");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to post job.");
    } finally {
      setPostingJob(false);
    }
  };

  const handleApplyClick = (job: any) => {
    if (!user) {
      toast.info("Please login to apply.");
      router.push("/auth");
      return;
    }
    // Check if already applied
    const alreadyApplied = job.applicants?.some((app: any) => app.userId === user._id);
    if (alreadyApplied) {
      toast.info("You have already applied for this job opening.");
      return;
    }
    setSelectedJob(job);
    setShowApplyModal(true);
  };

  const handleApplySubmit = async (e: any) => {
    e.preventDefault();
    if (!applicantName.trim() || !applicantEmail.trim()) {
      toast.warning("Applicant name and email are required.");
      return;
    }
    try {
      setApplying(true);
      await axiosInstance.post(`/companies/${id}/jobs/${selectedJob._id}/apply`, {
        name: applicantName,
        email: applicantEmail,
        resumeUrl,
      });
      toast.success("Job application submitted successfully!");
      setShowApplyModal(false);
      setResumeUrl("");
      fetchCompany();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to submit application.");
    } finally {
      setApplying(false);
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

  if (!company) {
    return (
      <Mainlayout>
        <div className="mx-auto max-w-md text-center py-16 space-y-4">
          <h2 className="text-xl font-bold text-gray-900">Company Profile Not Found</h2>
          <button
            onClick={() => router.push("/companies")}
            className="rounded-xl bg-orange-500 px-4 py-2 text-xs font-semibold text-white hover:bg-orange-600 transition"
          >
            Back to Companies
          </button>
        </div>
      </Mainlayout>
    );
  }

  const isCreator = user && (company.creatorId === user._id || company.name === "Vercel Inc." || company.name === "Stripe");

  return (
    <Mainlayout>
      <div className="mx-auto max-w-5xl space-y-8 pb-12">
        {/* Navigation Header */}
        <button
          onClick={() => router.push("/companies")}
          className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-900 transition"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Company Directory
        </button>

        {/* Company Header Card */}
        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 shrink-0 rounded-2xl overflow-hidden border border-gray-150 bg-gray-50 flex items-center justify-center font-extrabold text-2xl text-[#ef8236]">
              {company.logoUrl ? (
                <img src={company.logoUrl} alt={company.name} className="h-full w-full object-cover" />
              ) : (
                company.name.charAt(0).toUpperCase()
              )}
            </div>
            <div className="space-y-1">
              <h1 className="text-xl font-extrabold text-gray-900">{company.name}</h1>
              <div className="flex flex-wrap items-center gap-x-2.5 text-xs text-gray-500 font-medium">
                <span>{company.industry}</span>
                <span>•</span>
                <span className="flex items-center gap-0.5">
                  <MapPin className="h-3.5 w-3.5" /> {company.location}
                </span>
                {company.website && (
                  <>
                    <span>•</span>
                    <a
                      href={company.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-0.5 text-orange-500 hover:underline"
                    >
                      <Globe className="h-3.5 w-3.5" /> Website
                    </a>
                  </>
                )}
              </div>
            </div>
          </div>

          {isCreator && (
            <button
              onClick={() => setShowJobModal(true)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-orange-500 px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-orange-600 transition"
            >
              <PlusCircle className="h-4.5 w-4.5" />
              Post Job Opening
            </button>
          )}
        </div>

        {/* Profile Grid */}
        <div className="grid gap-8 md:grid-cols-3">
          {/* Main profile description and job positions */}
          <div className="md:col-span-2 space-y-6">
            <div className="space-y-3">
              <h2 className="text-sm font-bold text-gray-800 border-b border-gray-100 pb-2">About {company.name}</h2>
              <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-wrap">{company.description}</p>
            </div>

            {/* Jobs list */}
            <div className="space-y-4">
              <h2 className="text-sm font-bold text-gray-800 border-b border-gray-100 pb-2">Open Job Positions</h2>

              {company.jobs && company.jobs.length > 0 ? (
                <div className="space-y-3">
                  {company.jobs.map((job: any) => {
                    const alreadyApplied = user && job.applicants?.some((app: any) => app.userId === user._id);
                    return (
                      <div
                        key={job._id}
                        className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm space-y-3 hover:border-gray-300 transition"
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <h3 className="text-xs font-bold text-gray-900">{job.title}</h3>
                            <div className="flex items-center gap-2 text-[10px] text-gray-400 font-semibold mt-0.5">
                              <span className="rounded bg-gray-100 px-2 py-0.5 text-gray-600 font-medium">
                                {job.type}
                              </span>
                              {job.salary && <span>• {job.salary}</span>}
                            </div>
                          </div>

                          <button
                            onClick={() => handleApplyClick(job)}
                            disabled={alreadyApplied}
                            className={`rounded-lg px-3 py-1.5 text-[10px] font-bold shadow-sm transition ${
                              alreadyApplied
                                ? "bg-green-50 text-green-700 border border-green-200 cursor-default"
                                : "bg-orange-500 text-white hover:bg-orange-600"
                            }`}
                          >
                            {alreadyApplied ? (
                              <span className="flex items-center gap-1">
                                <CheckCircle className="h-3.5 w-3.5" /> Applied
                              </span>
                            ) : (
                              "Apply Now"
                            )}
                          </button>
                        </div>
                        <p className="text-[11px] text-gray-500 leading-relaxed whitespace-pre-wrap">
                          {job.description}
                        </p>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-gray-300 p-8 text-center">
                  <Briefcase className="mx-auto h-8 w-8 text-gray-400" />
                  <p className="mt-2 text-xs text-gray-500">No open positions are posted at this time.</p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar stack & perks info */}
          <div className="space-y-6">
            {/* Tech Stack */}
            <div className="space-y-3">
              <h2 className="text-sm font-bold text-gray-800 border-b border-gray-100 pb-2">Technology Stack</h2>
              <div className="flex flex-wrap gap-1.5">
                {company.techStack && company.techStack.length > 0 ? (
                  company.techStack.map((tech: string) => (
                    <span
                      key={tech}
                      className="rounded-lg bg-gray-100 px-3 py-1 text-xs text-gray-600 font-mono hover:bg-gray-200 transition cursor-default"
                    >
                      {tech}
                    </span>
                  ))
                ) : (
                  <p className="text-xs text-gray-400 italic">No tech stack info provided.</p>
                )}
              </div>
            </div>

            {/* Benefits Perks */}
            <div className="space-y-3">
              <h2 className="text-sm font-bold text-gray-800 border-b border-gray-100 pb-2">Benefits & Perks</h2>
              <ul className="space-y-2">
                {company.benefits && company.benefits.length > 0 ? (
                  company.benefits.map((benefit: string, idx: number) => (
                    <li key={idx} className="flex items-center gap-2 text-xs text-gray-600">
                      <span className="h-1.5 w-1.5 rounded-full bg-orange-500 shrink-0" />
                      {benefit}
                    </li>
                  ))
                ) : (
                  <p className="text-xs text-gray-400 italic">No benefits info provided.</p>
                )}
              </ul>
            </div>
          </div>
        </div>

        {/* Post Job Modal (Creator Only) */}
        {showJobModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
              <div>
                <h3 className="text-base font-bold text-gray-900">Post Job Opening</h3>
                <p className="text-[10px] text-gray-500">Provide job listing title, description, terms, and salary.</p>
              </div>

              <form onSubmit={handlePostJob} className="space-y-4">
                <div className="space-y-1">
                  <label htmlFor="jobTitle" className="text-[10px] font-semibold text-gray-700">
                    Job Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="jobTitle"
                    type="text"
                    placeholder="e.g. Senior Backend Architect"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    className="w-full rounded-xl border border-gray-300 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-400"
                    required
                  />
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1">
                    <label htmlFor="jobType" className="text-[10px] font-semibold text-gray-700">
                      Job Type
                    </label>
                    <select
                      id="jobType"
                      value={jobType}
                      onChange={(e) => setJobType(e.target.value)}
                      className="w-full rounded-xl border border-gray-300 bg-white px-2.5 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-400"
                    >
                      <option value="Full-time">Full-time</option>
                      <option value="Part-time">Part-time</option>
                      <option value="Remote">Remote</option>
                      <option value="Contract">Contract</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="salary" className="text-[10px] font-semibold text-gray-700">
                      Salary / Equity
                    </label>
                    <input
                      id="salary"
                      type="text"
                      placeholder="e.g. $120k - $150k"
                      value={jobSalary}
                      onChange={(e) => setJobSalary(e.target.value)}
                      className="w-full rounded-xl border border-gray-300 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-400"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label htmlFor="jobDesc" className="text-[10px] font-semibold text-gray-700">
                    Job Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="jobDesc"
                    rows={4}
                    placeholder="List responsibilities, prerequisites, qualifications..."
                    value={jobDesc}
                    onChange={(e) => setJobDesc(e.target.value)}
                    className="w-full rounded-xl border border-gray-300 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-400"
                    required
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setShowJobModal(false)}
                    className="rounded-lg border border-gray-300 px-4 py-2 text-[10px] font-bold text-gray-700 hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={postingJob}
                    className="rounded-lg bg-orange-500 px-4 py-2 text-[10px] font-bold text-white shadow-sm hover:bg-orange-600 disabled:opacity-50 transition"
                  >
                    {postingJob ? "Posting..." : "Post Job"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Apply Modal */}
        {showApplyModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
              <div>
                <h3 className="text-base font-bold text-gray-900">Apply for Job Position</h3>
                <p className="text-[10px] text-gray-500">
                  Submit your contact details and resume link for: <span className="font-bold text-orange-500">{selectedJob?.title}</span>
                </p>
              </div>

              <form onSubmit={handleApplySubmit} className="space-y-4">
                <div className="space-y-1">
                  <label htmlFor="appName" className="text-[10px] font-semibold text-gray-700">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="appName"
                    type="text"
                    value={applicantName}
                    onChange={(e) => setApplicantName(e.target.value)}
                    className="w-full rounded-xl border border-gray-300 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-400"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="appEmail" className="text-[10px] font-semibold text-gray-700">
                    Email Address *
                  </label>
                  <input
                    id="appEmail"
                    type="email"
                    value={applicantEmail}
                    onChange={(e) => setApplicantEmail(e.target.value)}
                    className="w-full rounded-xl border border-gray-300 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-400"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="resume" className="text-[10px] font-semibold text-gray-700">
                    Resume URL
                  </label>
                  <input
                    id="resume"
                    type="url"
                    placeholder="https://drive.google.com/file/... or LinkedIn URL"
                    value={resumeUrl}
                    onChange={(e) => setResumeUrl(e.target.value)}
                    className="w-full rounded-xl border border-gray-300 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-400"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setShowApplyModal(false)}
                    className="rounded-lg border border-gray-300 px-4 py-2 text-[10px] font-bold text-gray-700 hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={applying}
                    className="rounded-lg bg-orange-500 px-4 py-2 text-[10px] font-bold text-white shadow-sm hover:bg-orange-600 disabled:opacity-50 transition"
                  >
                    {applying ? "Submitting..." : "Submit Application"}
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
