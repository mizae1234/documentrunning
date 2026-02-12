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
    ChevronLeft,
    ChevronRight,
    CalendarIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

interface Pagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export default function DocumentsPage() {
    const { data: session } = useSession();
    const [documents, setDocuments] = useState<DocumentRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    const currentBuddhistYear = new Date().getFullYear() + 543;
    const yearOptions = Array.from({ length: 5 }, (_, i) => currentBuddhistYear - i);

    // Default to current Buddhist year
    const [yearFilter, setYearFilter] = useState(currentBuddhistYear.toString());

    // Date range filter
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");

    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState<Pagination>({
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
    });

    const fetchDocuments = useCallback(async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (search) params.set("search", search);
            if (yearFilter && yearFilter !== "all") params.set("year", yearFilter);
            if (dateFrom) params.set("dateFrom", dateFrom);
            if (dateTo) params.set("dateTo", dateTo);
            params.set("page", page.toString());
            params.set("limit", "20");

            const res = await fetch(`/api/documents?${params.toString()}`);
            const result = await res.json();
            setDocuments(result.data);
            setPagination(result.pagination);
        } catch {
            toast.error("ไม่สามารถโหลดข้อมูลได้");
        } finally {
            setLoading(false);
        }
    }, [search, yearFilter, dateFrom, dateTo, page]);

    useEffect(() => {
        fetchDocuments();
    }, [fetchDocuments]);

    // Reset to page 1 when search or filter changes
    useEffect(() => {
        setPage(1);
    }, [search, yearFilter, dateFrom, dateTo]);

    const handleExportExcel = async () => {
        try {
            const params = new URLSearchParams();
            if (search) params.set("search", search);
            if (yearFilter && yearFilter !== "all") params.set("year", yearFilter);
            if (dateFrom) params.set("dateFrom", dateFrom);
            if (dateTo) params.set("dateTo", dateTo);

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

    const handleClearFilters = () => {
        setSearch("");
        setYearFilter(currentBuddhistYear.toString());
        setDateFrom("");
        setDateTo("");
    };

    const formatDate = (dateStr: string) => {
        const d = new Date(dateStr);
        return d.toLocaleDateString("th-TH", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    const startItem = (pagination.page - 1) * pagination.limit + 1;
    const endItem = Math.min(pagination.page * pagination.limit, pagination.total);

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
                <CardContent className="pt-6 space-y-3">
                    {/* Row 1: Search + Year */}
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder="ค้นหาตามเลขที่หรือเรื่อง..."
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

                    {/* Row 2: Date Range */}
                    <div className="flex flex-col sm:flex-row items-end gap-3">
                        <div className="flex-1 space-y-1">
                            <Label className="text-xs text-slate-500">วันที่เริ่มต้น</Label>
                            <div className="relative">
                                <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <Input
                                    type="date"
                                    value={dateFrom}
                                    onChange={(e) => setDateFrom(e.target.value)}
                                    className="pl-9 h-10"
                                />
                            </div>
                        </div>
                        <div className="flex-1 space-y-1">
                            <Label className="text-xs text-slate-500">วันที่สิ้นสุด</Label>
                            <div className="relative">
                                <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <Input
                                    type="date"
                                    value={dateTo}
                                    onChange={(e) => setDateTo(e.target.value)}
                                    className="pl-9 h-10"
                                />
                            </div>
                        </div>
                        {(dateFrom || dateTo || search || yearFilter !== currentBuddhistYear.toString()) && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleClearFilters}
                                className="text-slate-500 hover:text-red-500 h-10 whitespace-nowrap"
                            >
                                ล้างตัวกรอง
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Table */}
            <Card className="border-slate-200 shadow-sm">
                <CardHeader className="pb-3">
                    <CardTitle className="text-base font-medium text-slate-700">
                        รายการทั้งหมด ({pagination.total} รายการ)
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
                        <>
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

                            {/* Pagination Controls */}
                            {pagination.totalPages > 1 && (
                                <div className="flex items-center justify-between pt-4 border-t mt-4">
                                    <p className="text-sm text-slate-500">
                                        แสดง {startItem}-{endItem} จาก {pagination.total} รายการ
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            disabled={page <= 1}
                                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                                            className="h-8"
                                        >
                                            <ChevronLeft className="h-4 w-4 mr-1" />
                                            ก่อนหน้า
                                        </Button>
                                        <div className="flex items-center gap-1">
                                            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                                                .filter((p) => {
                                                    if (p === 1 || p === pagination.totalPages) return true;
                                                    if (Math.abs(p - page) <= 1) return true;
                                                    return false;
                                                })
                                                .reduce<(number | string)[]>((acc, p, idx, arr) => {
                                                    if (idx > 0 && p - (arr[idx - 1] as number) > 1) {
                                                        acc.push("...");
                                                    }
                                                    acc.push(p);
                                                    return acc;
                                                }, [])
                                                .map((item, idx) =>
                                                    item === "..." ? (
                                                        <span key={`dots-${idx}`} className="px-1 text-slate-400">
                                                            ...
                                                        </span>
                                                    ) : (
                                                        <Button
                                                            key={item}
                                                            variant={page === item ? "default" : "outline"}
                                                            size="sm"
                                                            className={`h-8 w-8 p-0 ${page === item
                                                                    ? "bg-emerald-500 hover:bg-emerald-600 text-white"
                                                                    : ""
                                                                }`}
                                                            onClick={() => setPage(item as number)}
                                                        >
                                                            {item}
                                                        </Button>
                                                    )
                                                )}
                                        </div>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            disabled={page >= pagination.totalPages}
                                            onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                                            className="h-8"
                                        >
                                            ถัดไป
                                            <ChevronRight className="h-4 w-4 ml-1" />
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
