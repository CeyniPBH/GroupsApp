import { useState, useEffect,useRef } from 'react';
import TextBox from '../textbox/textBox';
import MessagesList from '../messageList/MessageList';
import Navbar from '../../navbar/Navbar';
import { chatsAPI } from '../../../../services/api';
import {getSocket} from '../../../../services/socket';
import type { MessageItem } from '../message/Message';

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
  chatId: number;
  chatName: string;
  chatType: 'contact' | 'group';
}

const Chat = ({ userId, chatId, chatName, chatType }: ChatProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socket = getSocket();

  // 1. Cargar mensajes cuando tenemos chatId
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
    
    // 2. Unirse al chat por socket
    if (socket && socket.connected) {
      console.log('🔗 Uniéndose al chat:', chatId);
      socket.emit('joinChat', chatId);
    }
    
    // 3. Limpiar al desmontar
    return () => {
      if (socket && socket.connected) {
        console.log('🔌 Saliendo del chat:', chatId);
        socket.emit('leaveChat', chatId);
      }
    };
  }, [chatId, socket]);

  // 4. Escuchar mensajes nuevos
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

  // 5. Auto-scroll al último mensaje
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 6. Enviar mensaje
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
  const formattedMessages: MessageItem[] = messages.map(m => ({
    id: m.id,
    content: m.content,
    isMine: m.senderId === userId,
    senderName: chatType === 'group' 
      ? (m.sender?.name || (m.senderId === userId ? 'Tú' : 'Usuario'))
      : (m.senderId === userId ? 'Tú' : chatName)
  }));

  return (
    <div className="flex flex-col h-full">
      <Navbar userName={chatName} />
      
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