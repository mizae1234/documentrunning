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

// PATCH /api/documents/[id] - Update document
export async function PATCH(
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
        });

        if (!document) {
            return NextResponse.json(
                { message: "ไม่พบเอกสาร" },
                { status: 404 }
            );
        }

        // Only owner or admin can edit
        if (
            session.user.role !== "admin" &&
            document.createdById !== session.user.id
        ) {
            return NextResponse.json(
                { message: "ไม่มีสิทธิ์แก้ไข" },
                { status: 403 }
            );
        }

        // Cannot edit cancelled documents
        if (document.status === "cancelled") {
            return NextResponse.json(
                { message: "ไม่สามารถแก้ไขเอกสารที่ยกเลิกแล้วได้" },
                { status: 400 }
            );
        }

        const body = await req.json();
        const { subject, requestDate, useDate, attachmentPath } = body;

        const updated = await prisma.documentRequest.update({
            where: { id: params.id },
            data: {
                ...(subject !== undefined && { subject }),
                ...(requestDate !== undefined && { requestDate: new Date(requestDate) }),
                ...(useDate !== undefined && { useDate: new Date(useDate) }),
                ...(attachmentPath !== undefined && { attachmentPath }),
            },
            include: {
                createdBy: { select: { name: true, email: true } },
                cancelledBy: { select: { name: true } },
            },
        });

        return NextResponse.json(updated);
    } catch (error) {
        console.error("PATCH /api/documents/[id] error:", error);
        return NextResponse.json(
            { message: "Internal Server Error" },
            { status: 500 }
        );
    }
}
