import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMessageSquare, FiX, FiSend } from 'react-icons/fi';
import { getSocket } from '../../services/socket';
import { useAuth } from '../../hooks/useAuth';

const ROOM_ID = 'support';

export default function ChatWidget() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, from: { name: 'Support', id: 'support' }, text: 'Hi! How can we help with your travel plans today?', timestamp: new Date().toISOString() },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef(null);
  const typingTimer = useRef(null);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    socket.emit('chat:join', ROOM_ID);

    socket.on('chat:message', (msg) => {
      setMessages((prev) => [...prev, { ...msg, id: Date.now() }]);
    });
    socket.on('chat:typing', ({ isTyping: t, name }) => {
      if (name !== user?.name) setIsTyping(t);
    });

    return () => { socket.off('chat:message'); socket.off('chat:typing'); };
  }, [user]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

  const sendMessage = () => {
    if (!input.trim()) return;
    const socket = getSocket();
    if (socket) socket.emit('chat:message', { roomId: ROOM_ID, text: input.trim() });
    setInput('');
  };

  const handleTyping = (e) => {
    setInput(e.target.value);
    const socket = getSocket();
    if (!socket) return;
    socket.emit('chat:typing', { roomId: ROOM_ID, isTyping: true });
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => {
      socket.emit('chat:typing', { roomId: ROOM_ID, isTyping: false });
    }, 1000);
  };

  return (
    <div className="fixed bottom-6 right-6 z-[150]">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.95 }}
            className="mb-3 w-80 bg-white dark:bg-gray-900 border border-paper-2 dark:border-white/10 shadow-2xl flex flex-col"
            style={{ height: 400 }}
          >
            <div className="bg-ink px-4 py-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white">Live Support</p>
                <p className="text-xs text-white/40">We typically reply in minutes</p>
              </div>
              <button onClick={() => setOpen(false)} className="text-white/40 hover:text-white"><FiX size={16} /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {messages.map((m) => {
                const isMine = m.from?.id === user?._id || m.from?.name === user?.name;
                return (
                  <div key={m.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[75%] px-3 py-2 text-xs leading-relaxed ${isMine ? 'bg-gold text-ink' : 'bg-paper dark:bg-white/10 text-ink dark:text-white'}`}>
                      {!isMine && <p className="font-medium mb-0.5 text-[10px] text-gold-dark dark:text-gold">{m.from?.name}</p>}
                      {m.text}
                    </div>
                  </div>
                );
              })}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-paper dark:bg-white/10 px-3 py-2 text-xs text-gray-400">typing…</div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>
            <div className="border-t border-paper-2 dark:border-white/10 p-2 flex gap-2">
              <input
                type="text"
                value={input}
                onChange={handleTyping}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                placeholder={user ? 'Type a message…' : 'Sign in to chat'}
                disabled={!user}
                className="flex-1 text-xs bg-paper dark:bg-white/5 border border-paper-2 dark:border-white/10 px-3 py-2 outline-none text-ink dark:text-white placeholder-gray-400 disabled:opacity-40"
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || !user}
                className="bg-gold text-ink p-2 hover:bg-gold-dark transition-colors disabled:opacity-40"
              >
                <FiSend size={13} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen((p) => !p)}
        className="w-12 h-12 bg-gold text-ink flex items-center justify-center shadow-lg hover:bg-gold-dark transition-colors"
      >
        {open ? <FiX size={18} /> : <FiMessageSquare size={18} />}
      </motion.button>
    </div>
  );
}
