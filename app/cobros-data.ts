import { supabase } from "@/lib/supabase";

export async function obtenerCobros() {
  const { data, error } = await supabase
    .from("propietario")
    .select("*");

  if (error) {
    console.error(error);
    return [];
  }

  return data;
}