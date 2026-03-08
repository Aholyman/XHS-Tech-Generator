import express from "express";
import { createServer as createViteServer } from "vite";
import { generatePostData, generateCardImage } from "./src/services/gemini";
import "dotenv/config";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API routes FIRST
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // OpenAPI Schema for OpenClaw / Dify / FastGPT etc.
  app.get("/openapi.json", (req, res) => {
    const serverUrl = process.env.APP_URL || `https://${req.get('host')}`;
    res.json({
      openapi: "3.1.0",
      info: {
        title: "XHS Tech Post Generator API",
        description: "An AI tool to generate Xiaohongshu (Little Red Book) style tech posts with photorealistic images and premium typography.",
        version: "1.0.0"
      },
      servers: [
        { url: serverUrl }
      ],
      paths: {
        "/api/generate-xhs-post": {
          post: {
            summary: "Generate a Xiaohongshu tech post",
            operationId: "generateXhsPost",
            description: "Generates a highly engaging tech post with title, content, and image URLs based on a given topic.",
            requestBody: {
              required: true,
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      topic: { 
                        type: "string", 
                        description: "The tech topic to write about (e.g., 'Apple Vision Pro review', 'AI coding tools')" 
                      }
                    },
                    required: ["topic"]
                  }
                }
              }
            },
            responses: {
              "200": {
                description: "Successful response",
                content: {
                  "application/json": {
                    schema: {
                      type: "object",
                      properties: {
                        postTitle: { type: "string", description: "The title of the post" },
                        postContent: { type: "string", description: "The main content of the post" },
                        cards: { 
                          type: "array", 
                          items: { 
                            type: "object",
                            properties: {
                              title: { type: "string" },
                              content: { type: "string" },
                              layout: { type: "string" },
                              imageUrl: { type: "string", description: "URL of the generated image, if applicable" }
                            }
                          } 
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });
  });

  // The actual tool endpoint that OpenClaw will call
  app.post("/api/generate-xhs-post", async (req, res) => {
    try {
      const { topic } = req.body;
      if (!topic) {
        return res.status(400).json({ error: "Topic is required" });
      }
      
      console.log(`[API] Generating post for topic: ${topic}`);
      
      // Use the built-in Gemini provider for the API to ensure it works standalone
      // (OpenClaw is the brain, this tool is just the executor)
      const data = await generatePostData(topic, { provider: 'gemini' });
      
      // Generate images for the cards
      const cardsWithImages = await Promise.all(
        data.cards.map(async (card) => {
          if (card.imagePrompt) {
            try {
              const imageUrl = await generateCardImage(card.imagePrompt);
              return { ...card, imageUrl };
            } catch (e) {
              console.error("Failed to generate image", e);
              return card;
            }
          }
          return card;
        })
      );

      res.json({ ...data, cards: cardsWithImages });
    } catch (error: any) {
      console.error("API Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static("dist"));
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
