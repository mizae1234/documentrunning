import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import * as XLSX from "xlsx";

// GET /api/documents/export
export async function GET(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const search = searchParams.get("search") || "";
        const year = searchParams.get("year");

        const where: Record<string, unknown> = {};

        if (session.user.role !== "admin") {
            where.createdById = session.user.id;
        }

        if (search) {
            where.subject = { contains: search, mode: "insensitive" };
        }

        if (year && year !== "all") {
            where.year = parseInt(year);
        }

        const documents = await prisma.documentRequest.findMany({
            where,
            include: {
                createdBy: { select: { name: true } },
            },
            orderBy: { createdAt: "desc" },
        });

        // Build Excel data
        const data = documents.map((doc) => ({
            "เลขที่": doc.runningNo,
            "วันที่ขอ": new Date(doc.requestDate).toLocaleDateString("th-TH"),
            "วันที่ใช้": new Date(doc.useDate).toLocaleDateString("th-TH"),
            "เรื่อง": doc.subject,
            "สถานะ": doc.status === "active" ? "Active" : "Cancelled",
            "ผู้สร้าง": doc.createdBy.name,
            "วันที่สร้าง": new Date(doc.createdAt).toLocaleDateString("th-TH"),
        }));

        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(data);

        // Set column widths
        ws["!cols"] = [
            { wch: 15 },
            { wch: 15 },
            { wch: 15 },
            { wch: 40 },
            { wch: 12 },
            { wch: 20 },
            { wch: 15 },
        ];

        XLSX.utils.book_append_sheet(wb, ws, "Documents");

        const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

        return new NextResponse(buffer, {
            headers: {
                "Content-Type":
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                "Content-Disposition": `attachment; filename=documents-${new Date()
                    .toISOString()
                    .slice(0, 10)}.xlsx`,
            },
        });
    } catch (error) {
        console.error("GET /api/documents/export error:", error);
        return NextResponse.json(
            { message: "Internal Server Error" },
            { status: 500 }
        );
    }
}
