"use client";

import React, { useState, useEffect, useRef } from "react";
import { Search, MapPin, Loader2, Check } from "lucide-react";
import { District } from "@/lib/types";

interface DistrictSelectorProps {
  label: string;
  value: string; // dist_code
  onChange: (district: District) => void;
  placeholder?: string;
  initialDistrict?: District | null;
}

export function DistrictSelector({
  label,
  value,
  onChange,
  placeholder = "Ketik nama kecamatan atau kota...",
  initialDistrict
}: DistrictSelectorProps) {
  const [query, setQuery] = useState(initialDistrict ? `${initialDistrict.dist_name}, ${initialDistrict.city_name}` : "");
  const [results, setResults] = useState<District[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const lastSelectedCode = useRef<string>(value || "");

  useEffect(() => {
    if (initialDistrict && !query) {
      setQuery(`${initialDistrict.dist_name}, ${initialDistrict.city_name}`);
      lastSelectedCode.current = initialDistrict.dist_code;
    }
  }, [initialDistrict]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 350ms Debounced search effect
  useEffect(() => {
    if (!isTyping) return;

    const trimmed = query.trim();
    if (!trimmed || trimmed.length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/districts?q=${encodeURIComponent(trimmed)}&limit=8`);
        const data = await res.json();
        if (data.success) {
          setResults(data.districts || []);
          setOpen(true);
        }
      } catch (e) {
        console.error("[DistrictSelector search error]:", e);
      } finally {
        setLoading(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [query, isTyping]);

  const handleInputChange = (val: string) => {
    setIsTyping(true);
    setQuery(val);
  };

  const handleSelect = (dist: District) => {
    setIsTyping(false);
    lastSelectedCode.current = dist.dist_code;
    setQuery(`${dist.dist_name}, ${dist.city_name} (${dist.dist_code})`);
    setOpen(false);
    onChange(dist);
  };

  return (
    <div className="relative" ref={wrapperRef}>
      <label className="block text-xs font-semibold text-slate-700 mb-1">{label}</label>
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => { if (results.length > 0) setOpen(true); }}
          placeholder={placeholder}
          className="w-full pl-9 pr-8 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
        />
        <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
        {loading && <Loader2 className="w-4 h-4 text-red-500 animate-spin absolute right-3 top-3" />}
      </div>

      {open && results.length > 0 && (
        <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl max-h-64 overflow-y-auto divide-y divide-slate-100">
          {results.map((r) => {
            const isSelected = r.dist_code === value;
            return (
              <div
                key={r.id}
                onClick={() => handleSelect(r)}
                className={`p-3 hover:bg-red-50 cursor-pointer flex items-center justify-between transition-colors ${
                  isSelected ? "bg-red-50/70" : ""
                }`}
              >
                <div>
                  <div className="text-xs font-bold text-slate-900 flex items-center space-x-1.5">
                    <span>{r.dist_name}</span>
                    <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono font-normal">
                      {r.dist_code}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    {r.city_name}, {r.province_name} &bull; Kode Pos: {r.postal_code ? r.postal_code.split(",")[0] : "-"}
                  </div>
                </div>
                {isSelected && <Check className="w-4 h-4 text-red-600 flex-shrink-0" />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
