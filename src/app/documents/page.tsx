"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
    Plus,
    Search,
    Eye,
    FileText,
    Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface DocumentRequest {
    id: string;
    runningNo: string;
    requestDate: string;
    useDate: string;
    subject: string;
    status: string;
    attachmentPath: string | null;
    createdBy: {
        name: string;
    };
    createdAt: string;
}

export default function DocumentsPage() {
    const { data: session } = useSession();
    const [documents, setDocuments] = useState<DocumentRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [yearFilter, setYearFilter] = useState("all");

    const currentBuddhistYear = new Date().getFullYear() + 543;
    const yearOptions = Array.from({ length: 5 }, (_, i) => currentBuddhistYear - i);

    const fetchDocuments = useCallback(async () => {
        try {
            const params = new URLSearchParams();
            if (search) params.set("search", search);
            if (yearFilter && yearFilter !== "all") params.set("year", yearFilter);

            const res = await fetch(`/api/documents?${params.toString()}`);
            const data = await res.json();
            setDocuments(data);
        } catch {
            toast.error("ไม่สามารถโหลดข้อมูลได้");
        } finally {
            setLoading(false);
        }
    }, [search, yearFilter]);

    useEffect(() => {
        fetchDocuments();
    }, [fetchDocuments]);

    const handleExportExcel = async () => {
        try {
            const params = new URLSearchParams();
            if (search) params.set("search", search);
            if (yearFilter && yearFilter !== "all") params.set("year", yearFilter);

            const res = await fetch(`/api/documents/export?${params.toString()}`);
            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `documents-${new Date().toISOString().slice(0, 10)}.xlsx`;
            a.click();
            window.URL.revokeObjectURL(url);
            toast.success("ส่งออกสำเร็จ");
        } catch {
            toast.error("เกิดข้อผิดพลาดในการส่งออก");
        }
    };

    const formatDate = (dateStr: string) => {
        const d = new Date(dateStr);
        return d.toLocaleDateString("th-TH", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">รายการเอกสาร</h2>
                    <p className="text-sm text-slate-500 mt-1">
                        {session?.user?.role === "admin"
                            ? "เอกสารทั้งหมดในระบบ"
                            : "เอกสารของคุณ"}
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        onClick={handleExportExcel}
                        className="border-slate-200"
                    >
                        <Download className="mr-2 h-4 w-4" />
                        Export Excel
                    </Button>
                    <Link href="/documents/new">
                        <Button className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg shadow-emerald-200">
                            <Plus className="mr-2 h-4 w-4" />
                            สร้างคำขอใหม่
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Filters */}
            <Card className="border-slate-200 shadow-sm">
                <CardContent className="pt-6">
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder="ค้นหาตามเรื่อง..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-9 h-10"
                            />
                        </div>
                        <Select value={yearFilter} onValueChange={setYearFilter}>
                            <SelectTrigger className="w-[160px] h-10">
                                <SelectValue placeholder="เลือกปี" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">ทุกปี</SelectItem>
                                {yearOptions.map((year) => (
                                    <SelectItem key={year} value={year.toString()}>
                                        พ.ศ. {year}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Table */}
            <Card className="border-slate-200 shadow-sm">
                <CardHeader className="pb-3">
                    <CardTitle className="text-base font-medium text-slate-700">
                        รายการทั้งหมด ({documents.length} รายการ)
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500" />
                        </div>
                    ) : documents.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                            <FileText className="h-12 w-12 mb-3" />
                            <p className="text-lg font-medium">ไม่พบเอกสาร</p>
                            <p className="text-sm mt-1">ยังไม่มีเอกสารในระบบ</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-slate-50/50">
                                        <TableHead className="font-semibold text-slate-600">
                                            เลขที่
                                        </TableHead>
                                        <TableHead className="font-semibold text-slate-600">
                                            วันที่ขอ
                                        </TableHead>
                                        <TableHead className="font-semibold text-slate-600">
                                            วันที่ใช้
                                        </TableHead>
                                        <TableHead className="font-semibold text-slate-600">
                                            เรื่อง
                                        </TableHead>
                                        {session?.user?.role === "admin" && (
                                            <TableHead className="font-semibold text-slate-600">
                                                ผู้สร้าง
                                            </TableHead>
                                        )}
                                        <TableHead className="font-semibold text-slate-600">
                                            สถานะ
                                        </TableHead>
                                        <TableHead className="font-semibold text-slate-600 text-right">
                                            จัดการ
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {documents.map((doc) => (
                                        <TableRow
                                            key={doc.id}
                                            className="hover:bg-slate-50/50 transition-colors"
                                        >
                                            <TableCell className="font-mono font-medium text-slate-800">
                                                {doc.runningNo}
                                            </TableCell>
                                            <TableCell className="text-slate-600">
                                                {formatDate(doc.requestDate)}
                                            </TableCell>
                                            <TableCell className="text-slate-600">
                                                {formatDate(doc.useDate)}
                                            </TableCell>
                                            <TableCell className="text-slate-700 max-w-[300px] truncate">
                                                {doc.subject}
                                            </TableCell>
                                            {session?.user?.role === "admin" && (
                                                <TableCell className="text-slate-600">
                                                    {doc.createdBy.name}
                                                </TableCell>
                                            )}
                                            <TableCell>
                                                <Badge
                                                    variant={
                                                        doc.status === "active" ? "default" : "destructive"
                                                    }
                                                    className={
                                                        doc.status === "active"
                                                            ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-0"
                                                            : "bg-red-100 text-red-700 hover:bg-red-100 border-0"
                                                    }
                                                >
                                                    {doc.status === "active" ? "Active" : "Cancelled"}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Link href={`/documents/${doc.id}`}>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="text-slate-500 hover:text-emerald-600"
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                </Link>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
