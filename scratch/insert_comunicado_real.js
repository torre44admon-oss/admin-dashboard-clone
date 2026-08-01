process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://iolxqtdbumiposulzwpm.supabase.co'
const supabaseKey = 'sb_publishable_nRwwTuwF52S5SzLNLm0KQA_TxkYJngc'
const supabase = createClient(supabaseUrl, supabaseKey)

async function insertComunicadoReal() {
  console.log("=== REGISTRANDO COMUNICADO ANTERIOR DE RECOMENDACIÓN EN SUPABASE ===")

  const mensajeTexto = `Muy buenos días a todos.

Quiero hacerles una recomendación. Cualquier situación o novedad que ocurra en la torre, por favor compártanla por este grupo e infórmenme también directamente. La idea es que podamos conocer lo que está pasando y buscar una solución lo más pronto posible.

En este caso, durante algunos días la torre quedó sin cámaras de vigilancia porque el apartamento 404 las tenía desactivadas. Debido a mis compromisos laborales no me fue posible trasladarlas de inmediato a su nueva ubicación, pero tan pronto tuve la oportunidad realicé el cambio para restablecer el sistema.

También quiero recordarles que en nuestra torre no debería perderse nada. Aunque cada uno viva en un apartamento diferente, hacemos parte de una misma comunidad y debemos cuidarnos entre todos. Podemos vernos como una gran familia que comparte un mismo hogar, donde el respeto, la honestidad y la solidaridad son fundamentales.

La comunicación es la base de una buena convivencia. Si observan alguna situación inusual, un daño o cualquier inconveniente, por favor infórmenlo de inmediato para poder actuar a tiempo y encontrar la mejor solución.

Muchas gracias por su colaboración y por el compromiso de cada uno con la seguridad y el bienestar de nuestra torre.`

  const { data, error } = await supabase.from("comunicados").insert([
    {
      mensaje: mensajeTexto,
      enviado_en: '2026-08-01T10:17:00.000Z'
    }
  ]).select()

  if (error) {
    console.error("Error al insertar:", error)
  } else {
    console.log("✅ Comunicado guardado en Supabase exitosamente:", data)
  }
}

insertComunicadoReal()
