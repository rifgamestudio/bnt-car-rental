import { Resend } from 'resend';
import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { email, customerName, carName, plate, time, locale } = await req.json();

    const translations = {
      fr: {
        subject: "Réservation Confirmée - BNT - LUXURY BONAT CARS",
        title: "RÉSERVATION CONFIRMÉE",
        greeting: `Bonjour ${customerName},`,
        body: `Nous sommes ravis de vous informer que votre réservation a été acceptée. Votre véhicule de luxe est prêt.`,
        car_label: "Véhicule assigné",
        plate_label: "Immatriculation",
        time_label: "Heure de récupération",
        footer: "Ceci est un message automatique, merci de ne pas y répondre. BNT LUXURY BONAT CARS."
      },
      en: {
        subject: "Booking Confirmed - BNT - LUXURY BONAT CARS",
        title: "BOOKING CONFIRMED",
        greeting: `Hello ${customerName},`,
        body: `We are pleased to inform you that your booking has been accepted. Your luxury vehicle is ready.`,
        car_label: "Assigned Vehicle",
        plate_label: "License Plate",
        time_label: "Pickup Time",
        footer: "This is an automated message, please do not reply. BNT LUXURY BONAT CARS."
      },
      nl: {
        subject: "Boeking Bevestigd - BNT - LUXURY BONAT CARS",
        title: "BOEKING BEVESTIGD",
        greeting: `Hallo ${customerName},`,
        body: `Het verheugt ons u te kunnen informeren dat uw boeking is geaccepteerd. Uw luxe voertuig staat klaar.`,
        car_label: "Toegewezen voertuig",
        plate_label: "Kenteken",
        time_label: "Ophaaltijd",
        footer: "Dit is een automatisch bericht, gelieve niet te beantwoorden. BNT LUXURY BONAT CARS."
      }
    };

    const t = translations[locale as keyof typeof translations] || translations.fr;

    // VERSIÓN DE TEXTO PLANO (Anti-Spam)
    const plainText = `${t.title}\n\n${t.greeting}\n\n${t.body}\n\n${t.car_label}: ${carName}\n${t.plate_label}: ${plate}\n${t.time_label}: ${time}\n\n${t.footer}`;

    const { data, error } = await resend.emails.send({
      from: 'BNT LUXURY RENTAL <no-reply@bnt.ma>', 
      to: [email],
      subject: t.subject,
      text: plainText, // <--- AÑADIDO ESTO PARA EVITAR SPAM
      headers: {
        "List-Unsubscribe": "<mailto:unsubscribe@bnt.ma>", // Cabecera de confianza
      },
      html: `
        <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; border-radius: 24px; overflow: hidden; background-color: #ffffff;">
          <div style="background-color: #000000; padding: 40px; text-align: center;">
            <img src="https://orxmcsrzkvukhpjsuhft.supabase.co/storage/v1/object/public/cars/logo.png" style="height: 45px;" alt="BNT">
          </div>
          <div style="padding: 40px; text-align: center;">
            <div style="width: 80px; height: 80px; background-color: #dcfce7; border-radius: 40px; display: inline-block; line-height: 80px; margin-bottom: 24px;">
              <span style="color: #16a34a; font-size: 35px;">✔</span>
            </div>
            <h1 style="margin: 0; font-size: 26px; font-weight: 900; color: #000000;">${t.title}</h1>
            <p style="color: #666666; margin-top: 24px; font-size: 16px;">${t.greeting}</p>
            <p style="color: #666666; font-size: 16px; line-height: 1.5;">${t.body}</p>
            <div style="background-color: #f8f8f8; border-radius: 20px; padding: 25px; margin-top: 32px; text-align: left; border: 1px solid #f0f0f0;">
              <p style="margin: 0 0 8px 0; font-size: 10px; color: #aaaaaa; font-weight: 800; text-transform: uppercase;">${t.car_label}</p>
              <p style="margin: 0 0 20px 0; font-size: 18px; font-weight: 900; color: #000000;">${carName}</p>
              <table style="width: 100%;">
                <tr>
                  <td><p style="margin: 0; font-size: 10px; color: #aaaaaa; font-weight: 800; text-transform: uppercase;">${t.plate_label}</p><p style="margin: 4px 0 0 0; font-weight: 800; color: #ff5f00;">${plate}</p></td>
                  <td><p style="margin: 0; font-size: 10px; color: #aaaaaa; font-weight: 800; text-transform: uppercase;">${t.time_label}</p><p style="margin: 4px 0 0 0; font-weight: 800;">${time}</p></td>
                </tr>
              </table>
            </div>
            <hr style="margin-top: 40px; border: 0; border-top: 1px solid #eee;" />
            <p style="margin-top: 20px; font-size: 11px; color: #999999;">${t.footer}</p>
          </div>
        </div>
      `
    });

    if (error) return NextResponse.json({ error }, { status: 400 });
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}