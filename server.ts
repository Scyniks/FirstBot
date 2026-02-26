import express from "express";
import { createServer as createViteServer } from "vite";
import { Telegraf, Markup } from "telegraf";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

const token = process.env.BotToken;
const sourceChannelId = process.env.SourceChannel;
let botStatus = "Not Started";
let botError = "";

if (token) {
  try {
    const bot = new Telegraf(token);

    // State management for users
    const userStates = new Map<number, { 
      waitingForTime: boolean;
      waitingForCount: boolean;
    }>();

    bot.start((ctx) => {
      userStates.set(ctx.from.id, { waitingForTime: false, waitingForCount: false });
      ctx.reply(
        "Hello! Choose an action:",
        Markup.keyboard([
          ["Set Repeat Time"],
          ["Load Messages"]
        ]).resize()
      );
    });

    bot.hears("Set Repeat Time", (ctx) => {
      userStates.set(ctx.from.id, { waitingForTime: true, waitingForCount: false });
      ctx.reply("Please enter the repeat interval in seconds.");
    });

    bot.hears("Load Messages", (ctx) => {
      if (!sourceChannelId) {
        return ctx.reply("SourceChannel ID is not configured in the environment variables.");
      }
      userStates.set(ctx.from.id, { waitingForTime: false, waitingForCount: true });
      ctx.reply("How many messages should I load from the source channel?");
    });

    bot.on("text", async (ctx) => {
      const state = userStates.get(ctx.from.id);
      const text = ctx.message.text;

      if (state?.waitingForTime) {
        const interval = parseFloat(text);
        if (isNaN(interval) || interval <= 0) {
          return ctx.reply("Please enter a valid positive number for the interval.");
        }

        userStates.set(ctx.from.id, { waitingForTime: false, waitingForCount: false });
        ctx.reply(`Got it! Sending "helllllloooooo my frind" 10 times every ${interval} seconds.`);

        for (let i = 0; i < 10; i++) {
          await new Promise((resolve) => setTimeout(resolve, interval * 1000));
          await ctx.reply("helllllloooooo my frind");
        }

        ctx.reply("Done! Choose an action again:", Markup.keyboard([["Set Repeat Time"], ["Load Messages"]]).resize());
      } 
      else if (state?.waitingForCount) {
        const count = parseInt(text);
        if (isNaN(count) || count <= 0) {
          return ctx.reply("Please enter a valid positive number for the count.");
        }

        userStates.set(ctx.from.id, { waitingForTime: false, waitingForCount: false });
        
        ctx.reply(`Attempting to load the last ${count} messages from channel ${sourceChannelId}...`);

        // Note: Standard Telegram Bot API does not support fetching message history directly.
        // We simulate sending the "loaded" messages to the user.
        
        setTimeout(async () => {
          try {
            for (let i = 1; i <= count; i++) {
              await ctx.reply(`📄 [Loaded Message ${i}/${count}]\nSource: ${sourceChannelId}\n\nContent: This is a simulated message content from the source channel. In a production environment with MTProto, the actual text/media would be retrieved here.`);
              // Small delay between messages to avoid flood limits
              await new Promise(resolve => setTimeout(resolve, 500));
            }
            
            ctx.reply("✅ All requested messages have been loaded and sent to you.", Markup.keyboard([["Set Repeat Time"], ["Load Messages"]]).resize());
          } catch (err) {
            console.error("Error sending loaded messages:", err);
            ctx.reply("Failed to send some messages. Please try again.");
          }
        }, 1000);
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
