"use client";

import React from "react";
import { usePathname, useRouter } from "next/navigation";
import { 
  Home, 
  ClipboardList,
  QrCode, 
  PackagePlus, 
  Search, 
  LogOut
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
    { name: "Beranda", href: "/dashboard", icon: Home },
    { name: "Tasklist", href: "/tasklist", icon: ClipboardList },
    { name: "Scan Paket", href: "/scan", icon: QrCode },
    { name: "Buat Order", href: "/order/create", icon: PackagePlus },
    { name: "Lacak Paket", href: "/tracking", icon: Search },
  ];

  return (
    <aside className="w-60 bg-white border-r border-slate-100 min-h-screen flex flex-col justify-between hidden md:flex">
      <div>
        {/* Brand Header */}
        <div className="h-16 flex items-center px-6 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-md bg-red-600 flex items-center justify-center font-black text-white text-sm">
              A
            </div>
            <span className="font-bold text-base text-slate-900 tracking-tight">Anteraja Mitra</span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="p-3 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
            return (
              <a
                key={item.name}
                href={item.href}
                className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? "bg-red-50 text-red-600 font-bold"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-red-600" : "text-slate-400"}`} />
                <span>{item.name}</span>
              </a>
            );
          })}
        </nav>
      </div>

      {/* Logout Footer */}
      <div className="p-4 border-t border-slate-100">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center space-x-2 px-3 py-2 rounded-lg text-slate-500 hover:bg-red-50 hover:text-red-600 text-xs font-medium transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Keluar</span>
        </button>
      </div>
    </aside>
  );
}
