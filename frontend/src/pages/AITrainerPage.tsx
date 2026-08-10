import React, { useState, useEffect, useRef } from 'react';
import { AppShell } from '../components/layout/AppShell';
import { api } from '../services/api';
import { AiMessage, StructuredWorkout } from '../types/ai';
import { Dumbbell, Send, Play, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { FormattedAiResponse } from '../components/ai/FormattedAiResponse';

export const AITrainerPage: React.FC = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<AiMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | undefined>(undefined);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Helper to deduplicate messages by ID
  const deduplicateMessages = (msgList: AiMessage[]): AiMessage[] => {
    const seen = new Set<string>();
    return msgList.filter((m) => {
      if (!m.id || seen.has(m.id)) return false;
      seen.add(m.id);
      return true;
    });
  };

  useEffect(() => {
    const loadConversations = async () => {
      try {
        const res = await api.get('/ai/conversations');
        if (res.data.success && res.data.data.length > 0) {
          const latest = res.data.data[0];
          setConversationId(latest.id);
          setMessages(deduplicateMessages(latest.messages));
        }
      } catch (e) {
        console.error('Failed to load conversations:', e);
      }
    };
    loadConversations();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (messageText?: string) => {
    const textToSend = messageText || input;
    if (!textToSend.trim() || loading) return;

    const userMsgId = `user-${Date.now()}`;
    const userMsg: AiMessage = {
      id: userMsgId,
      conversationId: conversationId || '',
      role: 'USER',
      content: textToSend,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => deduplicateMessages([...prev, userMsg]));
    if (!messageText) setInput('');
    setLoading(true);

    try {
      const res = await api.post('/ai/chat', {
        message: textToSend,
        conversationId,
      });

      if (res.data.success) {
        const replyText = res.data.message || res.data.replyText || res.data.data?.replyText || '';
        const structuredData = res.data.structuredData || res.data.data?.structuredData;
        const newConvId = res.data.conversationId || res.data.data?.conversationId;

        if (!conversationId && newConvId) setConversationId(newConvId);

        const aiMsgId = `assistant-${Date.now()}`;
        const aiMsg: AiMessage = {
          id: aiMsgId,
          conversationId: newConvId || conversationId || '',
          role: 'ASSISTANT',
          content: replyText,
          structuredData: structuredData ? JSON.stringify(structuredData) : undefined,
          createdAt: new Date().toISOString(),
        };

        setMessages((prev) => deduplicateMessages([...prev, aiMsg]));
      }
    } catch (err: any) {
      console.error('AI chat failed:', err);
      const serverMessage = err?.response?.data?.message || err?.response?.data?.error || err?.message;
      const errorMsg: AiMessage = {
        id: `err-${Date.now()}`,
        conversationId: conversationId || '',
        role: 'ASSISTANT',
        content: serverMessage
          ? `I encountered an issue: ${serverMessage}`
          : "I'm temporarily unable to analyze your fitness data. Please try again in a moment.",
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => deduplicateMessages([...prev, errorMsg]));
    } finally {
      setLoading(false);
    }
  };

  const handleStartWorkoutFromAi = async (workoutData: any) => {
    try {
      const res = await api.post('/workouts/sessions', {
        title: workoutData.title || 'AI Generated Workout',
        exerciseIds: [],
      });
      if (res.data.success) {
        navigate(`/workouts/active/${res.data.data.id}`);
      }
    } catch (e) {
      navigate('/workouts');
    }
  };

  // Clean raw JSON strings from user-facing message body
  const formatMessageText = (text: string) => {
    if (!text) return '';
    let clean = text.replace(/```json[\s\S]*?```/g, '').trim();
    clean = clean.replace(/```[\s\S]*?```/g, '').trim();
    return clean || text;
  };

  return (
    <AppShell title="AI Trainer">
      <div className="flex-1 flex flex-col h-full min-h-0 overflow-hidden bg-[var(--bg-main)] transition-colors duration-200">
        <div className="flex-1 flex flex-col min-h-0 py-4 custom-scrollbar">
          <div className="max-w-[1600px] mx-auto w-full px-4 sm:px-6 lg:px-8 flex flex-col h-[calc(100vh-8.5rem)]">
            
            {/* Conversation List Container */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-2 mb-4 custom-scrollbar">
              {messages.length === 0 && (
                <div className="text-center py-16">
                  <div className="w-16 h-16 rounded-2xl bg-[#865BC4] text-white flex items-center justify-center mx-auto mb-4 shadow-lg shadow-[#865BC4]/30">
                    <Dumbbell className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-lg font-extrabold text-[var(--text-primary)] mb-1">Ask Your FitMind Coach</h3>
                  <p className="text-[var(--text-secondary)] text-xs max-w-sm mx-auto">
                    Type a message below to start your personalized fitness coaching session.
                  </p>
                </div>
              )}

              {messages.map((msg) => {
                const isUser = msg.role === 'USER';
                let parsedStructured: StructuredWorkout | null = null;
                if (msg.structuredData) {
                  try {
                    parsedStructured = typeof msg.structuredData === 'string' ? JSON.parse(msg.structuredData) : msg.structuredData;
                  } catch (e) {}
                }

                const cleanedText = formatMessageText(msg.content);

                return (
                  <div key={msg.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-2xl rounded-2xl p-4 text-sm ${
                        isUser
                          ? 'bg-[#865BC4] text-white rounded-br-none shadow-md shadow-[#865BC4]/20 font-medium'
                          : 'bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-primary)] rounded-bl-none shadow-sm font-medium'
                      }`}
                    >
                      {cleanedText && (
                        isUser ? (
                          <p className="whitespace-pre-line leading-relaxed">{cleanedText}</p>
                        ) : (
                          <FormattedAiResponse content={cleanedText} />
                        )
                      )}

                      {/* Structured Workout Recommendation Card */}
                      {parsedStructured && parsedStructured.workout && (
                        <div className="mt-4 p-4 rounded-xl bg-[var(--bg-surface)] border border-[#865BC4]/40 text-left space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-[#865BC4] uppercase tracking-wider">Recommended Session</span>
                            <span className="text-xs font-semibold text-[var(--text-secondary)]">{parsedStructured.workout.duration} mins</span>
                          </div>
                          <h4 className="font-bold text-[var(--text-primary)] text-base">{parsedStructured.title}</h4>
                          <p className="text-xs text-[var(--text-secondary)]">{parsedStructured.summary}</p>

                          <div className="space-y-2 py-2">
                            {parsedStructured.workout.exercises.map((ex, idx) => (
                              <div key={idx} className="flex items-center justify-between text-xs p-2.5 rounded-lg bg-[var(--bg-card)] border border-[var(--border-subtle)] shadow-sm">
                                <span className="font-semibold text-[var(--text-primary)]">{ex.name}</span>
                                <span className="text-[var(--text-secondary)]">{ex.sets} sets × {ex.reps} reps ({ex.restSeconds}s rest)</span>
                              </div>
                            ))}
                          </div>

                          <button
                            onClick={() => handleStartWorkoutFromAi(parsedStructured)}
                            className="w-full py-2.5 rounded-lg font-bold bg-[#865BC4] hover:bg-[#9868DC] text-white text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-[#865BC4]/30"
                          >
                            <Play className="w-4 h-4 fill-white" />
                            <span>Start This Workout Now</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {loading && (
                <div className="flex justify-start">
                  <div className="bg-[var(--bg-card)] border border-[#865BC4]/40 rounded-2xl p-4 text-sm text-[var(--text-primary)] flex items-center gap-3 shadow-md">
                    <RefreshCw className="w-4 h-4 animate-spin text-[#865BC4]" />
                    <span className="font-semibold text-xs text-[var(--text-primary)]">Analyzing your fitness data...</span>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Fixed Bottom Input Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2 flex-shrink-0 pt-2 border-t border-[var(--border-subtle)]"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask your coach"
                className="flex-1 bg-[var(--bg-input)] border border-[var(--text-secondary)] rounded-xl px-4 py-3 text-sm text-[var(--text-primary)] font-medium placeholder-[var(--text-secondary)] focus:outline-none focus:border-[#865BC4] focus:ring-2 focus:ring-[#865BC4]/20 transition-colors shadow-sm"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="px-5 py-3 rounded-xl font-bold bg-[#865BC4] hover:bg-[#9868DC] text-white shadow-md shadow-[#865BC4]/30 text-sm flex items-center justify-center transition-all disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </AppShell>
  );
};
