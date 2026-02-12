"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    FileText,
    Calendar,
    User,
    Paperclip,
    ArrowLeft,
    XCircle,
    Loader2,
    Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import Link from "next/link";

interface DocumentDetail {
    id: string;
    runningNo: string;
    runningSeq: number;
    year: number;
    requestDate: string;
    useDate: string;
    subject: string;
    attachmentPath: string | null;
    status: string;
    cancelReason: string | null;
    cancelledAt: string | null;
    cancelledBy: { name: string } | null;
    createdBy: { name: string; email: string };
    createdAt: string;
}

export default function DocumentDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [doc, setDoc] = useState<DocumentDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [cancelling, setCancelling] = useState(false);
    const [cancelReason, setCancelReason] = useState("");

    useEffect(() => {
        fetch(`/api/documents/${params.id}`)
            .then((res) => res.json())
            .then(setDoc)
            .catch(() => toast.error("ไม่สามารถโหลดข้อมูลได้"))
            .finally(() => setLoading(false));
    }, [params.id]);

    const handleCancel = async () => {
        if (!cancelReason.trim()) {
            toast.error("กรุณากรอกเหตุผลการยกเลิก");
            return;
        }

        setCancelling(true);
        try {
            const res = await fetch(`/api/documents/${params.id}/cancel`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ reason: cancelReason }),
            });

            if (!res.ok) {
                const error = await res.json();
                toast.error(error.message || "เกิดข้อผิดพลาด");
                return;
            }

            toast.success("ยกเลิกเอกสารสำเร็จ");
            router.refresh();
            // Reload document
            const updated = await fetch(`/api/documents/${params.id}`);
            setDoc(await updated.json());
        } catch {
            toast.error("เกิดข้อผิดพลาด");
        } finally {
            setCancelling(false);
            setCancelReason("");
        }
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString("th-TH", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500" />
            </div>
        );
    }

    if (!doc) {
        return (
            <div className="text-center py-12 text-slate-400">
                <FileText className="h-12 w-12 mx-auto mb-3" />
                <p>ไม่พบเอกสาร</p>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            {/* Back Button */}
            <Link href="/documents">
                <Button variant="ghost" className="text-slate-500 -ml-2">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    กลับไปรายการ
                </Button>
            </Link>

            {/* Document Info Card */}
            <Card className="border-slate-200 shadow-sm">
                <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 rounded-xl bg-emerald-50">
                                <FileText className="h-6 w-6 text-emerald-600" />
                            </div>
                            <div>
                                <CardTitle className="text-xl">
                                    เอกสารเลขที่ {doc.runningNo}
                                </CardTitle>
                                <p className="text-sm text-slate-500 mt-0.5">
                                    สร้างเมื่อ {formatDate(doc.createdAt)}
                                </p>
                            </div>
                        </div>
                        <Badge
                            className={
                                doc.status === "active"
                                    ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-0 px-3 py-1"
                                    : "bg-red-100 text-red-700 hover:bg-red-100 border-0 px-3 py-1"
                            }
                        >
                            {doc.status === "active" ? "Active" : "Cancelled"}
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <InfoItem
                            icon={<Calendar className="h-4 w-4 text-slate-400" />}
                            label="วันที่ขอ"
                            value={formatDate(doc.requestDate)}
                        />
                        <InfoItem
                            icon={<Calendar className="h-4 w-4 text-slate-400" />}
                            label="วันที่ใช้"
                            value={formatDate(doc.useDate)}
                        />
                        <InfoItem
                            icon={<User className="h-4 w-4 text-slate-400" />}
                            label="ผู้สร้าง"
                            value={doc.createdBy.name}
                        />
                        <InfoItem
                            icon={<FileText className="h-4 w-4 text-slate-400" />}
                            label="ปี พ.ศ."
                            value={doc.year.toString()}
                        />
                    </div>

                    {/* Subject */}
                    <div className="p-4 bg-slate-50 rounded-xl">
                        <p className="text-xs font-medium text-slate-400 uppercase mb-2">
                            เรื่อง
                        </p>
                        <p className="text-slate-700">{doc.subject}</p>
                    </div>

                    {/* Attachment */}
                    {doc.attachmentPath && (
                        <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl">
                            <Paperclip className="h-5 w-5 text-blue-500" />
                            <div className="flex-1">
                                <p className="text-sm font-medium text-blue-700">ไฟล์แนบ</p>
                                <p className="text-xs text-blue-500">{doc.attachmentPath}</p>
                            </div>
                            <a href={`/api/download?key=${encodeURIComponent(doc.attachmentPath)}`} target="_blank" rel="noopener noreferrer">
                                <Button size="sm" variant="outline" className="border-blue-200 text-blue-600">
                                    <Download className="h-3 w-3 mr-1" />
                                    ดาวน์โหลด
                                </Button>
                            </a>
                        </div>
                    )}

                    {/* Cancel Info */}
                    {doc.status === "cancelled" && (
                        <div className="p-4 bg-red-50 rounded-xl border border-red-100">
                            <p className="text-sm font-medium text-red-700 mb-1">
                                ข้อมูลการยกเลิก
                            </p>
                            <p className="text-sm text-red-600">
                                <span className="font-medium">เหตุผล:</span> {doc.cancelReason}
                            </p>
                            <p className="text-xs text-red-400 mt-1">
                                ยกเลิกโดย {doc.cancelledBy?.name} เมื่อ{" "}
                                {doc.cancelledAt && formatDate(doc.cancelledAt)}
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Cancel Action */}
            {doc.status === "active" && (
                <Card className="border-red-100 shadow-sm">
                    <CardContent className="pt-6">
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button
                                    variant="outline"
                                    className="w-full border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                                >
                                    <XCircle className="mr-2 h-4 w-4" />
                                    ยกเลิกเอกสาร
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>ยืนยันการยกเลิกเอกสาร</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        คุณแน่ใจหรือไม่ว่าต้องการยกเลิกเอกสารเลขที่{" "}
                                        <span className="font-semibold">{doc.runningNo}</span>?
                                        การดำเนินการนี้ไม่สามารถย้อนกลับได้
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <div className="space-y-2 py-2">
                                    <Label htmlFor="cancelReason">เหตุผลการยกเลิก *</Label>
                                    <Textarea
                                        id="cancelReason"
                                        placeholder="กรุณาระบุเหตุผล..."
                                        value={cancelReason}
                                        onChange={(e) => setCancelReason(e.target.value)}
                                        className="min-h-[80px]"
                                    />
                                </div>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
                                    <AlertDialogAction
                                        onClick={handleCancel}
                                        className="bg-red-600 hover:bg-red-700"
                                        disabled={cancelling}
                                    >
                                        {cancelling && (
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        )}
                                        ยืนยันยกเลิก
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

function InfoItem({
    icon,
    label,
    value,
}: {
    icon: React.ReactNode;
    label: string;
    value: string;
}) {
    return (
        <div className="flex items-start gap-3">
            <div className="mt-0.5">{icon}</div>
            <div>
                <p className="text-xs text-slate-400">{label}</p>
                <p className="text-sm font-medium text-slate-700">{value}</p>
            </div>
        </div>
    );
}
