"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import {
    Plus,
    Loader2,
    Shield,
    UserIcon,
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
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface UserData {
    id: string;
    name: string;
    email: string;
    role: string;
    createdAt: string;
}

export default function AdminUsersPage() {
    const { data: session } = useSession();
    const [users, setUsers] = useState<UserData[]>([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const [newUser, setNewUser] = useState({
        name: "",
        email: "",
        password: "",
        role: "user",
    });

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await fetch("/api/users");
            const data = await res.json();
            setUsers(data);
        } catch {
            toast.error("ไม่สามารถโหลดข้อมูลผู้ใช้ได้");
        } finally {
            setLoading(false);
        }
    };

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await fetch("/api/users", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newUser),
            });

            if (!res.ok) {
                const error = await res.json();
                toast.error(error.message || "เกิดข้อผิดพลาด");
                return;
            }

            toast.success("เพิ่มผู้ใช้สำเร็จ");
            setDialogOpen(false);
            setNewUser({ name: "", email: "", password: "", role: "user" });
            fetchUsers();
        } catch {
            toast.error("เกิดข้อผิดพลาด");
        } finally {
            setSaving(false);
        }
    };

    const handleRoleChange = async (userId: string, newRole: string) => {
        try {
            const res = await fetch(`/api/users/${userId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ role: newRole }),
            });

            if (!res.ok) {
                toast.error("เกิดข้อผิดพลาด");
                return;
            }

            toast.success("อัปเดต role สำเร็จ");
            fetchUsers();
        } catch {
            toast.error("เกิดข้อผิดพลาด");
        }
    };

    // Redirect non-admin
    if (session?.user?.role !== "admin") {
        return (
            <div className="flex items-center justify-center h-64 text-slate-400">
                <p>คุณไม่มีสิทธิ์เข้าถึงหน้านี้</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">จัดการผู้ใช้งาน</h2>
                    <p className="text-sm text-slate-500 mt-1">
                        เพิ่ม แก้ไข หรือจัดการผู้ใช้ในระบบ
                    </p>
                </div>
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg shadow-emerald-200">
                            <Plus className="mr-2 h-4 w-4" />
                            เพิ่มผู้ใช้ใหม่
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <form onSubmit={handleCreateUser}>
                            <DialogHeader>
                                <DialogTitle>เพิ่มผู้ใช้ใหม่</DialogTitle>
                                <DialogDescription>
                                    กรอกข้อมูลผู้ใช้ที่ต้องการเพิ่มเข้าสู่ระบบ
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">ชื่อ-สกุล</Label>
                                    <Input
                                        id="name"
                                        value={newUser.name}
                                        onChange={(e) =>
                                            setNewUser({ ...newUser, name: e.target.value })
                                        }
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="new-email">อีเมล</Label>
                                    <Input
                                        id="new-email"
                                        type="email"
                                        value={newUser.email}
                                        onChange={(e) =>
                                            setNewUser({ ...newUser, email: e.target.value })
                                        }
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="new-password">รหัสผ่าน</Label>
                                    <Input
                                        id="new-password"
                                        type="password"
                                        value={newUser.password}
                                        onChange={(e) =>
                                            setNewUser({ ...newUser, password: e.target.value })
                                        }
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="role">Role</Label>
                                    <Select
                                        value={newUser.role}
                                        onValueChange={(v) =>
                                            setNewUser({ ...newUser, role: v })
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="user">User</SelectItem>
                                            <SelectItem value="admin">Admin</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setDialogOpen(false)}
                                >
                                    ยกเลิก
                                </Button>
                                <Button
                                    type="submit"
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                                    disabled={saving}
                                >
                                    {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    เพิ่มผู้ใช้
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Users Table */}
            <Card className="border-slate-200 shadow-sm">
                <CardHeader className="pb-3">
                    <CardTitle className="text-base font-medium text-slate-700">
                        ผู้ใช้ทั้งหมด ({users.length} คน)
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500" />
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-slate-50/50">
                                        <TableHead className="font-semibold text-slate-600">
                                            ชื่อ
                                        </TableHead>
                                        <TableHead className="font-semibold text-slate-600">
                                            อีเมล
                                        </TableHead>
                                        <TableHead className="font-semibold text-slate-600">
                                            Role
                                        </TableHead>
                                        <TableHead className="font-semibold text-slate-600">
                                            วันที่สร้าง
                                        </TableHead>
                                        <TableHead className="font-semibold text-slate-600 text-right">
                                            จัดการ
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {users.map((user) => (
                                        <TableRow
                                            key={user.id}
                                            className="hover:bg-slate-50/50 transition-colors"
                                        >
                                            <TableCell className="font-medium text-slate-700">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                                                        {user.role === "admin" ? (
                                                            <Shield className="h-4 w-4 text-emerald-600" />
                                                        ) : (
                                                            <UserIcon className="h-4 w-4 text-slate-400" />
                                                        )}
                                                    </div>
                                                    {user.name}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-slate-600">
                                                {user.email}
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    className={
                                                        user.role === "admin"
                                                            ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-0"
                                                            : "bg-slate-100 text-slate-600 hover:bg-slate-100 border-0"
                                                    }
                                                >
                                                    {user.role === "admin" ? "Admin" : "User"}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-slate-500 text-sm">
                                                {new Date(user.createdAt).toLocaleDateString("th-TH")}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {user.id !== session?.user?.id && (
                                                    <Select
                                                        value={user.role}
                                                        onValueChange={(v) =>
                                                            handleRoleChange(user.id, v)
                                                        }
                                                    >
                                                        <SelectTrigger className="w-[100px] h-8 text-xs">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="user">User</SelectItem>
                                                            <SelectItem value="admin">Admin</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                )}
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
