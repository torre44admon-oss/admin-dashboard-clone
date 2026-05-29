import { createClient } from "@supabase/supabase-js"

const supabaseUrl =
  "https://iolxqtdbumiposulzwpm.supabase.co"

const supabaseKey =
  "sb_publishable_nRwwTuwF52S5SzLNLm0KQA_TxkYJngc"

export const supabase =
  createClient(
    supabaseUrl,
    supabaseKey
  )