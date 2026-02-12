"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const result = await signIn("credentials", {
                email,
                password,
                redirect: false,
            });

            if (result?.error) {
                toast.error("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
            } else {
                toast.success("เข้าสู่ระบบสำเร็จ");
                window.location.href = "/dashboard";
            }
        } catch {
            toast.error("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="flex flex-col items-center mb-8">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mb-4 shadow-lg shadow-emerald-200">
                        <FileText className="w-7 h-7 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-800">
                        Document Running System
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">
                        ระบบจัดการคำขอเลขที่เอกสาร
                    </p>
                </div>

                {/* Login Card */}
                <Card className="shadow-xl shadow-slate-200/50 border-slate-200/50">
                    <CardHeader className="text-center pb-4">
                        <CardTitle className="text-xl">เข้าสู่ระบบ</CardTitle>
                        <CardDescription>
                            กรุณากรอกอีเมลและรหัสผ่านเพื่อเข้าใช้งาน
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">อีเมล</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="name@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="h-11"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password">รหัสผ่าน</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="h-11"
                                />
                            </div>
                            <Button
                                type="submit"
                                className="w-full h-11 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg shadow-emerald-200"
                                disabled={loading}
                            >
                                {loading ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : null}
                                เข้าสู่ระบบ
                            </Button>
                        </form>

                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
