import { useEffect, useState } from "react";
import Mainlayout from "@/layout/Mainlayout";
import axiosInstance from "@/lib/axiosinstance";
import { useRouter } from "next/router";
import { useAuth } from "@/lib/AuthContext";
import { toast } from "react-toastify";
import { Building, Search, PlusCircle, MapPin, Briefcase, Globe, Star } from "lucide-react";
import { useLanguage } from "@/lib/LanguageContext";

export default function CompaniesIndex() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const router = useRouter();

  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [locationFilter, setLocationFilter] = useState("");

  // Modal State for Company Registration
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [website, setWebsite] = useState("");
  const [location, setLocation] = useState("");
  const [industry, setIndustry] = useState("");
  const [employeesCount, setEmployeesCount] = useState("1-10");
  const [techStack, setTechStack] = useState("");
  const [benefits, setBenefits] = useState("");
  const [registering, setRegistering] = useState(false);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const searchParam = search ? `&search=${encodeURIComponent(search)}` : "";
      const locParam = locationFilter ? `&location=${encodeURIComponent(locationFilter)}` : "";
      const res = await axiosInstance.get(`/companies?${searchParam}${locParam}`);
      setCompanies(res.data.data);
    } catch (error) {
      console.error("Error fetching companies:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, [locationFilter]);

  const handleSearchSubmit = (e: any) => {
    e.preventDefault();
    fetchCompanies();
  };

  const handleRegisterClick = () => {
    if (!user) {
      toast.info("Please login to register a company.");
      router.push("/auth");
    } else {
      setShowModal(true);
    }
  };

  const handleRegisterSubmit = async (e: any) => {
    e.preventDefault();
    if (!name.trim() || !desc.trim()) {
      toast.warning("Company name and description are required.");
      return;
    }
    try {
      setRegistering(true);
      const res = await axiosInstance.post("/companies", {
        name,
        description: desc,
        logoUrl,
        website,
        location,
        industry,
        employeesCount,
        techStack: techStack.split(",").map((s) => s.trim()).filter(Boolean),
        benefits: benefits.split(",").map((s) => s.trim()).filter(Boolean),
      });
      toast.success("Company registered successfully!");
      setShowModal(false);
      setName("");
      setDesc("");
      setLogoUrl("");
      setWebsite("");
      setLocation("");
      setIndustry("");
      setTechStack("");
      setBenefits("");
      router.push(`/companies/${res.data.data._id}`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to register company.");
    } finally {
      setRegistering(false);
    }
  };

  return (
    <Mainlayout>
      <div className="mx-auto max-w-5xl space-y-8">
        {/* Header Section */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-gray-100 pb-5">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 dark:text-gray-100">{t("Companies")}</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">{t("Learn about what it's like to work at these companies")}</p>
          </div>
          <button
            onClick={handleRegisterClick}
            className="inline-flex items-center gap-1.5 rounded-xl bg-orange-500 px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-orange-600 transition"
          >
            <PlusCircle className="h-4.5 w-4.5" />
            Register Company Profile
          </button>
        </div>

        {/* Search & Filter bar */}
        <form onSubmit={handleSearchSubmit} className="grid gap-3 sm:grid-cols-3">
          <div className="relative sm:col-span-2">
            <input
              type="text"
              placeholder="Search by company name or tech stack (e.g. Next.js)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-gray-300 bg-white py-2.5 pl-9 pr-4 text-xs focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-400 transition"
            />
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          </div>

          <div className="relative">
            <input
              type="text"
              placeholder="Filter by Location..."
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="w-full rounded-xl border border-gray-300 bg-white py-2.5 pl-9 pr-4 text-xs focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-400 transition"
            />
            <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          </div>
        </form>

        {/* Companies directory list */}
        {loading ? (
          <div className="flex min-h-[300px] items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" />
          </div>
        ) : companies.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 p-12 text-center">
            <Building className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-sm font-semibold text-gray-900">No companies found</h3>
            <p className="mt-2 text-xs text-gray-500">Try adjusting your search criteria or register a new company profile.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {companies.map((company) => (
              <div
                key={company._id}
                onClick={() => router.push(`/companies/${company._id}`)}
                className="group flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 rounded-2xl border border-gray-200 bg-white hover:border-orange-300 hover:shadow-sm cursor-pointer transition-all duration-150 gap-4"
              >
                <div className="flex items-start sm:items-center gap-4 min-w-0">
                  <div className="h-14 w-14 shrink-0 rounded-xl overflow-hidden border border-gray-100 bg-gray-50 flex items-center justify-center font-extrabold text-[#ef8236] text-xl">
                    {company.logoUrl ? (
                      <img src={company.logoUrl} alt={company.name} className="h-full w-full object-cover" />
                    ) : (
                      company.name.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="space-y-1 min-w-0">
                    <h3 className="text-sm font-bold text-gray-900 group-hover:text-orange-500 transition truncate">
                      {company.name}
                    </h3>
                    <div className="flex flex-wrap items-center gap-x-2 text-[10px] text-gray-500 font-medium">
                      <span className="truncate max-w-[150px]">{company.industry}</span>
                      <span>•</span>
                      <span className="flex items-center gap-0.5 truncate max-w-[120px]">
                        <MapPin className="h-3 w-3" /> {company.location}
                      </span>
                      <span>•</span>
                      <span>{company.employeesCount} employees</span>
                    </div>
                    {/* Tech stack badges */}
                    <div className="flex flex-wrap gap-1.5 pt-1.5">
                      {company.techStack?.slice(0, 5).map((tech: string) => (
                        <span key={tech} className="rounded bg-gray-50 border border-gray-150 px-1.5 py-0.5 text-[9px] text-gray-600 font-mono">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex sm:flex-col items-end gap-2 text-right self-stretch sm:self-auto justify-between border-t sm:border-t-0 border-gray-100 pt-3 sm:pt-0 shrink-0">
                  <div className="text-[10px] text-gray-400 font-semibold flex items-center gap-1">
                    <Briefcase className="h-3.5 w-3.5 text-orange-500" />
                    {company.jobs?.length || 0} Open Roles
                  </div>
                  <span className="text-[10px] font-bold text-[#ef8236] group-hover:translate-x-1 transition-transform inline-flex items-center gap-0.5">
                    View Profile →
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Register Company Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-sm p-4 overflow-y-auto">
            <div className="w-full max-w-lg rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200 my-8">
              <div>
                <h3 className="text-base font-bold text-gray-900">Register Company Profile</h3>
                <p className="text-[10px] text-gray-500">Provide company details, tech tags, benefits, and job roles.</p>
              </div>

              <form onSubmit={handleRegisterSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-gray-700">Company Name *</label>
                    <input
                      type="text"
                      placeholder="e.g. Acme Corp"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full rounded-xl border border-gray-300 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-400"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-gray-700">Industry</label>
                    <input
                      type="text"
                      placeholder="e.g. Software / Fintech"
                      value={industry}
                      onChange={(e) => setIndustry(e.target.value)}
                      className="w-full rounded-xl border border-gray-300 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-400"
                    />
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-gray-700">Location</label>
                    <input
                      type="text"
                      placeholder="e.g. San Francisco, CA"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full rounded-xl border border-gray-300 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-400"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-gray-700">Employees Count</label>
                    <select
                      value={employeesCount}
                      onChange={(e) => setEmployeesCount(e.target.value)}
                      className="w-full rounded-xl border border-gray-300 bg-white px-2.5 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-400"
                    >
                      <option value="1-10">1-10 employees</option>
                      <option value="11-50">11-50 employees</option>
                      <option value="51-200">51-200 employees</option>
                      <option value="201-500">201-500 employees</option>
                      <option value="501-2000">501-2000 employees</option>
                      <option value="2000+">2000+ employees</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-gray-700">Logo Image URL</label>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/photo-..."
                    value={logoUrl}
                    onChange={(e) => setLogoUrl(e.target.value)}
                    className="w-full rounded-xl border border-gray-300 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-gray-700">Website URL</label>
                  <input
                    type="url"
                    placeholder="https://acme.com"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    className="w-full rounded-xl border border-gray-300 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-gray-700">Tech Stack Tools</label>
                  <input
                    type="text"
                    placeholder="React, Next.js, Go, Kubernetes (comma-separated)"
                    value={techStack}
                    onChange={(e) => setTechStack(e.target.value)}
                    className="w-full rounded-xl border border-gray-300 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-gray-700">Employee Benefits</label>
                  <input
                    type="text"
                    placeholder="Remote Work, Unlimited PTO, Health stipend (comma-separated)"
                    value={benefits}
                    onChange={(e) => setBenefits(e.target.value)}
                    className="w-full rounded-xl border border-gray-300 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-gray-700">Company Bio / Description *</label>
                  <textarea
                    rows={3}
                    placeholder="Describe company mission, values, work environment..."
                    value={desc}
                    onChange={(e) => setDesc(e.target.value)}
                    className="w-full rounded-xl border border-gray-300 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-400"
                    required
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="rounded-lg border border-gray-300 px-4 py-2 text-[10px] font-bold text-gray-700 hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={registering}
                    className="rounded-lg bg-orange-500 px-4 py-2 text-[10px] font-bold text-white shadow-sm hover:bg-orange-600 disabled:opacity-50 transition"
                  >
                    {registering ? "Registering..." : "Register"}
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
