import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET /api/documents/[id]
export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const document = await prisma.documentRequest.findUnique({
            where: { id: params.id },
            include: {
                createdBy: {
                    select: { name: true, email: true },
                },
                cancelledBy: {
                    select: { name: true },
                },
            },
        });

        if (!document) {
            return NextResponse.json(
                { message: "ไม่พบเอกสาร" },
                { status: 404 }
            );
        }

        // Non-admin can only view their own
        if (
            session.user.role !== "admin" &&
            document.createdById !== session.user.id
        ) {
            return NextResponse.json(
                { message: "ไม่มีสิทธิ์เข้าถึง" },
                { status: 403 }
            );
        }

        return NextResponse.json(document);
    } catch (error) {
        console.error("GET /api/documents/[id] error:", error);
        return NextResponse.json(
            { message: "Internal Server Error" },
            { status: 500 }
        );
    }
}
