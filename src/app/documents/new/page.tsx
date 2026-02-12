"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarIcon, Upload, Loader2, FileUp } from "lucide-react";
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

export default function NewDocumentPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [file, setFile] = useState<File | null>(null);

    const today = new Date().toISOString().split("T")[0];
    const [formData, setFormData] = useState({
        requestDate: today,
        useDate: "",
        subject: "",
    });

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            let attachmentPath = null;

            // Upload file first if exists
            if (file) {
                const formDataUpload = new FormData();
                formDataUpload.append("file", file);
                const uploadRes = await fetch("/api/upload", {
                    method: "POST",
                    body: formDataUpload,
                });
                if (!uploadRes.ok) {
                    toast.error("ไม่สามารถอัปโหลดไฟล์ได้");
                    setLoading(false);
                    return;
                }
                const uploadData = await uploadRes.json();
                attachmentPath = uploadData.path;
            }

            // Create document
            const res = await fetch("/api/documents", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...formData,
                    attachmentPath,
                }),
            });

            if (!res.ok) {
                const error = await res.json();
                toast.error(error.message || "เกิดข้อผิดพลาด");
                return;
            }

            const data = await res.json();
            toast.success(`สร้างเอกสารสำเร็จ เลขที่ ${data.runningNo}`);
            router.push("/documents");
        } catch {
            toast.error("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <Card className="border-slate-200 shadow-sm">
                <CardHeader>
                    <CardTitle className="text-xl flex items-center gap-2">
                        <FileUp className="h-5 w-5 text-emerald-600" />
                        สร้างคำขอเอกสารใหม่
                    </CardTitle>
                    <CardDescription>
                        กรอกข้อมูลเพื่อสร้างคำขอเอกสาร ระบบจะสร้างเลขที่เอกสารอัตโนมัติ
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

                        {/* File Upload */}
                        <div className="space-y-2">
                            <Label className="text-slate-700">แนบเอกสาร (ถ้ามี)</Label>
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
                                disabled={loading}
                            >
                                {loading ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : null}
                                สร้างคำขอ
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
