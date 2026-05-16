import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { auth, isAdult } from "@/lib/auth";

const f = createUploadthing();

// Single endpoint for action submission photos. The middleware blocks the
// upload server-side unless the requester is a signed-in adult with a
// completed profile (username + dateOfBirth set).
export const ourFileRouter = {
  submissionPhoto: f({
    image: { maxFileSize: "8MB", maxFileCount: 1 },
  })
    .middleware(async () => {
      const session = await auth();
      const user = session?.user;
      if (!user?.id) {
        throw new UploadThingError("Not signed in");
      }
      if (!user.username || !user.dateOfBirth) {
        throw new UploadThingError("Profile incomplete");
      }
      if (!isAdult(new Date(user.dateOfBirth))) {
        throw new UploadThingError("Not eligible");
      }
      return { userId: user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      return { uploadedBy: metadata.userId, url: file.ufsUrl };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
