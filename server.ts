import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

let aiClient: GoogleGenAI | null = null;

function getGeminiClient() {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is required. Please set it in Settings > Secrets.");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware for body parsing
  app.use(express.json({ limit: '10mb' }));

  // API Health Check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // AI Log & Activity Analysis Endpoint
  app.post("/api/ai/analyze", async (req, res) => {
    try {
      const { prompt, context } = req.body;
      if (!prompt) {
        res.status(400).json({ error: "Prompt is required" });
        return;
      }

      // Format current data context for Gemini
      const dataContext = `
SYSTEM STATE AND ENTITY DIRECTORIES:
1. Current Logged In Admin: ${JSON.stringify(context.currentAdmin || "Unknown")}
2. Current Selected Company: ${JSON.stringify(context.currentCompany || "Unknown")}
3. Core Audit Logs (Console Activities):
${JSON.stringify(context.auditLogs || [], null, 2)}
4. Active Vendors:
${JSON.stringify(context.vendors || [], null, 2)}
5. Finance Records:
${JSON.stringify(context.financeRecords || [], null, 2)}
6. Activation Requests:
${JSON.stringify(context.activationRequests || [], null, 2)}
7. RPN Agents (Routing Nodes):
${JSON.stringify(context.rpnAgents || [], null, 2)}
8. System Configuration:
${JSON.stringify(context.systemConfig || {}, null, 2)}
`;

      const ai = getGeminiClient();
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `You are the iTred AI Systems Analyst, an expert auditor and business advisor for the seiGEN Commerce ecosystem.
Your job is to analyze the console activities (audit logs), staff roles/actions, vendors, finance records, and system health metrics provided in the context, and answer the user's specific request.

Always base your analysis strictly on the REAL data provided. Be professional, detailed, and highly constructive.
Use beautiful, clean Markdown for your response, including bullet points, subheadings, and bold indicators to highlight key risk areas, anomalies, or performance spikes.

${dataContext}

USER REQUEST / PROMPT:
"${prompt}"

Please generate a comprehensive, highly insightful response. If the user asks for general analysis, provide:
1. **Executive Summary** (overall state of the ecosystem)
2. **Staff Activity & Performance Analysis** (clearance audit, load distribution, bottlenecks)
3. **Vendor Health & Onboarding Funnel** (suspensions, verifications, node allocations)
4. **Financial and Operational Integrity** (revenue trends, debit risks, anomalies)
5. **Concrete Actionable Recommendations**`,
      });

      res.json({ text: response.text });
    } catch (error: any) {
      console.error("AI analysis failed:", error);
      res.status(500).json({ 
        error: error.message || "An error occurred during Gemini AI analysis",
        missingApiKey: !process.env.GEMINI_API_KEY 
      });
    }
  });

  // Vite middleware for development or static file serving for production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    // Serve index.html for any fallback path in production (Express v4)
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
  });
}

startServer();
