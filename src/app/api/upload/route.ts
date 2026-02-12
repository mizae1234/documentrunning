import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { uploadToS3 } from "@/lib/s3";

// POST /api/upload - Upload file to S3
export async function POST(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const formData = await req.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json(
                { message: "ไม่พบไฟล์" },
                { status: 400 }
            );
        }

        // Validate file type
        const allowedTypes = [
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "image/jpeg",
            "image/png",
        ];

        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json(
                { message: "ประเภทไฟล์ไม่รองรับ (รองรับ PDF, DOC, DOCX, JPG, PNG)" },
                { status: 400 }
            );
        }

        // Max 10MB
        if (file.size > 10 * 1024 * 1024) {
            return NextResponse.json(
                { message: "ขนาดไฟล์ต้องไม่เกิน 10MB" },
                { status: 400 }
            );
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Generate unique S3 key: documentrunning/YYYYMM/uuid.ext
        const ext = path.extname(file.name);
        const now = new Date();
        const yyyymm = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}`;
        const key = `documentrunning/${yyyymm}/${uuidv4()}${ext}`;

        await uploadToS3(buffer, key, file.type);

        return NextResponse.json({
            path: key,
            originalName: file.name,
        });
    } catch (error) {
        console.error("POST /api/upload error:", error);
        return NextResponse.json(
            { message: "Internal Server Error" },
            { status: 500 }
        );
    }
}
