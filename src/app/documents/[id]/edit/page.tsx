"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    CalendarIcon,
    Upload,
    Loader2,
    FileUp,
    ArrowLeft,
    Paperclip,
    Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import Link from "next/link";

interface DocumentDetail {
    id: string;
    runningNo: string;
    requestDate: string;
    useDate: string;
    subject: string;
    attachmentPath: string | null;
    status: string;
}

export default function EditDocumentPage() {
    const params = useParams();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [doc, setDoc] = useState<DocumentDetail | null>(null);
    const [file, setFile] = useState<File | null>(null);
    const [removeAttachment, setRemoveAttachment] = useState(false);

    const [formData, setFormData] = useState({
        requestDate: "",
        useDate: "",
        subject: "",
    });

    useEffect(() => {
        fetch(`/api/documents/${params.id}`)
            .then((res) => {
                if (!res.ok) throw new Error("Failed to load");
                return res.json();
            })
            .then((data: DocumentDetail) => {
                setDoc(data);
                setFormData({
                    requestDate: data.requestDate.split("T")[0],
                    useDate: data.useDate.split("T")[0],
                    subject: data.subject,
                });
            })
            .catch(() => toast.error("ไม่สามารถโหลดข้อมูลได้"))
            .finally(() => setLoading(false));
    }, [params.id]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setRemoveAttachment(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            let attachmentPath: string | null | undefined = undefined;

            // Upload new file if selected
            if (file) {
                const formDataUpload = new FormData();
                formDataUpload.append("file", file);
                const uploadRes = await fetch("/api/upload", {
                    method: "POST",
                    body: formDataUpload,
                });
                if (!uploadRes.ok) {
                    toast.error("ไม่สามารถอัปโหลดไฟล์ได้");
                    setSaving(false);
                    return;
                }
                const uploadData = await uploadRes.json();
                attachmentPath = uploadData.path;
            } else if (removeAttachment) {
                attachmentPath = null;
            }

            // Update document
            const updateBody: Record<string, unknown> = { ...formData };
            if (attachmentPath !== undefined) {
                updateBody.attachmentPath = attachmentPath;
            }

            const res = await fetch(`/api/documents/${params.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updateBody),
            });

            if (!res.ok) {
                const error = await res.json();
                toast.error(error.message || "เกิดข้อผิดพลาด");
                return;
            }

            toast.success("บันทึกการแก้ไขสำเร็จ");
            router.push(`/documents/${params.id}`);
        } catch {
            toast.error("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
        } finally {
            setSaving(false);
        }
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
                <p>ไม่พบเอกสาร</p>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto">
            {/* Back Button */}
            <Link href={`/documents/${params.id}`}>
                <Button variant="ghost" className="text-slate-500 -ml-2 mb-4">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    กลับไปรายละเอียด
                </Button>
            </Link>

            <Card className="border-slate-200 shadow-sm">
                <CardHeader>
                    <CardTitle className="text-xl flex items-center gap-2">
                        <FileUp className="h-5 w-5 text-emerald-600" />
                        แก้ไขเอกสาร {doc.runningNo}
                    </CardTitle>
                    <CardDescription>
                        แก้ไขรายละเอียดเอกสาร
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Request Date */}
                        <div className="space-y-2">
                            <Label htmlFor="requestDate" className="text-slate-700">
                                วันที่ขอ
                            </Label>
                            <div className="relative">
                                <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <Input
                                    id="requestDate"
                                    type="date"
                                    value={formData.requestDate}
                                    onChange={(e) =>
                                        setFormData({ ...formData, requestDate: e.target.value })
                                    }
                                    className="pl-9 h-11"
                                    required
                                />
                            </div>
                        </div>

                        {/* Use Date */}
                        <div className="space-y-2">
                            <Label htmlFor="useDate" className="text-slate-700">
                                วันที่ใช้
                            </Label>
                            <div className="relative">
                                <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <Input
                                    id="useDate"
                                    type="date"
                                    value={formData.useDate}
                                    onChange={(e) =>
                                        setFormData({ ...formData, useDate: e.target.value })
                                    }
                                    className="pl-9 h-11"
                                    required
                                />
                            </div>
                        </div>

                        {/* Subject */}
                        <div className="space-y-2">
                            <Label htmlFor="subject" className="text-slate-700">
                                เรื่อง
                            </Label>
                            <Textarea
                                id="subject"
                                placeholder="ระบุรายละเอียดเรื่องที่ต้องการ..."
                                value={formData.subject}
                                onChange={(e) =>
                                    setFormData({ ...formData, subject: e.target.value })
                                }
                                className="min-h-[100px] resize-none"
                                required
                            />
                        </div>

                        {/* Current Attachment */}
                        {doc.attachmentPath && !removeAttachment && !file && (
                            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl">
                                <Paperclip className="h-5 w-5 text-blue-500" />
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-blue-700">ไฟล์แนบปัจจุบัน</p>
                                    <p className="text-xs text-blue-500">{doc.attachmentPath}</p>
                                </div>
                                <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    className="border-red-200 text-red-500 hover:bg-red-50"
                                    onClick={() => setRemoveAttachment(true)}
                                >
                                    <Trash2 className="h-3 w-3 mr-1" />
                                    ลบ
                                </Button>
                            </div>
                        )}

                        {/* File Upload */}
                        <div className="space-y-2">
                            <Label className="text-slate-700">
                                {doc.attachmentPath && !removeAttachment && !file
                                    ? "เปลี่ยนไฟล์แนบ"
                                    : "แนบเอกสาร (ถ้ามี)"}
                            </Label>
                            <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:border-emerald-300 transition-colors">
                                <input
                                    type="file"
                                    id="fileUpload"
                                    onChange={handleFileChange}
                                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                    className="hidden"
                                />
                                <label htmlFor="fileUpload" className="cursor-pointer">
                                    <Upload className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                                    {file ? (
                                        <p className="text-sm text-emerald-600 font-medium">
                                            {file.name}
                                        </p>
                                    ) : (
                                        <>
                                            <p className="text-sm text-slate-500 font-medium">
                                                คลิกเพื่อเลือกไฟล์
                                            </p>
                                            <p className="text-xs text-slate-400 mt-1">
                                                รองรับ PDF, DOC, DOCX, JPG, PNG
                                            </p>
                                        </>
                                    )}
                                </label>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3 pt-2">
                            <Button
                                type="button"
                                variant="outline"
                                className="flex-1"
                                onClick={() => router.back()}
                            >
                                ยกเลิก
                            </Button>
                            <Button
                                type="submit"
                                className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white"
                                disabled={saving}
                            >
                                {saving ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : null}
                                บันทึกการแก้ไข
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
