import { Resend } from 'resend';
import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { email, customerName, carName, locale } = await req.json();

    // Textos redactados profesionalmente para indicar "Proceso en curso"
    const translations = {
      fr: {
        subject: "Demande reçue - En cours de traitement - BNT LUXURY",
        title: "DEMANDE REÇUE",
        greeting: `Bonjour ${customerName},`,
        body1: `Nous avons bien reçu votre demande de réservation pour le véhicule <strong>${carName}</strong>.`,
        body2: `Notre équipe vérifie actuellement vos documents d'identité et la disponibilité finale du véhicule. Cette procédure prend généralement entre 10 et 30 minutes.`,
        body3: `Si tout est en ordre, vous recevrez un second e-mail avec la confirmation définitive de votre réservation. Si des informations supplémentaires sont nécessaires, nous vous contacterons.`,
        footer_msg: "Ceci est un message automatique, merci de ne pas y répondre."
      },
      en: {
        subject: "Request Received - Processing - BNT LUXURY",
        title: "REQUEST RECEIVED",
        greeting: `Hello ${customerName},`,
        body1: `We have successfully received your booking request for the <strong>${carName}</strong>.`,
        body2: `Our team is currently verifying your identity documents and final vehicle availability. This process usually takes between 10 and 30 minutes.`,
        body3: `If everything is in order, you will receive a second email with the final confirmation of your booking. If any additional information is required, we will contact you.`,
        footer_msg: "This is an automated message, please do not reply."
      },
      nl: {
        subject: "Aanvraag Ontvangen - In Behandeling - BNT LUXURY",
        title: "AANVRAAG ONTVANGEN",
        greeting: `Hallo ${customerName},`,
        body1: `Wij hebben uw boekingsaanvraag voor de <strong>${carName}</strong> in goede orde ontvangen.`,
        body2: `Ons team controleert momenteel uw identiteitsdocumenten en de definitieve beschikbaarheid van het voertuig. Dit proces duurt doorgaans 10 tot 30 minuten.`,
        body3: `Als alles in orde is, ontvangt u een tweede e-mail met de definitieve bevestiging van uw boeking. Mochten wij aanvullende informatie nodig hebben, dan nemen wij contact met u op.`,
        footer_msg: "Dit is een automatisch bericht, gelieve niet te beantwoorden."
      }
    };

    const t = translations[locale as keyof typeof translations] || translations.fr;

    // Versión Texto Plano (Anti-SPAM)
    const plainText = `${t.title}\n\n${t.greeting}\n\n${t.body1.replace(/<[^>]*>?/gm, '')}\n\n${t.body2}\n\n${t.body3}\n\n${t.footer_msg}\n\nLUXURY BONAT CARS - IF: 52649058 - ICE: 003120525000025`;

    const { data, error } = await resend.emails.send({
      from: 'BNT LUXURY RENTAL <no-reply@bnt.ma>', 
      to: [email],
      subject: t.subject,
      text: plainText,
      html: `
        <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; border-radius: 24px; overflow: hidden; background-color: #ffffff;">
          
          <!-- HEADER NEGRO CON LOGO -->
          <div style="background-color: #000000; padding: 40px; text-align: center;">
            <img src="https://orxmcsrzkvukhpjsuhft.supabase.co/storage/v1/object/public/cars/logo.png" style="height: 45px;" alt="BNT LUXURY BONAT CARS">
          </div>
          
          <!-- CUERPO DEL MENSAJE -->
          <div style="padding: 40px; text-align: center;">
            <!-- ICONO RELOJ NARANJA (Pendiente) -->
            <div style="width: 80px; height: 80px; background-color: #fff7ed; border-radius: 40px; display: inline-block; line-height: 80px; margin-bottom: 24px;">
              <span style="color: #ff5f00; font-size: 35px;">⏳</span>
            </div>
            
            <h1 style="margin: 0; font-size: 26px; font-weight: 900; color: #000000; letter-spacing: -0.02em;">${t.title}</h1>
            <p style="color: #666666; margin-top: 24px; font-size: 16px;">${t.greeting}</p>
            
            <div style="text-align: left; background-color: #f9f9f9; padding: 25px; border-radius: 16px; margin-top: 24px; border-left: 4px solid #ff5f00;">
              <p style="color: #444444; font-size: 15px; line-height: 1.6; margin-top: 0;">${t.body1}</p>
              <p style="color: #444444; font-size: 15px; line-height: 1.6;">${t.body2}</p>
              <p style="color: #444444; font-size: 15px; line-height: 1.6; margin-bottom: 0;">${t.body3}</p>
            </div>
          </div>

          <!-- FOOTER LEGAL DE LA EMPRESA -->
          <div style="background-color: #f0f0f0; padding: 30px 40px; text-align: center; font-size: 11px; color: #777777; line-height: 1.8;">
            <p style="margin: 0 0 10px 0; font-weight: bold; color: #555;">${t.footer_msg}</p>
            <p style="margin: 0;"><strong>Raison Sociale :</strong> LUXURY BONAT CARS</p>
            <p style="margin: 0;"><strong>Identifiant fiscal :</strong> 52649058 | <strong>Taxe professionnelle :</strong> 25561617</p>
            <p style="margin: 0;"><strong>ICE :</strong> 003120525000025</p>
            <p style="margin: 0;"><strong>Adresse siège social :</strong> 2 RUE ANNABIA SECT 11, RABAT, MAROC</p>
          </div>

        </div>
      `
    });

    if (error) {
      console.error("ERROR RESEND:", error);
      return NextResponse.json({ error }, { status: 400 });
    }
    
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("ERROR SERVER:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}