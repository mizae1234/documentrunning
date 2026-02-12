import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

// POST /api/documents/[id]/cancel
export async function POST(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { reason } = body;

        if (!reason?.trim()) {
            return NextResponse.json(
                { message: "กรุณากรอกเหตุผลการยกเลิก" },
                { status: 400 }
            );
        }

        // Find document
        const document = await prisma.documentRequest.findUnique({
            where: { id: params.id },
        });

        if (!document) {
            return NextResponse.json(
                { message: "ไม่พบเอกสาร" },
                { status: 404 }
            );
        }

        if (document.status === "cancelled") {
            return NextResponse.json(
                { message: "เอกสารนี้ถูกยกเลิกแล้ว" },
                { status: 400 }
            );
        }

        // Non-admin can only cancel their own
        if (
            session.user.role !== "admin" &&
            document.createdById !== session.user.id
        ) {
            return NextResponse.json(
                { message: "ไม่มีสิทธิ์ยกเลิกเอกสารนี้" },
                { status: 403 }
            );
        }

        // Cancel document - no running number recycling
        const updated = await prisma.documentRequest.update({
            where: { id: params.id },
            data: {
                status: "cancelled",
                cancelReason: reason,
                cancelledAt: new Date(),
                cancelledById: session.user.id,
            },
        });

        return NextResponse.json(updated);
    } catch (error) {
        console.error("POST /api/documents/[id]/cancel error:", error);
        return NextResponse.json(
            { message: "Internal Server Error" },
            { status: 500 }
        );
    }
}
