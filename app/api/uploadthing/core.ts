import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { auth, isAdult } from "@/lib/auth";

const f = createUploadthing();

// Single endpoint for action submission photos. The middleware blocks the
// upload server-side unless the requester is a signed-in adult with a
// completed profile (username + dateOfBirth set).
//
// Every log line is prefixed with [uploadthing] so it can be filtered in
// Vercel's function logs. We never log tokens or the full session object.
export const ourFileRouter = {
  submissionPhoto: f({
    image: { maxFileSize: "8MB", maxFileCount: 1 },
  })
    .middleware(async () => {
      console.log("[uploadthing] middleware start");

      let session;
      try {
        session = await auth();
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        console.error(`[uploadthing] middleware REJECTED: auth() threw: ${message}`);
        throw new UploadThingError("Auth check failed");
      }

      const user = session?.user;
      console.log(
        `[uploadthing] auth result: session=${session ? "present" : "null"} userId=${
          user?.id ?? "none"
        } hasUsername=${Boolean(user?.username)} hasDob=${Boolean(user?.dateOfBirth)}`,
      );

      if (!user?.id) {
        console.error(
          "[uploadthing] middleware REJECTED: no signed-in user (session/userId missing)",
        );
        throw new UploadThingError("Not signed in");
      }
      if (!user.username) {
        console.error(
          `[uploadthing] middleware REJECTED: profile incomplete — username missing for userId=${user.id}`,
        );
        throw new UploadThingError("Profile incomplete");
      }
      if (!user.dateOfBirth) {
        console.error(
          `[uploadthing] middleware REJECTED: profile incomplete — dateOfBirth missing for userId=${user.id}`,
        );
        throw new UploadThingError("Profile incomplete");
      }
      if (!isAdult(new Date(user.dateOfBirth))) {
        console.error(`[uploadthing] middleware REJECTED: user not 18+ (userId=${user.id})`);
        throw new UploadThingError("Not eligible");
      }

      console.log(`[uploadthing] middleware passed for userId=${user.id}`);
      return { userId: user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      try {
        console.log(
          `[uploadthing] onUploadComplete: userId=${metadata.userId} key=${file.key} url=${file.ufsUrl}`,
        );
        return { uploadedBy: metadata.userId, url: file.ufsUrl };
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        console.error(`[uploadthing] onUploadComplete error: ${message}`);
        throw err;
      }
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
