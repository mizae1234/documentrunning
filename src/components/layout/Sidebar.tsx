"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import {
    LayoutDashboard,
    FileText,
    Users,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState } from "react";

const menuItems = [
    {
        label: "แดชบอร์ด",
        href: "/dashboard",
        icon: LayoutDashboard,
    },
    {
        label: "เอกสาร",
        href: "/documents",
        icon: FileText,
    },
];

const adminItems = [
    {
        label: "จัดการผู้ใช้",
        href: "/admin/users",
        icon: Users,
    },
];

export function Sidebar() {
    const pathname = usePathname();
    const { data: session } = useSession();
    const [collapsed, setCollapsed] = useState(false);
    const isAdmin = session?.user?.role === "admin";

    return (
        <aside
            className={cn(
                "hidden md:flex flex-col h-full bg-white border-r border-slate-200 transition-all duration-300",
                collapsed ? "w-[68px]" : "w-[240px]"
            )}
        >
            {/* Logo */}
            <div className="flex items-center justify-between h-16 px-4 border-b border-slate-100">
                {!collapsed && (
                    <Link href="/dashboard" className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                            <FileText className="w-4 h-4 text-white" />
                        </div>
                        <span className="font-semibold text-slate-800 text-sm">
                            Doc Running
                        </span>
                    </Link>
                )}
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-slate-400"
                    onClick={() => setCollapsed(!collapsed)}
                >
                    {collapsed ? (
                        <ChevronRight className="h-4 w-4" />
                    ) : (
                        <ChevronLeft className="h-4 w-4" />
                    )}
                </Button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-3 space-y-1">
                {!collapsed && (
                    <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider px-3 mb-2">
                        เมนูหลัก
                    </p>
                )}
                {menuItems.map((item) => {
                    const isActive =
                        pathname === item.href || pathname.startsWith(item.href + "/");
                    return (
                        <Link key={item.href} href={item.href}>
                            <div
                                className={cn(
                                    "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                                    isActive
                                        ? "bg-emerald-50 text-emerald-700 shadow-sm"
                                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                                )}
                            >
                                <item.icon
                                    className={cn(
                                        "h-5 w-5 flex-shrink-0",
                                        isActive ? "text-emerald-600" : "text-slate-400"
                                    )}
                                />
                                {!collapsed && <span>{item.label}</span>}
                            </div>
                        </Link>
                    );
                })}

                {isAdmin && (
                    <>
                        {!collapsed && (
                            <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider px-3 mt-6 mb-2">
                                ผู้ดูแลระบบ
                            </p>
                        )}
                        {collapsed && <div className="my-4 border-t border-slate-100" />}
                        {adminItems.map((item) => {
                            const isActive =
                                pathname === item.href || pathname.startsWith(item.href + "/");
                            return (
                                <Link key={item.href} href={item.href}>
                                    <div
                                        className={cn(
                                            "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                                            isActive
                                                ? "bg-emerald-50 text-emerald-700 shadow-sm"
                                                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                                        )}
                                    >
                                        <item.icon
                                            className={cn(
                                                "h-5 w-5 flex-shrink-0",
                                                isActive ? "text-emerald-600" : "text-slate-400"
                                            )}
                                        />
                                        {!collapsed && <span>{item.label}</span>}
                                    </div>
                                </Link>
                            );
                        })}
                    </>
                )}
            </nav>

            {/* Footer */}
            {!collapsed && (
                <div className="p-4 border-t border-slate-100">
                    <p className="text-[10px] text-slate-400 text-center">
                        Document Running System v1.0
                    </p>
                </div>
            )}
        </aside>
    );
}
