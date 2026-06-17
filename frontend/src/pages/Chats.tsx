import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api, { API_URL } from '../services/api';

interface UserChatPartner {
  id: number;
  username: string;
  avatarUrl?: string;
  bio?: string;
}

interface Message {
  id: number;
  sender: {
    id: number;
    username: string;
    avatarUrl?: string;
  };
  recipient: {
    id: number;
    username: string;
    avatarUrl?: string;
  };
  content: string;
  createdAt: string;
}

const Chats = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [partners, setPartners] = useState<UserChatPartner[]>([]);
  const [activePartner, setActivePartner] = useState<UserChatPartner | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Retrieve URL parameter user (e.g. ?user=username)
  const targetUsername = searchParams.get('user');

  // Fetch all chat partners
  const fetchPartners = async (selectUsername?: string) => {
    try {
      const res = await api.get('/api/messages/chats');
      const data: UserChatPartner[] = res.data;
      setPartners(data);

      if (selectUsername) {
        // Find in existing partners
        const found = data.find(p => p.username === selectUsername);
        if (found) {
          setActivePartner(found);
        } else {
          // If not in list (first contact), we fetch this user's details to initialize the chat partner object
          const tempPartner: UserChatPartner = {
            id: -1, // Temporary ID
            username: selectUsername,
          };
          setActivePartner(tempPartner);
          // Append temporary partner to partners list so they show up
          setPartners(prev => {
            if (prev.some(p => p.username === selectUsername)) return prev;
            return [tempPartner, ...prev];
          });
        }
      } else if (data.length > 0 && !activePartner) {
        // Auto select first partner if no target
        setActivePartner(data[0]);
      }
    } catch (err) {
      console.error(err);
      showToast('Error al cargar la bandeja de entrada', 'error');
    }
  };

  // Fetch chat history with active partner
  const fetchHistory = async (partnerUsername: string, silenceLoad = false) => {
    if (!silenceLoad) setLoadingHistory(true);
    try {
      const res = await api.get(`/api/messages/history/${partnerUsername}`);
      setMessages(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      if (!silenceLoad) setLoadingHistory(false);
    }
  };

  // Initial load
  useEffect(() => {
    if (!user) return;
    fetchPartners(targetUsername || undefined);
  }, [user, targetUsername]);

  // Load history and start polling when active partner changes
  useEffect(() => {
    if (!activePartner) {
      setMessages([]);
      return;
    }

    fetchHistory(activePartner.username);

    // Set up polling interval every 4 seconds for real-time messages
    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    
    pollIntervalRef.current = setInterval(() => {
      fetchHistory(activePartner.username, true);
    }, 4000);

    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, [activePartner]);

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activePartner || sendingMessage) return;

    const textToSend = inputText.trim();
    setInputText('');
    setSendingMessage(true);

    try {
      const res = await api.post('/api/messages', {
        recipientUsername: activePartner.username,
        content: textToSend
      });
      // Append new message locally
      setMessages(prev => [...prev, res.data]);
      
      // If activePartner was temporary, fetch partners again to update their ID/info
      if (activePartner.id === -1) {
        fetchPartners(activePartner.username);
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Error al enviar el mensaje';
      showToast(msg, 'error');
    } finally {
      setSendingMessage(false);
    }
  };

  const handleSelectPartner = (partner: UserChatPartner) => {
    setActivePartner(partner);
    setSearchParams(partner.id === -1 ? { user: partner.username } : {});
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-light flex items-center justify-center p-4">
        <p className="text-gray-600 font-semibold">Inicia sesión para chatear con otros usuarios.</p>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-80px)] bg-gradient-to-b from-gray-50 to-gray-100 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto bg-white/80 backdrop-blur-md rounded-3xl border border-gray-200/50 shadow-xl overflow-hidden flex h-[750px]">
        {/* Sidebar */}
        <div className="w-80 border-r border-gray-200/80 flex flex-col bg-white/40">
          <div className="p-6 border-b border-gray-200/80">
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">Chats</h2>
            <p className="text-xs text-gray-500 mt-1 font-medium">Bandeja de Entrada</p>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {partners.length === 0 ? (
              <p className="text-center text-sm text-gray-400 py-8">No tienes chats activos.</p>
            ) : (
              partners.map((partner) => {
                const isActive = activePartner?.username === partner.username;
                const initials = partner.username.slice(0, 2).toUpperCase();

                return (
                  <button
                    key={partner.username}
                    onClick={() => handleSelectPartner(partner)}
                    className={`w-full flex items-center gap-4 p-3.5 rounded-2xl transition duration-200 border ${
                      isActive
                        ? 'bg-primary text-white border-primary shadow-md'
                        : 'hover:bg-gray-50 text-gray-700 bg-white/60 border-gray-200/40'
                    }`}
                  >
                    {partner.avatarUrl ? (
                      <img
                        src={`${API_URL}${partner.avatarUrl}`}
                        alt={partner.username}
                        className="w-12 h-12 object-cover rounded-full border border-gray-200"
                      />
                    ) : (
                      <div
                        className={`w-12 h-12 rounded-full font-bold flex items-center justify-center text-sm ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : 'bg-gradient-to-tr from-green-400 to-emerald-600 text-white shadow-sm'
                        }`}
                      >
                        {initials}
                      </div>
                    )}
                    <div className="text-left min-w-0 flex-1">
                      <p className="font-bold text-sm truncate">@{partner.username}</p>
                      <p className={`text-xs truncate mt-0.5 ${isActive ? 'text-white/80' : 'text-gray-400'}`}>
                        {partner.bio || 'Ver conversación'}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Chat window */}
        <div className="flex-1 flex flex-col bg-gray-50/50">
          {activePartner ? (
            <>
              {/* Header */}
              <div className="p-6 border-b border-gray-200/80 bg-white flex items-center gap-4 shadow-sm z-10">
                {activePartner.avatarUrl ? (
                  <img
                    src={`${API_URL}${activePartner.avatarUrl}`}
                    alt={activePartner.username}
                    className="w-10 h-10 object-cover rounded-full border border-gray-200"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full font-bold flex items-center justify-center text-xs bg-gradient-to-tr from-green-400 to-emerald-600 text-white shadow-sm">
                    {activePartner.username.slice(0, 2).toUpperCase()}
                  </div>
                )}
                <div>
                  <h3 className="font-extrabold text-gray-900 text-sm">@{activePartner.username}</h3>
                  <button
                    onClick={() => navigate(`/profile/${activePartner.username}`)}
                    className="text-[11px] text-green-600 hover:text-green-700 hover:underline font-bold text-left block mt-0.5"
                  >
                    Ver Perfil Público
                  </button>
                </div>
              </div>

              {/* Message History */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {loadingHistory && messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center max-w-sm mx-auto">
                    <span className="text-4xl mb-2">👋</span>
                    <p className="font-bold text-gray-800 text-base">¡Di hola!</p>
                    <p className="text-gray-400 text-xs mt-1">
                      Inicia la conversación con @{activePartner.username} para consultar detalles de su artículo.
                    </p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isSelf = msg.sender.username === user.username;
                    const date = new Date(msg.createdAt).toLocaleTimeString('es-ES', {
                      hour: '2-digit',
                      minute: '2-digit'
                    });

                    return (
                      <div key={msg.id} className={`flex ${isSelf ? 'justify-end' : 'justify-start'}`}>
                        <div
                          className={`max-w-[70%] p-4 rounded-3xl shadow-sm relative ${
                            isSelf
                              ? 'bg-primary text-white rounded-br-none'
                              : 'bg-white text-gray-800 border border-gray-200/60 rounded-bl-none'
                          }`}
                        >
                          <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                          <span
                            className={`text-[10px] mt-1.5 block text-right font-medium ${
                              isSelf ? 'text-white/60' : 'text-gray-400'
                            }`}
                          >
                            {date}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input bar */}
              <form onSubmit={handleSendMessage} className="p-6 border-t border-gray-200/80 bg-white">
                <div className="flex gap-4">
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Escribe un mensaje..."
                    className="flex-1 p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:border-primary focus:bg-white transition"
                  />
                  <button
                    type="submit"
                    disabled={sendingMessage || !inputText.trim()}
                    className="bg-primary hover:bg-green-600 text-white font-bold px-6 rounded-2xl transition disabled:opacity-50 flex items-center justify-center shadow-md shadow-primary/20"
                  >
                    Enviar 🚀
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-gray-50/20">
              <span className="text-6xl mb-4">💬</span>
              <h3 className="text-xl font-bold text-gray-800">Tus Conversaciones</h3>
              <p className="text-gray-400 mt-2 text-sm max-w-sm">
                Selecciona un chat en el panel izquierdo o pregunta al vendedor de un producto para iniciar una charla.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chats;
