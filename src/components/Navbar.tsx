"use client";

import React from "react";
import { UserProfile } from "@/lib/types";
import { Store, User } from "lucide-react";

export function Navbar({ user }: { user?: UserProfile | null }) {
  return (
    <header className="h-16 bg-white border-b border-slate-100 px-6 flex items-center justify-between sticky top-0 z-10">
      <div className="flex items-center space-x-3">
        <span className="md:hidden font-black text-red-600 text-base tracking-tight">ANTERAJA</span>
        {user?.agentShopName && (
          <div className="hidden sm:flex items-center space-x-2 text-slate-700 text-xs font-semibold">
            <Store className="w-4 h-4 text-red-600" />
            <span>{user.agentShopName}</span>
          </div>
        )}
      </div>

      <div className="flex items-center space-x-4">
        {user && (
          <div className="flex items-center space-x-3">
            <div className="text-right">
              <div className="text-xs font-bold text-slate-900">{user.name}</div>
              <div className="text-[11px] text-slate-500 font-medium">
                Mitra Anteraja
              </div>
            </div>
            <div className="w-8 h-8 rounded-full bg-red-600 text-white font-bold text-xs flex items-center justify-center">
              {user.name ? user.name.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
