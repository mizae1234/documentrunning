import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3Client = new S3Client({
    endpoint: process.env.S3_ENDPOINT!,
    region: process.env.S3_REGION || "sgp1",
    credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY_ID!,
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
    },
    forcePathStyle: false,
});

const BUCKET = process.env.S3_BUCKET!;

/**
 * Upload a file buffer to S3
 * @returns The S3 key (path) of the uploaded file
 */
export async function uploadToS3(
    buffer: Buffer,
    key: string,
    contentType: string,
): Promise<string> {
    await s3Client.send(
        new PutObjectCommand({
            Bucket: BUCKET,
            Key: key,
            Body: buffer,
            ContentType: contentType,
            ACL: "private",
        }),
    );
    return key;
}

/**
 * Generate a pre-signed download URL for an S3 object
 * @param key - The S3 key of the object
 * @param expiresIn - URL expiry in seconds (default 15 min)
 */
export async function getSignedDownloadUrl(
    key: string,
    expiresIn = 900,
): Promise<string> {
    const command = new GetObjectCommand({
        Bucket: BUCKET,
        Key: key,
    });
    return getSignedUrl(s3Client, command, { expiresIn });
}
