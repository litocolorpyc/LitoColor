import { redirect } from "next/navigation";
import { getSesion } from "@/lib/auth/sesion";

export default async function Home() {
  const sesion = await getSesion();
  redirect(sesion ? "/registro" : "/login");
}
