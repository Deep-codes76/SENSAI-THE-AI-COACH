import { currentUser } from "@clerk/nextjs/server";

import { getResume } from "@/actions/resume";
import { DEMO_MODE, demoUser } from "@/lib/demo";

import ResumeBuilder from "./_components/resume-builder";

export const metadata = { title: "Resume Builder" };

export default async function ResumePage() {
  const resume = await getResume();

  /*
   * The name is resolved on the server. The client component used to read
   * `user.fullName` from Clerk's `useUser()`, which is null on first render
   * and threw while building the contact header.
   */
  const user = DEMO_MODE ? demoUser : await currentUser();
  const userName = DEMO_MODE
    ? demoUser.name
    : [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
      user?.username ||
      "Your Name";

  return (
    <ResumeBuilder
      initialContent={resume?.content}
      initialAtsScore={resume?.atsScore ?? undefined}
      userName={userName}
    />
  );
}
