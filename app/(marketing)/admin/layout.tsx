import type { Metadata } from "next";
import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { getViewer, requireSession } from "@/lib/session";

export const metadata: Metadata = {
  title: "CalcForged Admin",
  robots: { index: false, follow: true },
};

export default async function AdminLayout({ children }: { children: ReactNode }) {
  await requireSession("/admin");
  const viewer = await getViewer();
  if (viewer?.kind !== "platform") notFound();
  return <>{children}</>;
}
