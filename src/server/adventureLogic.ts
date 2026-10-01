import { GoogleGenAI } from '@google/genai';

export const SYSTEM_INSTRUCTION = `Eres el Game Master de una aventura interactiva de ficción basada en texto estilo "Elige tu propia aventura". Tu objetivo es narrar una historia inmersiva, adaptativa y emocionante.

### 1. CONFIGURACIÓN INICIAL
Si el usuario aún no ha seleccionado una temática, preséntale brevemente las 4 opciones disponibles en tu primer mensaje y pídele que elija una:
- Misterio
- Policial / Noir
- Ciencia Ficción
- Fantasía

### 2. ESTRUCTURA Y REGLAS DE CADA RESPUESTA
En cuanto el tema sea seleccionado (o en cada turno subsiguiente de la historia), debes responder SIEMPRE con la siguiente estructura de dos secciones:

#### Sección 1: La Narrativa
- Escribe el siguiente fragmento o capítulo de la historia (entre 100 y 200 palabras).
- Mantén un tono atmosférico, descriptivo e inmersivo ajustado al género elegido.
- Haz avanzar la trama de forma coherente según la elección previa del usuario.

#### Sección 2: Las Opciones (Formato JSON)
Al final del mensaje, incluye SIEMPRE un bloque de código JSON válido y aislado que contenga exactamente tres opciones de decisión lógica para el jugador. 

Usa estricta y únicamente esta sintaxis:

\`\`\`json
{
  "opciones": [
    "Opción 1: [Descripción corta de la acción]",
    "Opción 2: [Descripción corta de la acción]",
    "Opción 3: [Descripción corta de la acción]"
  ]
}
\`\`\`

REGLAS CRÍTICAS:
1. Jamás omitas el bloque JSON al final cuando haya comenzado la aventura.
2. Cada una de las 3 opciones debe representar una ruta estratégica distinta (por ejemplo: audaz/arriesgada, sigilosa/investigativa, o diplomática/analítica).
3. Mantén el idioma en español neutro, rico en vocabulario sensorial y descriptivo.
4. Si la aventura concluye (triunfo heroico o final trágico), indícalo en la narrativa y en las opciones ofrece alternativas para recomenzar o explorar un epílogo.`;

export interface HistoryItem {
  role: 'user' | 'model';
  content: string;
}

export function parseGameMasterResponse(fullText: string) {
  let narrative = fullText;
  let options: string[] = [];

  // Look for ```json ... ``` code block
  const jsonBlockRegex = /```(?:json)?\s*(\{[\s\S]*?\})\s*```/i;
  const match = fullText.match(jsonBlockRegex);

  if (match) {
    try {
      const parsed = JSON.parse(match[1]);
      if (Array.isArray(parsed.opciones)) {
        options = parsed.opciones.map((o: any) => String(o).trim());
      }
      narrative = fullText.replace(match[0], '').trim();
    } catch {
      // Fallback regex extraction if JSON had minor parsing anomaly
    }
  }

  // Fallback: search for bare JSON object with "opciones"
  if (options.length === 0) {
    const rawJsonRegex = /\{[\s\S]*?"opciones"\s*:\s*\[[\s\S]*?\][\s\S]*?\}/;
    const rawMatch = fullText.match(rawJsonRegex);
    if (rawMatch) {
      try {
        const parsed = JSON.parse(rawMatch[0]);
        if (Array.isArray(parsed.opciones)) {
          options = parsed.opciones.map((o: any) => String(o).trim());
        }
        narrative = fullText.replace(rawMatch[0], '').trim();
      } catch {
        // Fallback below
      }
    }
  }

  // Fallback if model listed Opción 1, Opción 2, Opción 3 in plain text
  if (options.length === 0) {
    const optionLines = fullText.match(/Opción\s*\d+:\s*[^\n]+/gi);
    if (optionLines && optionLines.length >= 2) {
      options = optionLines.slice(0, 3);
    }
  }

  // Default fallback options if none found
  if (options.length === 0) {
    options = [
      'Opción 1: Investigar con cautela el entorno inmediato',
      'Opción 2: Avanzar con determinación hacia lo desconocido',
      'Opción 3: Buscar un camino alternativo o prepararse para el peligro',
    ];
  }

  return { narrative, options };
}

export async function executeAdventureTurn(params: {
  history?: HistoryItem[];
  action?: string;
  genre?: string;
}) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('Variable GEMINI_API_KEY no configurada. Configúrala en las variables de entorno de Vercel.');
  }

  const ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });

  const conversationHistory: HistoryItem[] = Array.isArray(params.history) ? params.history : [];
  const contents: any[] = [];

  for (const item of conversationHistory) {
    contents.push({
      role: item.role,
      parts: [{ text: item.content }],
    });
  }

  let userPrompt = params.action || '';
  if (!userPrompt && params.genre) {
    userPrompt = `Elijo la temática: ${params.genre}. Por favor comienza la aventura con el primer capítulo introductorio e inmersivo.`;
  } else if (!userPrompt) {
    userPrompt = 'Hola Game Master. Preséntame las temáticas disponibles para comenzar la aventura.';
  }

  contents.push({
    role: 'user',
    parts: [{ text: userPrompt }],
  });

  const response = await ai.models.generateContent({
    model: 'gemini-3.8-flash',
    contents,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      temperature: 0.85,
      topP: 0.95,
    },
  });

  const rawText = response.text || '';
  const { narrative, options } = parseGameMasterResponse(rawText);

  return {
    rawText,
    narrative,
    options,
    userPrompt,
  };
}
