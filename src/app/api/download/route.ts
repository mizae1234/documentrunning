import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getSignedDownloadUrl } from "@/lib/s3";

// GET /api/download?key=documents/xxx.pdf
export async function GET(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const key = req.nextUrl.searchParams.get("key");
        if (!key) {
            return NextResponse.json(
                { message: "Missing key parameter" },
                { status: 400 }
            );
        }

        // Only allow downloading from the documentrunning/ prefix
        if (!key.startsWith("documentrunning/")) {
            return NextResponse.json(
                { message: "Invalid key" },
                { status: 400 }
            );
        }

        const signedUrl = await getSignedDownloadUrl(key);

        return NextResponse.redirect(signedUrl);
    } catch (error) {
        console.error("GET /api/download error:", error);
        return NextResponse.json(
            { message: "Internal Server Error" },
            { status: 500 }
        );
    }
}
