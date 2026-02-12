"use client";

import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import {
    Menu,
    LogOut,
    User,
    FileText,
    LayoutDashboard,
    Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import Link from "next/link";
import { cn } from "@/lib/utils";

const pageTitles: Record<string, string> = {
    "/dashboard": "แดชบอร์ด",
    "/documents": "รายการเอกสาร",
    "/documents/new": "สร้างคำขอเอกสารใหม่",
    "/admin/users": "จัดการผู้ใช้งาน",
};

const mobileMenuItems = [
    { label: "แดชบอร์ด", href: "/dashboard", icon: LayoutDashboard },
    { label: "เอกสาร", href: "/documents", icon: FileText },
];

const mobileAdminItems = [
    { label: "จัดการผู้ใช้", href: "/admin/users", icon: Users },
];

function getPageTitle(pathname: string) {
    if (pathname.startsWith("/documents/") && pathname !== "/documents/new") {
        return "รายละเอียดเอกสาร";
    }
    return pageTitles[pathname] || "Document Running System";
}

export function Header() {
    const { data: session } = useSession();
    const pathname = usePathname();
    const isAdmin = session?.user?.role === "admin";
    const initials = session?.user?.name
        ?.split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2) || "U";

    return (
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-6">
            <div className="flex items-center gap-3">
                {/* Mobile menu */}
                <Sheet>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="icon" className="md:hidden">
                            <Menu className="h-5 w-5" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-[260px] p-0">
                        <div className="flex items-center gap-2 h-16 px-4 border-b border-slate-100">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                                <FileText className="w-4 h-4 text-white" />
                            </div>
                            <span className="font-semibold text-slate-800 text-sm">
                                Doc Running
                            </span>
                        </div>
                        <nav className="p-3 space-y-1">
                            <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider px-3 mb-2">
                                เมนูหลัก
                            </p>
                            {mobileMenuItems.map((item) => {
                                const isActive =
                                    pathname === item.href ||
                                    pathname.startsWith(item.href + "/");
                                return (
                                    <Link key={item.href} href={item.href}>
                                        <div
                                            className={cn(
                                                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                                                isActive
                                                    ? "bg-emerald-50 text-emerald-700"
                                                    : "text-slate-600 hover:bg-slate-50"
                                            )}
                                        >
                                            <item.icon className="h-5 w-5 flex-shrink-0" />
                                            <span>{item.label}</span>
                                        </div>
                                    </Link>
                                );
                            })}
                            {isAdmin && (
                                <>
                                    <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider px-3 mt-5 mb-2">
                                        ผู้ดูแลระบบ
                                    </p>
                                    {mobileAdminItems.map((item) => {
                                        const isActive = pathname === item.href;
                                        return (
                                            <Link key={item.href} href={item.href}>
                                                <div
                                                    className={cn(
                                                        "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                                                        isActive
                                                            ? "bg-emerald-50 text-emerald-700"
                                                            : "text-slate-600 hover:bg-slate-50"
                                                    )}
                                                >
                                                    <item.icon className="h-5 w-5 flex-shrink-0" />
                                                    <span>{item.label}</span>
                                                </div>
                                            </Link>
                                        );
                                    })}
                                </>
                            )}
                        </nav>
                    </SheetContent>
                </Sheet>
                <h1 className="text-lg font-semibold text-slate-800">
                    {getPageTitle(pathname)}
                </h1>
            </div>

            <div className="flex items-center gap-3">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            className="flex items-center gap-2 h-auto py-1.5 px-2"
                        >
                            <Avatar className="h-8 w-8">
                                <AvatarFallback className="bg-emerald-100 text-emerald-700 text-xs font-semibold">
                                    {initials}
                                </AvatarFallback>
                            </Avatar>
                            <div className="hidden sm:block text-left">
                                <p className="text-sm font-medium text-slate-700 leading-none">
                                    {session?.user?.name}
                                </p>
                                <p className="text-[11px] text-slate-400 leading-none mt-0.5">
                                    {session?.user?.role === "admin" ? "ผู้ดูแลระบบ" : "ผู้ใช้งาน"}
                                </p>
                            </div>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuLabel>
                            <div>
                                <p className="text-sm font-medium">{session?.user?.name}</p>
                                <p className="text-xs text-slate-400">{session?.user?.email}</p>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-slate-600">
                            <User className="mr-2 h-4 w-4" />
                            โปรไฟล์
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            className="text-red-600 focus:text-red-700 focus:bg-red-50"
                            onClick={() => signOut({ callbackUrl: "/login" })}
                        >
                            <LogOut className="mr-2 h-4 w-4" />
                            ออกจากระบบ
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}
