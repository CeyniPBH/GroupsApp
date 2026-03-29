import { useState, useEffect,useRef } from 'react';
import TextBox from '../textbox/textBox';
import MessagesList from '../messageList/MessageList';
import Navbar from '../../navbar/Navbar';
import { chatsAPI } from '../../../../services/api';
import {getSocket} from '../../../../services/socket';

interface Message {
  id: number;
  content: string;
  type: string;
  senderId: number;
  chatId: number;
  createdAt: string;
  sender?: {
    id: number;
    name: string;
  };
}

interface ChatProps {
  userId: number;
  contactId: number;
  contactName: string;
  contactTag: string;
}

const Chat = ({ userId, contactId, contactName}: ChatProps) => {
  const [chatId, setChatId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socket = getSocket();

  useEffect(() => {
    if (!contactId) return;
    
    const getOrCreateChat = async () => {
      try {
        console.log('🔍 Creando/obteniendo chat con contacto:', contactId);
        const res = await chatsAPI.createChat({
          type: 'direct',
          participantIds: [contactId]
        });
        
        const newChatId = res.data.id;
        console.log('✅ Chat ID:', newChatId);
        setChatId(newChatId);
        
      } catch (error) {
        console.error('❌ Error creando/obteniendo chat:', error);
      }
    };
    
    getOrCreateChat();
  }, [contactId]);

  // 2. Cargar mensajes cuando tenemos chatId
  useEffect(() => {
    if (!chatId) return;
    
    const loadMessages = async () => {
      setLoading(true);
      try {
        console.log('📥 Cargando mensajes del chat:', chatId);
        const res = await chatsAPI.getMessages(chatId);
        setMessages(res.data || []);
      } catch (error) {
        console.error('❌ Error cargando mensajes:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadMessages();
    
    // 3. Unirse al chat por socket
    if (socket && socket.connected) {
      console.log('🔗 Uniéndose al chat:', chatId);
      socket.emit('joinChat', chatId);
    }
    
    // 4. Limpiar al desmontar
    return () => {
      if (socket && socket.connected) {
        console.log('🔌 Saliendo del chat:', chatId);
        socket.emit('leaveChat', chatId);
      }
    };
  }, [chatId, socket]);

  // 5. Escuchar mensajes nuevos
  useEffect(() => {
    if (!socket) return;
    
    const handleNewMessage = (message: Message) => {
      console.log('📩 Mensaje recibido:', message);
      // Solo agregar si es del chat actual
      if (message.chatId !== chatId)return;
       
      setMessages(prev => {
      const exists = prev.some(m => m.id === message.id);
      if (exists) return prev; // evita duplicado
      return [...prev, message];
      });
      
    };
    
    socket.on('newMessage', handleNewMessage);
    
    return () => {
      socket.off('newMessage', handleNewMessage);
    };
  }, [socket, chatId]);

  // 6. Auto-scroll al último mensaje
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 7. Enviar mensaje
  const handleSendMessage = async (content: string) => {
    if (!content.trim() || !chatId) return;
    
    try {
      console.log('📤 Enviando mensaje:', content);
      
      // Guardar en base de datos
      const res = await chatsAPI.sendMessage(chatId, content);
      const newMessage = res.data;
      
      // Emitir por socket para tiempo real
      if (socket && socket.connected) {
        socket.emit('sendMessage', {
          chatId: chatId,
          content: content,
          senderId: userId,
          messageId: newMessage.id,
          createdAt: new Date().toISOString()
        });
      }
      
      // Agregar mensaje localmente
      setMessages(prev => {
    const exists = prev.some(m => m.id === res.data.id);
    if (exists) return prev;
    return [...prev, res.data];
  });
      
    } catch (error) {
      console.error('❌ Error enviando mensaje:', error);
    }
  };

  // Formatear mensajes para MessagesList
  const formattedMessages = messages.map(m => ({
  id: m.id,
  content: m.content,
  isMine: m.senderId === userId,
  senderName: m.sender?.name || (m.senderId === userId ? 'Tú' : contactName)
}));
console.log('contactName:', contactName);
  return (
    <div className="flex flex-col h-full">
      <Navbar userName={contactName} />
      
      <section id="messages" className='flex-1 overflow-y-auto'>
        {loading ? (
          <div className="text-center text-gray-500 mt-10">Cargando mensajes...</div>
        ) : messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-10">
            No hay mensajes aún. ¡Envía el primero!
          </div>
        ) : (
          <>
            <MessagesList messages={formattedMessages} />
            <div ref={messagesEndRef} />
          </>
        )}
      </section>
      <div id="textbox" className='h-14 w-11/12 bg-slate-950 mx-auto mb-2 mt-2 rounded-xl'>
        <TextBox onSendMessage={handleSendMessage} />
      </div>
    </div>
  );
};

export default Chat