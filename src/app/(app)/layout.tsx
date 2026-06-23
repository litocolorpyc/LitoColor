import { redirect } from "next/navigation";
import { getSesion } from "@/lib/auth/sesion";
import { NavBar } from "@/components/NavBar";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const sesion = await getSesion();
  if (!sesion) {
    redirect("/login");
  }

  return (
    <>
      <NavBar />
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-6">{children}</main>
    </>
  );
}
