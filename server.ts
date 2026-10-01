import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { executeAdventureTurn } from './src/server/adventureLogic.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '2mb' }));

// API endpoint for Game Master turn
app.post('/api/adventure/turn', async (req: Request, res: Response) => {
  try {
    const { history, action, genre } = req.body;
    const result = await executeAdventureTurn({
      history,
      action,
      genre,
    });
    res.json(result);
  } catch (error: any) {
    console.error('Error generating adventure turn:', error);
    res.status(500).json({
      error: error?.message || 'Error al comunicarse con el Game Master.',
    });
  }
});

// Configure Vite middleware or static serving
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, () => {
    console.log(`Game Master Adventure server running on port ${PORT}`);
  });
}

startServer();
