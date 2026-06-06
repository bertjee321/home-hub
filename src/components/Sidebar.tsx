"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Zap,
  LayoutDashboard,
  Compass,
  Battery,
  Settings,
  PanelLeftClose,
  PanelLeftOpen,
  LampCeiling,
} from "lucide-react";

const COLLAPSED_KEY = "sidebar-collapsed";

const navItems = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard, disabled: false },
  { label: "Discover", href: "/discover", icon: Compass, disabled: false },
  { label: "Lights", href: "/lights", icon: LampCeiling, disabled: false },
  { label: "Energy", href: "/energy", icon: Battery, disabled: true },
  { label: "Settings", href: "/settings", icon: Settings, disabled: true },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(COLLAPSED_KEY);
    if (stored !== null) setCollapsed(stored === "true");
    setMounted(true);
  }, []);

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem(COLLAPSED_KEY, String(next));
      return next;
    });
  };

  // Avoid hydration mismatch: render with default width until client state is read
  if (!mounted) {
    return (
      <aside className="hidden md:flex flex-col h-screen w-[240px] bg-zinc-950 border-r border-zinc-800 shrink-0" />
    );
  }

  return (
    <aside
      className={`hidden md:flex flex-col h-screen bg-zinc-950 border-r border-zinc-800 shrink-0 transition-all duration-200 ease-in-out ${
        collapsed ? "w-[68px]" : "w-[240px]"
      }`}
    >
      {/* Brand area */}
      <div
        className={`flex items-center border-b border-zinc-800 px-4 py-5 ${
          collapsed ? "justify-center" : "justify-between"
        }`}
      >
        <div className="flex items-center gap-3 overflow-hidden min-w-0">
          <Zap className="shrink-0 text-blue-400" size={22} />
          {!collapsed && (
            <span className="text-white font-semibold text-base whitespace-nowrap truncate">
              Home Hub
            </span>
          )}
        </div>
        <button
          onClick={toggleCollapsed}
          className={`text-zinc-500 hover:text-white transition-colors shrink-0 ${
            collapsed ? "hidden" : "block"
          }`}
          aria-label="Collapse sidebar"
        >
          <PanelLeftClose size={18} />
        </button>
        {collapsed && (
          <button
            onClick={toggleCollapsed}
            className="text-zinc-500 hover:text-white transition-colors absolute mt-0"
            aria-label="Expand sidebar"
          >
            <PanelLeftOpen size={18} />
          </button>
        )}
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-hidden">
        {navItems.map(({ label, href, icon: Icon, disabled }) => {
          const isActive = pathname === href;

          if (disabled) {
            return (
              <div
                key={href}
                title={label}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg opacity-40 cursor-not-allowed select-none ${
                  collapsed ? "justify-center" : ""
                }`}
              >
                <Icon className="shrink-0 text-zinc-400" size={20} />
                {!collapsed && (
                  <span className="text-zinc-400 text-sm font-medium whitespace-nowrap">
                    {label}
                  </span>
                )}
              </div>
            );
          }

          return (
            <Link
              key={href}
              href={href}
              title={collapsed ? label : undefined}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                collapsed ? "justify-center" : ""
              } ${
                isActive
                  ? "bg-zinc-700 text-white"
                  : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
              }`}
            >
              <Icon className="shrink-0" size={20} />
              {!collapsed && (
                <span className="text-sm font-medium whitespace-nowrap">{label}</span>
              )}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
