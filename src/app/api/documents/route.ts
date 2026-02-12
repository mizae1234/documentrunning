import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET /api/documents - List documents
export async function GET(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const search = searchParams.get("search") || "";
        const year = searchParams.get("year");
        const dateFrom = searchParams.get("dateFrom");
        const dateTo = searchParams.get("dateTo");
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "20");
        const skip = (page - 1) * limit;

        const where: Record<string, unknown> = {};

        // Non-admin users can only see their own documents
        if (session.user.role !== "admin") {
            where.createdById = session.user.id;
        }

        // Search filter (search across subject and runningNo)
        if (search) {
            where.OR = [
                { subject: { contains: search, mode: "insensitive" } },
                { runningNo: { contains: search, mode: "insensitive" } },
            ];
        }

        // Year filter
        if (year && year !== "all") {
            where.year = parseInt(year);
        }

        // Date range filter
        if (dateFrom || dateTo) {
            const dateFilter: Record<string, Date> = {};
            if (dateFrom) dateFilter.gte = new Date(dateFrom);
            if (dateTo) {
                const to = new Date(dateTo);
                to.setHours(23, 59, 59, 999);
                dateFilter.lte = to;
            }
            where.requestDate = dateFilter;
        }

        const [documents, total] = await Promise.all([
            prisma.documentRequest.findMany({
                where,
                include: {
                    createdBy: {
                        select: { name: true },
                    },
                },
                orderBy: { createdAt: "desc" },
                skip,
                take: limit,
            }),
            prisma.documentRequest.count({ where }),
        ]);

        return NextResponse.json({
            data: documents,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error("GET /api/documents error:", error);
        return NextResponse.json(
            { message: "Internal Server Error" },
            { status: 500 }
        );
    }
}

// POST /api/documents - Create a new document with running number
export async function POST(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { requestDate, useDate, subject, attachmentPath } = body;

        if (!requestDate || !useDate || !subject) {
            return NextResponse.json(
                { message: "กรุณากรอกข้อมูลให้ครบถ้วน" },
                { status: 400 }
            );
        }

        // Get current Buddhist year
        const now = new Date();
        const buddhistYear = now.getFullYear() + 543;

        // Transaction-safe running number generation
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const result = await prisma.$transaction(async (tx: any) => {
            // Upsert counter for current year
            const counter = await tx.documentCounter.upsert({
                where: { year: buddhistYear },
                update: { currentSeq: { increment: 1 } },
                create: { year: buddhistYear, currentSeq: 1 },
            });

            const seq = counter.currentSeq;
            const runningNo = `${seq.toString().padStart(4, "0")}/${buddhistYear}`;

            // Create document
            const document = await tx.documentRequest.create({
                data: {
                    runningNo,
                    runningSeq: seq,
                    year: buddhistYear,
                    requestDate: new Date(requestDate),
                    useDate: new Date(useDate),
                    subject,
                    attachmentPath,
                    status: "active",
                    createdById: session.user!.id,
                },
                include: {
                    createdBy: {
                        select: { name: true },
                    },
                },
            });

            return document;
        });

        return NextResponse.json(result, { status: 201 });
    } catch (error) {
        console.error("POST /api/documents error:", error);
        return NextResponse.json(
            { message: "Internal Server Error" },
            { status: 500 }
        );
    }
}
