import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
    console.log("🌱 Seeding database...");

    // Create users
    const adminPassword = await hash("admin123", 12);
    const userPassword = await hash("user123", 12);

    const admin = await prisma.user.upsert({
        where: { email: "admin@example.com" },
        update: {},
        create: {
            name: "Admin User",
            email: "admin@example.com",
            password: adminPassword,
            role: "admin",
        },
    });

    const user = await prisma.user.upsert({
        where: { email: "user@example.com" },
        update: {},
        create: {
            name: "สมชาย ใจดี",
            email: "user@example.com",
            password: userPassword,
            role: "user",
        },
    });

    console.log("✅ Users created:", { admin: admin.email, user: user.email });

    // Create document counter for current Buddhist year
    const currentYear = new Date().getFullYear() + 543;

    await prisma.documentCounter.upsert({
        where: { year: currentYear },
        update: { currentSeq: 3 },
        create: { year: currentYear, currentSeq: 3 },
    });

    console.log(`✅ Document counter for year ${currentYear} set to 3`);

    // Create sample documents
    const sampleDocs = [
        {
            runningNo: `0001/${currentYear}`,
            runningSeq: 1,
            year: currentYear,
            requestDate: new Date("2026-01-10"),
            useDate: new Date("2026-01-15"),
            subject: "ขออนุญาตใช้ห้องประชุมใหญ่",
            status: "active",
            createdById: user.id,
        },
        {
            runningNo: `0002/${currentYear}`,
            runningSeq: 2,
            year: currentYear,
            requestDate: new Date("2026-01-20"),
            useDate: new Date("2026-01-25"),
            subject: "ขอเบิกอุปกรณ์สำนักงาน",
            status: "cancelled",
            cancelReason: "เปลี่ยนแปลงรายการ",
            cancelledAt: new Date("2026-01-22"),
            cancelledById: admin.id,
            createdById: user.id,
        },
        {
            runningNo: `0003/${currentYear}`,
            runningSeq: 3,
            year: currentYear,
            requestDate: new Date("2026-02-01"),
            useDate: new Date("2026-02-10"),
            subject: "ขอจัดทำสำเนาเอกสารประกอบการประชุม",
            status: "active",
            createdById: admin.id,
        },
    ];

    for (const doc of sampleDocs) {
        await prisma.documentRequest.upsert({
            where: { runningNo: doc.runningNo },
            update: {},
            create: doc,
        });
    }

    console.log("✅ Sample documents created:", sampleDocs.length);
    console.log("🎉 Seeding complete!");
}

main()
    .catch((e) => {
        console.error("❌ Seed error:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
