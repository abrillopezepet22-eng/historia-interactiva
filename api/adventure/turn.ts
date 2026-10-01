import type { IncomingMessage, ServerResponse } from 'http';
import { executeAdventureTurn } from '../../src/server/adventureLogic.ts';

interface ExtendedRequest extends IncomingMessage {
  body?: any;
  query?: Record<string, string | string[]>;
  method?: string;
}

interface ExtendedResponse extends ServerResponse {
  status: (statusCode: number) => ExtendedResponse;
  json: (data: any) => void;
}

export default async function handler(req: ExtendedRequest, res: ExtendedResponse) {
  // CORS setup
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.statusCode = 200;
    res.end();
    return;
  }

  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Método no permitido. Solo se acepta POST.' }));
    return;
  }

  try {
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch {}
    } else if (!body) {
      // In case body was not pre-parsed by Vercel
      const buffers: Buffer[] = [];
      for await (const chunk of req) {
        buffers.push(chunk);
      }
      const raw = Buffer.concat(buffers).toString();
      body = raw ? JSON.parse(raw) : {};
    }

    const { history, action, genre } = body || {};

    const result = await executeAdventureTurn({
      history,
      action,
      genre,
    });

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(result));
  } catch (error: any) {
    console.error('Error en Vercel API turn:', error);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(
      JSON.stringify({
        error: error?.message || 'Error al comunicarse con el Game Master en Vercel.',
      })
    );
  }
}
