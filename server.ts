import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
export { app };
async function startServer() {
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Share Extension API (Scaffold)
  app.post("/api/stash", async (req, res) => {
    const { url, text, imageUrl, apiKey } = req.body;
    
    // In a real production app, we would verify the API key against the user's document
    // and then trigger the Gemini processing via a background job.
    
    if (!url && !text && !imageUrl) {
       return res.status(400).json({ error: "Missing content" });
    }

    res.json({ 
      success: true, 
      message: "Stashed successfully. Our AI is categorizing it now.",
      id: "pending_" + Date.now() 
    });
  });


  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  if (process.env.NODE_ENV !== "production" && process.env.VERCEL !== "1") {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  }
}

startServer();
