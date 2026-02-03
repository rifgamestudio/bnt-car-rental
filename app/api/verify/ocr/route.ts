import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { image } = await req.json();
    const endpoint = process.env.AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT;
    const key = process.env.AZURE_DOCUMENT_INTELLIGENCE_KEY;

    const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(base64Data, 'base64');

    const response = await fetch(
      `${endpoint}/formrecognizer/documentModels/prebuilt-idDocument:analyze?api-version=2023-07-31`,
      {
        method: 'POST',
        headers: { 'Ocp-Apim-Subscription-Key': key!, 'Content-Type': 'application/octet-stream' },
        body: buffer,
      }
    );

    const operationLocation = response.headers.get('operation-location');
    let result = null;
    while (true) {
      const checkResponse = await fetch(operationLocation!, { headers: { 'Ocp-Apim-Subscription-Key': key! } });
      result = await checkResponse.json();
      if (result.status === 'succeeded' || result.status === 'failed') break;
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    // FIX: Verificar si Azure realmente encontró un documento antes de leer 'fields'
    if (!result.analyzeResult?.documents?.length) {
      return NextResponse.json({ error: 'no_document_found' }, { status: 422 });
    }

    const fields = result.analyzeResult.documents[0].fields;

    // AQUI ESTA LA MEJORA: Devolvemos más datos para que el Admin los tenga
    return NextResponse.json({
      fullName: (fields.FirstName?.valueString || "") + " " + (fields.LastName?.valueString || ""),
      issueDate: fields.IssueDate?.valueDate, // Para la validación de 2 años
      documentNumber: fields.DocumentNumber?.valueString, // Para copiar el CIN/Permiso
      expirationDate: fields.DateOfExpiration?.valueDate, // Útil para verificar validez
      birthDate: fields.DateOfBirth?.valueDate, // Dato extra útil
      address: fields.Address?.content // Dirección completa si aparece
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}