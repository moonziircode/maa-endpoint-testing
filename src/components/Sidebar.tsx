"use client";

import React from "react";
import Link from "next/navigation";
import { usePathname, useRouter } from "next/navigation";
import { 
  LayoutDashboard, 
  QrCode, 
  PackagePlus, 
  Truck, 
  LogOut, 
  Store,
  UserCheck
} from "lucide-react";
import { UserProfile } from "@/lib/types";

interface SidebarProps {
  user?: UserProfile | null;
}

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch (e) {
      router.push("/login");
    }
  };

  const menuItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Scan Paket", href: "/scan", icon: QrCode },
    { name: "Buat Order Manual", href: "/order/create", icon: PackagePlus },
    { name: "Tracking Shipment", href: "/tracking", icon: Truck },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 min-h-screen flex flex-col justify-between hidden md:flex shadow-sm">
      <div>
        {/* Brand Header */}
        <div className="h-16 flex items-center px-6 border-b border-slate-100 bg-gradient-to-r from-red-600 to-pink-600">
          <div className="flex items-center space-x-3 text-white">
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center font-black text-lg">
              A
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight">ANTERAJA MAA</span>
              <span className="text-[10px] block opacity-80 uppercase tracking-widest font-semibold">Web Client</span>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="p-4 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
            return (
              <a
                key={item.name}
                href={item.href}
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? "bg-red-50 text-red-600 font-semibold shadow-xs"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? "text-red-600" : "text-slate-400"}`} />
                <span>{item.name}</span>
              </a>
            );
          })}
        </nav>
      </div>

      {/* User Info & Logout Footer */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/50">
        {user && (
          <div className="mb-3 px-2">
            <div className="flex items-center space-x-2 text-slate-800 font-medium text-xs">
              <UserCheck className="w-4 h-4 text-emerald-600" />
              <span className="truncate">{user.name} ({user.username})</span>
            </div>
            <div className="flex items-center space-x-2 text-slate-500 text-[11px] mt-1">
              <Store className="w-3.5 h-3.5" />
              <span className="truncate">{user.agentShopName}</span>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-red-50 hover:text-red-600 hover:border-red-200 text-xs font-semibold transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Keluar Sesi</span>
        </button>
      </div>
    </aside>
  );
}
