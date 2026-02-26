import express from "express";
import { createServer as createViteServer } from "vite";
import { Telegraf } from "telegraf";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

const token = process.env.BotToken;
let botStatus = "Not Started";
let botError = "";

if (token) {
  try {
    const bot = new Telegraf(token);

    // State management for users
    const userStates = new Map<number, { waitingForTime: boolean }>();

    bot.start((ctx) => {
      userStates.set(ctx.from.id, { waitingForTime: true });
      ctx.reply("Hello! Please enter the repeat interval in seconds.");
    });

    bot.on("text", async (ctx) => {
      const state = userStates.get(ctx.from.id);
      if (state?.waitingForTime) {
        const interval = parseFloat(ctx.message.text);
        if (isNaN(interval) || interval <= 0) {
          return ctx.reply("Please enter a valid positive number for the interval.");
        }

        userStates.set(ctx.from.id, { waitingForTime: false });
        ctx.reply(`Got it! Sending "helllllloooooo my frind" 10 times every ${interval} seconds.`);

        for (let i = 0; i < 10; i++) {
          await new Promise((resolve) => setTimeout(resolve, interval * 1000));
          await ctx.reply("helllllloooooo my frind");
        }

        ctx.reply("Done! You can enter a new repeat time to start again.");
        userStates.set(ctx.from.id, { waitingForTime: true });
      }
    });

    bot.launch().then(() => {
      console.log("Telegram bot launched");
      botStatus = "Running";
    }).catch((err) => {
      console.error("Failed to launch bot:", err);
      botStatus = "Error";
      botError = err.message;
    });

    // Enable graceful stop
    process.once('SIGINT', () => bot.stop('SIGINT'));
    process.once('SIGTERM', () => bot.stop('SIGTERM'));
  } catch (err: any) {
    console.error("Bot initialization error:", err);
    botStatus = "Error";
    botError = err.message;
  }
} else {
  botStatus = "Missing Token";
}

app.get("/api/status", (req, res) => {
  res.json({ status: botStatus, error: botError });
});

async function startServer() {
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
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
