import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {

    const {
      mensaje,
      telefono,
      imageUrl,
    } = await request.json();

    if (!telefono || !mensaje) {
      return NextResponse.json({ error: "Faltan parámetros requeridos" }, { status: 400 });
    }


    const response = await fetch(
      `https://graph.facebook.com/v23.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(
          imageUrl
            ? {
                messaging_product: "whatsapp",
                to: telefono,
                type: "image",
                image: {
                  link: imageUrl,
                  caption: mensaje,
                },
              }
            : {
                messaging_product: "whatsapp",
                to: telefono,
                type: "text",
                text: {
                  body: mensaje,
                },
              }
        )
      }
    );

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });

  } catch (error) {

    console.error(error);

    return NextResponse.json(
      {
        error: "Error enviando mensaje",
      },
      {
        status: 500,
      }
    );
  }
}