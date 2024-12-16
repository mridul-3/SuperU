"use client";

import Sidebar from "@/components/sidebar";

export default function Dashboard() {
  return (
    <div className="flex h-full w-full item-center justify-center">
        <Sidebar/>
        <div className={'grow w-full overflow-x-hidden transition-all duration-300 flex flex-col ml-14 mt-10'}>
        <h1>Dashboard</h1>
      </div>
    </div>
  );
}