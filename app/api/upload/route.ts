// Submission photo upload via Vercel Blob.
//
// Uses the client-upload pattern (`handleUpload`) rather than a server-side
// `put()` of the file through this route: Vercel serverless functions cap the
// request body at ~4.5MB, so streaming an 8MB image through the function would
// 413 in production. With client uploads the browser sends the file directly
// to Blob storage; this route only auth-gates and signs a short-lived token,
// so the full 8MB limit is supported reliably.

import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse, type NextRequest } from "next/server";
import { auth, isAdult } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ALLOWED_CONTENT_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE_BYTES = 8 * 1024 * 1024;

class UnauthorizedError extends Error {}

export async function POST(request: NextRequest) {
  let body: HandleUploadBody;
  try {
    body = (await request.json()) as HandleUploadBody;
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  try {
    const json = await handleUpload({
      request,
      body,
      onBeforeGenerateToken: async () => {
        const session = await auth();
        const user = session?.user;
        if (!user?.id) {
          throw new UnauthorizedError("You need to be signed in to upload.");
        }
        if (!user.username || !user.dateOfBirth) {
          throw new UnauthorizedError("Finish setting up your profile first.");
        }
        if (!isAdult(new Date(user.dateOfBirth))) {
          throw new UnauthorizedError("You are not eligible to upload.");
        }
        return {
          allowedContentTypes: ALLOWED_CONTENT_TYPES,
          maximumSizeInBytes: MAX_SIZE_BYTES,
          addRandomSuffix: true,
          tokenPayload: JSON.stringify({ userId: user.id }),
        };
      },
      // Persistence stays in the submit server action; nothing to do here.
      onUploadCompleted: async () => {},
    });
    return NextResponse.json(json);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Upload authorization failed.";
    const status = err instanceof UnauthorizedError ? 401 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
