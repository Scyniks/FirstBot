import { useState, useEffect } from 'react';
import { Bot, Send, AlertCircle, CheckCircle2, Loader2, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [status, setStatus] = useState<{ status: string; error: string }>({ status: 'Loading...', error: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch('/api/status');
        const data = await res.json();
        setStatus(data);
      } catch (err) {
        setStatus({ status: 'Error', error: 'Failed to connect to backend' });
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#F5F5F0] text-[#141414] font-sans selection:bg-[#5A5A40] selection:text-white">
      <header className="border-b border-[#141414]/10 p-6 flex justify-between items-center bg-white/50 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#5A5A40] rounded-full flex items-center justify-center text-white">
            <Bot size={24} />
          </div>
          <h1 className="text-xl font-semibold tracking-tight italic serif">Telegram Echo Bot</h1>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-[#141414]/10 shadow-sm">
          <div className={`w-2 h-2 rounded-full ${status.status === 'Running' ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
          <span className="text-sm font-medium uppercase tracking-wider opacity-70">{status.status}</span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-8 space-y-12">
        <section className="space-y-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl p-8 shadow-sm border border-[#141414]/5 space-y-6"
          >
            <h2 className="text-3xl font-light tracking-tight italic serif">Bot Configuration</h2>
            
            {status.status === 'Missing Token' ? (
              <div className="p-6 bg-amber-50 border border-amber-200 rounded-2xl flex gap-4 items-start">
                <AlertCircle className="text-amber-600 shrink-0 mt-1" />
                <div className="space-y-2">
                  <p className="font-medium text-amber-900">Telegram Token Missing</p>
                  <p className="text-amber-800/80 text-sm leading-relaxed">
                    To start the bot, you need to provide a Telegram Bot Token. 
                    Go to the <strong>Secrets</strong> panel in AI Studio and add a variable named 
                    <code className="bg-amber-100 px-1.5 py-0.5 rounded font-mono text-xs mx-1">TELEGRAM_BOT_TOKEN</code> 
                    with your token from <a href="https://t.me/BotFather" target="_blank" className="underline font-semibold">@BotFather</a>.
                  </p>
                </div>
              </div>
            ) : status.status === 'Error' ? (
              <div className="p-6 bg-red-50 border border-red-200 rounded-2xl flex gap-4 items-start">
                <AlertCircle className="text-red-600 shrink-0 mt-1" />
                <div className="space-y-2">
                  <p className="font-medium text-red-900">Initialization Error</p>
                  <p className="text-red-800/80 text-sm font-mono text-xs break-all">{status.error}</p>
                </div>
              </div>
            ) : (
              <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl flex gap-4 items-start">
                <CheckCircle2 className="text-emerald-600 shrink-0 mt-1" />
                <div className="space-y-2">
                  <p className="font-medium text-emerald-900">Bot is Online</p>
                  <p className="text-emerald-800/80 text-sm leading-relaxed">
                    Your bot is connected and ready to receive commands. Open Telegram and search for your bot to start interacting.
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-3xl p-8 shadow-sm border border-[#141414]/5 space-y-4"
          >
            <div className="w-12 h-12 bg-[#F5F5F0] rounded-2xl flex items-center justify-center text-[#5A5A40]">
              <Send size={24} />
            </div>
            <h3 className="text-xl font-medium italic serif">How it works</h3>
            <ul className="space-y-3 text-sm text-[#141414]/70 leading-relaxed">
              <li className="flex gap-3">
                <span className="font-mono text-[#5A5A40] font-bold">01.</span>
                <span>Send <code className="bg-[#F5F5F0] px-1 rounded">/start</code> to the bot on Telegram.</span>
              </li>
              <li className="flex gap-3">
                <span className="font-mono text-[#5A5A40] font-bold">02.</span>
                <span>The bot will ask for a repeat interval (in seconds).</span>
              </li>
              <li className="flex gap-3">
                <span className="font-mono text-[#5A5A40] font-bold">03.</span>
                <span>Enter a number (e.g., "2").</span>
              </li>
              <li className="flex gap-3">
                <span className="font-mono text-[#5A5A40] font-bold">04.</span>
                <span>The bot sends "helllllloooooo my frind" 10 times at that rate.</span>
              </li>
            </ul>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-[#141414] text-white rounded-3xl p-8 shadow-xl space-y-6 relative overflow-hidden"
          >
            <div className="relative z-10 space-y-4">
              <h3 className="text-xl font-medium italic serif">Quick Links</h3>
              <div className="space-y-3">
                <a 
                  href="https://t.me/BotFather" 
                  target="_blank" 
                  className="flex items-center justify-between p-4 bg-white/10 rounded-2xl hover:bg-white/20 transition-colors group"
                >
                  <span className="text-sm font-medium">Get a Token from BotFather</span>
                  <ExternalLink size={16} className="opacity-50 group-hover:opacity-100 transition-opacity" />
                </a>
                <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                  <p className="text-xs uppercase tracking-widest opacity-50 mb-2">Current Status</p>
                  <div className="flex items-center gap-2">
                    {loading ? (
                      <Loader2 size={16} className="animate-spin opacity-50" />
                    ) : (
                      <span className="text-lg font-mono tracking-tight">{status.status}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
            {/* Decorative element */}
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-[#5A5A40] rounded-full blur-3xl opacity-20" />
          </motion.div>
        </section>
      </main>

      <footer className="max-w-4xl mx-auto p-8 text-center text-[#141414]/40 text-xs uppercase tracking-widest">
        Built with Telegraf & Express • {new Date().getFullYear()}
      </footer>
    </div>
  );
}
