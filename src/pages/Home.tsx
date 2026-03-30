import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ContactList from '../components/contactList/contactList';
import Chat from '../components/home/chat/chatDisplay/chat';
import { connectSocket, disconnectSocket } from '../services/socket';
import type { User ,SelectableItem} from '../components/contactList/contactList.types';


const HomePage = () => {
  const navigate = useNavigate();
  const [usuarioActual, setUsuarioActual] = useState<User | null>(null);
  const [selectedItem, setSelectedItem] = useState<SelectableItem | null>(null);
  
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    //Cargar el usuario desde localStorage
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setUsuarioActual(user);
      } catch (error) {
        console.error('Error parseando user:', error);
      }
    }
    

    if(token){connectSocket(token);}
    return () => {
      disconnectSocket();
    };
  }, [navigate]);

  const handleSelectItem = (item: SelectableItem) => {
    console.log('📌 Seleccionado:', item);
    setSelectedItem(item);
  };
  return (
    <div id="app" className="flex h-screen w-full">
      <ContactList
        usuarioActual={usuarioActual}
        onSelectItem={handleSelectItem}
      />
      <section id="chat" className='h-full w-3/5 bg-gray-800 flex flex-col'>
        
        {usuarioActual && selectedItem ? (
          <Chat
            key={`${selectedItem.type}-${selectedItem.id}`}
            userId={usuarioActual.id}
            chatId={selectedItem.id}
            chatName={selectedItem.name}
            chatType={selectedItem.type}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            Selecciona un contacto para empezar a chatear
          </div>
        )}
      </section>
    </div>
  );
};

export default HomePage;
