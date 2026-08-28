"use client";

import React from "react";
import { UserProfile } from "@/lib/types";
import { Store, ShieldCheck, MapPin } from "lucide-react";

export function Navbar({ user }: { user?: UserProfile | null }) {
  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-10 shadow-xs">
      <div className="flex items-center space-x-3">
        <span className="md:hidden font-bold text-red-600 text-base">ANTERAJA MAA</span>
        <div className="hidden sm:flex items-center space-x-2 bg-slate-100 text-slate-600 px-3 py-1.5 rounded-full text-xs font-medium">
          <MapPin className="w-3.5 h-3.5 text-red-500" />
          <span>Outlet District: <strong>{user?.agentShopDistrict || "31.74.02"}</strong></span>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        {user && (
          <div className="flex items-center space-x-3">
            <div className="text-right">
              <div className="text-xs font-bold text-slate-800">{user.agentShopName}</div>
              <div className="text-[11px] text-slate-500 flex items-center justify-end space-x-1">
                <ShieldCheck className="w-3 h-3 text-emerald-500" />
                <span>NIA: {user.username}</span>
              </div>
            </div>
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-red-600 to-pink-500 text-white font-bold text-sm flex items-center justify-center shadow-xs">
              {user.name.charAt(0).toUpperCase()}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
