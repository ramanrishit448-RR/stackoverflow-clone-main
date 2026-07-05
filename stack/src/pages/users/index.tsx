import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import Mainlayout from "@/layout/Mainlayout";
import axiosInstance from "@/lib/axiosinstance";
import { Calendar, Search } from "lucide-react";
import Link from "next/link";
import React, { useEffect, useState } from "react";

import { Award } from "lucide-react";

const index = () => {
  const [users, setusers] = useState<any>(null);
  const [loading, setloading] = useState(true);
  const [filterQuery, setFilterQuery] = useState("");

  useEffect(() => {
    const fetchuser = async () => {
      try {
        const res = await axiosInstance.get("/user/getalluser");
        setusers(res.data.data);
      } catch (error) {
        console.log(error);
      } finally {
        setloading(false);
      }
    };
    fetchuser();
  }, []);

  const getPriority = (u: any) => {
    if (u.subscriptionStatus !== "active") return 0;
    if (u.plan === "gold") return 3;
    if (u.plan === "silver") return 2;
    if (u.plan === "bronze") return 1;
    return 0;
  };

  const processedUsers = React.useMemo(() => {
    if (!users) return [];
    
    // Filter
    const filtered = users.filter((u: any) =>
      u.name.toLowerCase().includes(filterQuery.toLowerCase().trim())
    );

    // Sort: Gold -> Silver -> Bronze -> Free
    return [...filtered].sort((a: any, b: any) => getPriority(b) - getPriority(a));
  }, [users, filterQuery]);

  if (loading) {
    return (
      <Mainlayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-orange-500"></div>
        </div>
      </Mainlayout>
    );
  }

  if (!users || users.length === 0) {
    return (
      <Mainlayout>
        <div className="text-center text-gray-500 mt-4">No users found.</div>
      </Mainlayout>
    );
  }

  return (
    <Mainlayout>
      <div className="max-w-6xl mx-auto px-4 py-6">
        <h1 className="text-xl lg:text-2xl font-semibold mb-6">Users</h1>

        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Filter by user"
              className="pl-10"
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {processedUsers.map((user: any) => {
            const plan = user.subscriptionStatus === "active" ? (user.plan || "free") : "free";
            
            // Custom card styles based on subscription tier
            let cardStyle = "border-gray-200 bg-white hover:border-orange-200";
            if (plan === "gold") {
              cardStyle = "border-yellow-400 bg-gradient-to-b from-yellow-50/50 to-white shadow-sm hover:border-yellow-500 ring-1 ring-yellow-400/20";
            } else if (plan === "silver") {
              cardStyle = "border-slate-300 bg-gradient-to-b from-slate-50/30 to-white shadow-sm hover:border-slate-400";
            }

            return (
              <Link key={user._id} href={`/users/${user._id}`}>
                <div className={`border rounded-2xl p-4 hover:shadow-md transition-all cursor-pointer relative ${cardStyle}`}>
                  {/* Badge Label inside card */}
                  {plan === "gold" && (
                    <span className="absolute top-2 right-2 flex items-center gap-0.5 bg-yellow-500 text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded-full uppercase tracking-wide">
                      <Award className="w-2.5 h-2.5 fill-current" />
                      Featured
                    </span>
                  )}
                  {plan === "silver" && (
                    <span className="absolute top-2 right-2 flex items-center gap-0.5 bg-slate-500 text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded-full uppercase tracking-wide">
                      Enhanced
                    </span>
                  )}

                  <div className="flex items-center mb-3 pr-12">
                    <Avatar className="w-12 h-12 mr-3 border border-gray-100">
                      <AvatarFallback className="text-lg bg-orange-50 text-orange-800 font-semibold">
                        {user.name
                          .split(" ")
                          .map((n: any) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold text-blue-600 hover:text-blue-800 truncate flex items-center gap-1">
                        {user.name}
                        {plan === "bronze" && <Award className="w-3.5 h-3.5 text-amber-700 fill-current" />}
                      </h3>
                      <p className="text-xs text-gray-500 truncate">
                        @{user.name.split(" ")[0].toLowerCase()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center text-xs text-gray-500">
                    <Calendar className="w-3.5 h-3.5 mr-1 text-gray-400" />
                    <span>Joined {new Date(user.joinDate).getFullYear()}</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </Mainlayout>
  );
};

export default index;
