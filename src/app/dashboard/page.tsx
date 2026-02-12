"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import {
    FileText,
    CheckCircle2,
    XCircle,
    CalendarDays,
    Plus,
    ArrowRight,
} from "lucide-react";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface DashboardStats {
    total: number;
    active: number;
    cancelled: number;
    thisMonth: number;
}

export default function DashboardPage() {
    const { data: session } = useSession();
    const [stats, setStats] = useState<DashboardStats>({
        total: 0,
        active: 0,
        cancelled: 0,
        thisMonth: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/documents/stats")
            .then((res) => res.json())
            .then((data) => setStats(data))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const statCards = [
        {
            label: "เอกสารทั้งหมด",
            value: stats.total,
            icon: FileText,
            color: "text-blue-600",
            bg: "bg-blue-50",
            border: "border-blue-100",
        },
        {
            label: "Active",
            value: stats.active,
            icon: CheckCircle2,
            color: "text-emerald-600",
            bg: "bg-emerald-50",
            border: "border-emerald-100",
        },
        {
            label: "Cancelled",
            value: stats.cancelled,
            icon: XCircle,
            color: "text-red-500",
            bg: "bg-red-50",
            border: "border-red-100",
        },
        {
            label: "เดือนนี้",
            value: stats.thisMonth,
            icon: CalendarDays,
            color: "text-orange-500",
            bg: "bg-orange-50",
            border: "border-orange-100",
        },
    ];

    return (
        <div className="space-y-6">
            {/* Welcome */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">
                        สวัสดี, {session?.user?.name} 👋
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">
                        ยินดีต้อนรับสู่ระบบจัดการเอกสาร
                    </p>
                </div>
                <Link href="/documents/new">
                    <Button className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg shadow-emerald-200">
                        <Plus className="mr-2 h-4 w-4" />
                        สร้างคำขอใหม่
                    </Button>
                </Link>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map((card) => (
                    <Card
                        key={card.label}
                        className={`border ${card.border} shadow-sm hover:shadow-md transition-shadow`}
                    >
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-slate-500">{card.label}</p>
                                    <p className="text-3xl font-bold text-slate-800 mt-1">
                                        {loading ? "—" : card.value}
                                    </p>
                                </div>
                                <div className={`p-3 rounded-xl ${card.bg}`}>
                                    <card.icon className={`h-6 w-6 ${card.color}`} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Quick Actions */}
            <Card className="border-slate-200 shadow-sm">
                <CardHeader>
                    <CardTitle className="text-lg">เมนูลัด</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Link href="/documents/new">
                            <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50 transition-all cursor-pointer group">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-emerald-100">
                                        <Plus className="h-5 w-5 text-emerald-600" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-slate-700">สร้างคำขอเอกสาร</p>
                                        <p className="text-xs text-slate-400">เริ่มสร้างคำขอใหม่</p>
                                    </div>
                                </div>
                                <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-emerald-500 transition-colors" />
                            </div>
                        </Link>
                        <Link href="/documents">
                            <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 transition-all cursor-pointer group">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-blue-100">
                                        <FileText className="h-5 w-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-slate-700">รายการเอกสาร</p>
                                        <p className="text-xs text-slate-400">ดูเอกสารทั้งหมด</p>
                                    </div>
                                </div>
                                <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-blue-500 transition-colors" />
                            </div>
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
