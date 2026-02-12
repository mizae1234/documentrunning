import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET /api/documents/stats
export async function GET() {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const where: Record<string, unknown> = {};
        if (session.user.role !== "admin") {
            where.createdById = session.user.id;
        }

        const [total, active, cancelled, thisMonth] = await Promise.all([
            prisma.documentRequest.count({ where }),
            prisma.documentRequest.count({ where: { ...where, status: "active" } }),
            prisma.documentRequest.count({
                where: { ...where, status: "cancelled" },
            }),
            prisma.documentRequest.count({
                where: {
                    ...where,
                    createdAt: {
                        gte: new Date(
                            new Date().getFullYear(),
                            new Date().getMonth(),
                            1
                        ),
                    },
                },
            }),
        ]);

        return NextResponse.json({ total, active, cancelled, thisMonth });
    } catch (error) {
        console.error("GET /api/documents/stats error:", error);
        return NextResponse.json(
            { message: "Internal Server Error" },
            { status: 500 }
        );
    }
}
