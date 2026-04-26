import { useState, useEffect } from 'react';
import { contactsAPI, usersAPI } from '../../services/api';
import type { User, PendingRequest,SelectableItem } from './contactList.types';
import { chatsAPI } from '../../services/api';
export const useContactList = (
  usuarioActual: User | null,
  onSelectItem: (item: SelectableItem) => void
) => {
  const [contactos, setContactos] = useState<User[]>([]);
  const [chats, setChats] = useState<any[]>([]);
  const [usuariosDisponibles, setUsuariosDisponibles] = useState<User[]>([]);
  const [popUpAbierto, setPopUpAbierto] = useState(false);
  
  const [solicitudesPendientes, setSolicitudesPendientes] = useState<PendingRequest[]>([]);
  const [popUpSolicitudesAbierto, setPopUpSolicitudesAbierto] = useState(false);
  const [notificaciones, setNotificaciones] = useState(0);


  //crear grupo 
  const crearGrupo = async (name: string, participantes: User[]) => {
  try {
    const res = await chatsAPI.createChat({
      type: 'group',
      name,
      participantIds: participantes.map(p => p.id),
    });

    setChats(prev => [res.data, ...prev]);
    onSelectItem({
      id: res.data.id,
      name: name,
      tag: '',
      type: 'group'
    });

  } catch (error) {
    console.error('Error creando grupo:', error);
  }
};
  const abrirChatDirecto = async (contacto: User) => {
  try {
    const res = await chatsAPI.createChat({
      type: 'direct',
      participantIds: [contacto.id],
    });

    const chatId = res.data.id;
    onSelectItem({
      id: chatId,
      name: contacto.name,
      tag: contacto.tag,
      type: 'contact'
    });
  } catch (error) {
    console.error('Error abriendo chat directo:', error);
  }
};
  //cargar grupos
  useEffect(() => {
  const cargarChats = async () => {
    try {
      const res = await chatsAPI.getChats();
      setChats(res.data || []);
    } catch (error) {
      console.error('Error cargando chats:', error);
    }
  };

  cargarChats();
}, []);
  // Cargar contactos aceptados
  useEffect(() => {
    if (!usuarioActual) return;
    
    const cargarContactos = async () => {
      try {
    const res = await contactsAPI.getContacts();
    const contactosAceptados = res.data
      .filter((c: any) => c.status === 'accepted')
      .map((c: any) => {
        // El contacto es el otro usuario (no yo)
        const otroUsuario = c.userId === usuarioActual?.id ? c.receiver : c.requester;
        return {
            id: otroUsuario?.id,
            name: otroUsuario?.name,
            tag: otroUsuario?.tag,
          status: c.status,
        };
      });
    setContactos(contactosAceptados);
  } catch (error) {
        console.error('Error cargando contactos:', error);
      }
    };
    
    cargarContactos();
  }, [usuarioActual]);

  // Cargar solicitudes pendientes
  useEffect(() => {
    if (!usuarioActual) return;
    
    const cargarSolicitudes = async () => {
      try {
        const res = await contactsAPI.getPendingRequests();
        // Filtrar solicitudes donde el usuario actual es el contactId
        const pendientes = res.data.filter(
          (r: any) => r.contactId === usuarioActual.id && r.status === 'pending'
        );
        setSolicitudesPendientes(pendientes);
        setNotificaciones(pendientes.length);
      } catch (error) {
        console.error('Error cargando solicitudes:', error);
        // Fallback: si el endpoint no funciona, probar con getContacts
        try {
          const allRes = await contactsAPI.getContacts();
          const pendientes = allRes.data.filter(
            (c: any) => c.contactId === usuarioActual.id && c.status === 'pending'
          );
          setSolicitudesPendientes(pendientes);
          setNotificaciones(pendientes.length);
        } catch (e) {
          console.error('Error en fallback:', e);
        }
      }
    };
    
    cargarSolicitudes();
    
    // Recargar cada 5 segundos
    const interval = setInterval(cargarSolicitudes, 5000);
    return () => clearInterval(interval);
  }, [usuarioActual]);

  // Cargar usuarios disponibles para agregar
useEffect(() => {
  if (!usuarioActual) {
    console.log('⚠️ usuarioActual es null, esperando...');
    return;
  }
  const cargarUsuarios = async () => {
    try {
      const res = await usersAPI.search('');
      
      // La respuesta puede estar en res.data o directamente en res
      let usuarios = Array.isArray(res.data) ? res.data : [];
      
      // Si la respuesta es un objeto con una propiedad 'users'
      if (res.data && res.data.users && Array.isArray(res.data.users)) {
        usuarios = res.data.users;
      }

      // Filtrar: excluir usuario actual y los que ya son contactos
      const disponibles = usuarios.filter(
        (u: User) => 
          u.id !== usuarioActual?.id && 
          !contactos.some(c => c.id === u.id)
      );
      
      setUsuariosDisponibles(disponibles);
      
    } catch (error) {
      console.error('❌ Error cargando usuarios:', error);
    }
  };
  
  cargarUsuarios();
}, [contactos, usuarioActual]);

  const agregarContacto = async (usuario: User) => {
    try {
      await contactsAPI.addContact(usuario.id);
      // Recargar contactos
      const res = await contactsAPI.getContacts();
      const contactosAceptados = res.data
        .filter((c: any) => c.status === 'accepted')
        .map((c: any) => {
          const otroUsuario = c.userId === usuarioActual?.id ? c.receiver : c.requester;
          return {
            id: otroUsuario?.id,
            name: otroUsuario?.name,
            tag: otroUsuario?.tag,
            status: c.status,
          };
        });
      setContactos(contactosAceptados);
      setPopUpAbierto(false);
    } catch (error) {
      console.error('Error agregando contacto:', error);
    }
  };

  const eliminarContacto = async (usuario: User) => {
    try {
      await contactsAPI.removeContact(usuario.id);
      setContactos(prev => prev.filter(c => c.id !== usuario.id));
    } catch (error) {
      console.error('Error eliminando contacto:', error);
    }
  };

  //FUNCIONES para solicitudes
  const aceptarSolicitud = async (request: PendingRequest) => {
    try {
      const contactId = request.id;
      await contactsAPI.acceptRequest(contactId);
      
      // Actualizar lista de solicitudes
      setSolicitudesPendientes(prev => prev.filter(r => r.id !== contactId));
      setNotificaciones(prev => prev - 1);
      
      // Recargar contactos desde el servidor para tener el formato correcto
      const res = await contactsAPI.getContacts();
      const contactosAceptados = res.data
        .filter((c: any) => c.status === 'accepted')
        .map((c: any) => {
          const otroUsuario = c.userId === usuarioActual?.id ? c.receiver : c.requester;
          return {
            id: otroUsuario?.id,
            name: otroUsuario?.name,
            tag: otroUsuario?.tag,
            status: c.status,
          };
        });
      setContactos(contactosAceptados);
      
    } catch (error) {
      console.error('Error aceptando solicitud:', error);
    }
  };

  const rechazarSolicitud = async (request: PendingRequest) => {
    try {
      const contactId = request.id;
      await contactsAPI.rejectRequest(contactId);
      
      setSolicitudesPendientes(prev => prev.filter(r => r.id !== contactId));
      setNotificaciones(prev => prev - 1);
      
    } catch (error) {
      console.error('Error rechazando solicitud:', error);
    }
  };

  return {
    contactos,
    usuariosDisponibles,
    popUpAbierto,
    setPopUpAbierto,
    agregarContacto,
    eliminarContacto,
    
    solicitudesPendientes,
    popUpSolicitudesAbierto,
    setPopUpSolicitudesAbierto,
    notificaciones,
    aceptarSolicitud,
    rechazarSolicitud,
    crearGrupo,
    abrirChatDirecto,
    chats,
  };
};