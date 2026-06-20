"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingBag, LayoutDashboard, Coffee } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "POS", icon: ShoppingBag },
  { href: "/admin", label: "Admin", icon: LayoutDashboard },
];

export function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="bg-coffee text-cream border-b border-gold/20 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 bg-gold/20 rounded-lg flex items-center justify-center group-hover:bg-gold/30 transition-colors">
              <Coffee className="w-5 h-5 text-gold" />
            </div>
            <div className="hidden sm:block">
              <span className="font-display text-lg font-semibold tracking-wide text-cream">
                MICHELIN
              </span>
              <span className="font-display text-lg font-light tracking-widest text-gold ml-1">
                POS
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-gold/20 text-gold"
                      : "text-cream/70 hover:text-cream hover:bg-white/5"
                  )}
                >
                  <item.icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
