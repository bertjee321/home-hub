"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Compass, Battery, LampCeiling } from "lucide-react";

const tabItems = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard, disabled: false },
  { label: "Discover", href: "/discover", icon: Compass, disabled: false },
  { label: "Lights", href: "/lights", icon: LampCeiling, disabled: false },
  { label: "Energy", href: "/energy", icon: Battery, disabled: true },
];

export default function BottomTabBar() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-zinc-950 border-t border-zinc-800 flex items-stretch">
      {tabItems.map(({ label, href, icon: Icon, disabled }) => {
        const isActive = pathname === href;

        if (disabled) {
          return (
            <div
              key={href}
              className="flex-1 flex flex-col items-center justify-center gap-1 py-3 opacity-40 cursor-not-allowed select-none"
            >
              <Icon size={20} className="text-zinc-400" />
              <span className="text-[10px] text-zinc-400 font-medium">{label}</span>
            </div>
          );
        }

        return (
          <Link
            key={href}
            href={href}
            className={`flex-1 flex flex-col items-center justify-center gap-1 py-3 transition-colors ${
              isActive ? "text-blue-400" : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            <Icon size={20} />
            <span className="text-[10px] font-medium">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
