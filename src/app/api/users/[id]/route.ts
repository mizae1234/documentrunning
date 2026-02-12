import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

// PUT /api/users/[id] - Update user role (admin only)
export async function PUT(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await auth();
        if (!session?.user || session.user.role !== "admin") {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { role } = body;

        if (!role || !["admin", "user"].includes(role)) {
            return NextResponse.json(
                { message: "Role ไม่ถูกต้อง" },
                { status: 400 }
            );
        }

        // Prevent self-demotion
        if (params.id === session.user.id) {
            return NextResponse.json(
                { message: "ไม่สามารถเปลี่ยน role ของตัวเองได้" },
                { status: 400 }
            );
        }

        const user = await prisma.user.update({
            where: { id: params.id },
            data: { role },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
            },
        });

        return NextResponse.json(user);
    } catch (error) {
        console.error("PUT /api/users/[id] error:", error);
        return NextResponse.json(
            { message: "Internal Server Error" },
            { status: 500 }
        );
    }
}
