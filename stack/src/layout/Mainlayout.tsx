import Navbar from "@/components/Navbar";
import RightSideBar from "@/components/RightSideBar";
import Sidebar from "@/components/Sidebar";
import React, { ReactNode, useEffect, useState } from "react";
interface MainlayoutProps {
  children: ReactNode;
}
const Mainlayout = ({ children }: MainlayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  useEffect(() => {
    if (window.innerWidth <= 768) {
      setSidebarOpen(false);
    }
  }, []);
  const handleslidein = () => {
    if (window.innerWidth <= 768) {
      setSidebarOpen((state) => !state);
    }
  };

  return (
    <div className="relative bg-[#f8f9fa] text-[#3a3a3a] min-h-screen">
      <Navbar handleslidein={handleslidein} />
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/25 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <div className="flex flex-col md:flex-row max-w-full">
        <Sidebar isopen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="flex-1 min-w-0 w-full p-4 lg:p-6 bg-white">
          {children}
        </main>
        <div className="hidden lg:block border-l border-gray-200">
          <RightSideBar />
        </div>
      </div>
    </div>
  );
};

export default Mainlayout;
