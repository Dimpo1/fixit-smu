"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  PlusCircle,
  Inbox,
  Users,
  ShieldAlert,
  Settings,
  LogOut,
  LogIn,
} from "lucide-react";
import { useAuth } from "@/features/auth";
import { ROLE_LABELS } from "@/entities/user";

export const AppShell: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const pathname = usePathname();
  const { user, profile, signOut } = useAuth();

  const isStaff =
    profile?.role === "residence_manager" ||
    profile?.role === "src" ||
    profile?.role === "house_committee";

  const navItems = [
    { label: "Home", href: "/", icon: Home },
    { label: "Report Issue", href: "/report", icon: PlusCircle },
    { label: "Tickets", href: "/tickets", icon: Inbox },
    { label: "Leaders Directory", href: "/leaders", icon: Users },
    { label: "Emergency SOS", href: "/emergency", icon: ShieldAlert },
    ...(isStaff ? [{ label: "Admin Console", href: "/admin", icon: Settings }] : []),
  ];

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-bg">
      {/* Sidebar (Desktop) */}
      <aside className="hidden md:flex flex-col w-64 bg-teal-dark text-white p-6 shrink-0 shadow-lg justify-between">
        <div>
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-3 mb-8 group">
            <div className="w-10 h-10 rounded-xl bg-coral flex items-center justify-center font-serif font-bold text-xl text-white shadow-sm group-hover:scale-105 transition-transform">
              F
            </div>
            <div>
              <div className="font-serif text-lg font-bold tracking-tight">
                Fixit SMU
              </div>
              <div className="text-[10px] text-white/60 tracking-wider uppercase">
                Campus & Res Reporting
              </div>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? "bg-coral text-white font-semibold shadow-xs"
                      : "text-white/70 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Card & Auth */}
        <div className="pt-6 border-t border-white/15">
          {user ? (
            <div className="space-y-3">
              <div>
                <div className="text-xs font-semibold truncate text-white">
                  {profile?.full_name || user.email}
                </div>
                <div className="text-[11px] text-white/60 truncate">
                  {profile ? ROLE_LABELS[profile.role] : "Authenticated"}
                </div>
                {profile?.residence && (
                  <div className="text-[10px] text-coral font-medium mt-0.5">
                    📍 {profile.residence}
                  </div>
                )}
              </div>
              <button
                onClick={() => signOut()}
                className="flex items-center gap-2 text-xs text-white/60 hover:text-red-300 transition-colors w-full pt-1"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign Out
              </button>
            </div>
          ) : (
            <Link
              href="/auth"
              className="flex items-center justify-center gap-2 w-full py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-colors"
            >
              <LogIn className="w-4 h-4" />
              Sign In to SMU Account
            </Link>
          )}
        </div>
      </aside>

      {/* Mobile Topbar & Header */}
      <header className="md:hidden bg-teal-dark text-white p-3.5 flex items-center justify-between sticky top-0 z-40 shadow-sm">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-coral flex items-center justify-center font-serif font-bold text-sm text-white">
            F
          </div>
          <span className="font-serif font-bold text-base">Fixit SMU</span>
        </Link>

        {user ? (
          <button
            onClick={() => signOut()}
            className="text-xs text-white/70 hover:text-white p-1"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        ) : (
          <Link
            href="/auth"
            className="text-xs font-semibold bg-coral text-white px-2.5 py-1 rounded-md"
          >
            Sign In
          </Link>
        )}
      </header>

      {/* Mobile Navigation bar */}
      <nav className="md:hidden bg-teal-dark border-t border-white/10 text-white flex overflow-x-auto p-1.5 gap-1 shrink-0 sticky top-[53px] z-30 shadow-xs">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs whitespace-nowrap shrink-0 transition-colors ${
                isActive
                  ? "bg-coral text-white font-semibold"
                  : "text-white/75 hover:bg-white/10"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-8 md:p-10 max-w-6xl w-full mx-auto">
        {children}
      </main>
    </div>
  );
};
