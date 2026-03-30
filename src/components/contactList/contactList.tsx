import PopUp from '../popUp/PopUP';
import SolicitudesPopUp from '../solicitudes/SolicitudesPopUp';
import type { ContactListProps } from './contactList.types';
import { useContactList } from './contactList.logic';
import AddUserIcon from '../../assets/addUser.svg';
import LogOutIcon from '../../assets/logout.svg';
import BellIcon from '../../assets/bell.svg';

const ContactList = ({ usuarioActual, onSelectItem }: ContactListProps) => {
  const {
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
    chats,
  } = useContactList(usuarioActual, onSelectItem);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
  };

  const items = [
    ...contactos.map(c => ({
      id: c.id,
      name: c.name,
      tag: c.tag,
      type: 'contact' as const
    })),
    ...chats.map(c => ({
      id: c.id,
      name: c.name || 'Grupo',
      tag: '',
      type: c.type === 'group' ? 'group' as const : 'contact' as const
    }))
  ];

  return (
    <section id="user" className='h-full w-2/5 flex-row flex'>
      <div className='flex flex-col bg-slate-950'>
        {/*Usuario logeado */}
        <div className="flex flex-col items-center mx-2 py-2 border-b border-slate-800 ">
          <img
            src={`/${usuarioActual?.name}.jpeg`}
            className="w-10 h-10 rounded-full mr-3"
            onError={(e) => {
              e.currentTarget.src = "/fotoperfil.jpeg";
            }}
          />
          <div className="text-xs font-bold text-white text-center mt-1">
            {usuarioActual?.name}
          </div>
        </div>
      
        <div className='h-full w-full flex flex-col justify-end'>
          {/* Botón para agregar contacto */}
          <button
            onClick={() => setPopUpAbierto(true)}
            className="mt-4 p-2 text-white rounded flex justify-center hover:text-gray-200"
            title="Agregar contacto"
          >
            <AddUserIcon className="w-10 h-10" />
          </button>
          
          {/* Botón para crear grupo */}
          <button
            onClick={() => {
              const name = prompt('Nombre del grupo');
              if (!name) return;
              // ejemplo simple: todos los contactos como participantes
              crearGrupo(name, contactos);
            }}
            className="mt-4 p-2 text-white rounded flex justify-center hover:text-gray-200"
            title="Crear grupo"
          >
            👥
          </button>
                
          <button
            onClick={() => setPopUpSolicitudesAbierto(true)}
            className="mt-4 p-2 text-white rounded flex justify-center hover:text-gray-200 relative"
            title="Solicitudes pendientes"
          >
            <BellIcon className="w-8 h-8" />
            {notificaciones > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {notificaciones}
              </span>
            )}
          </button>
          <button
            onClick={handleLogout}
            className=" mt-4 p-2 text-white rounded flex justify-center hover:text-gray-200"
          >
            <LogOutIcon className="w-8 h-8" />
          </button>
        </div>
      </div>

      <div className='h-full w-10/12 border-r-4 border-r-slate-950/30 bg-slate-900 overflow-y-auto'>
        <h3 className="font-bold h-19 text-2xl content-center ml-5">CHATS</h3>
        <div id="line" className='border-t-4 border-t-slate-950/30 pb-4'></div>
        {items.length === 0 ? (
          <p className="text-gray-400 text-center py-4">No hay chats o contactos</p>
        ) : (
          items.map(item => (
            <div key={`${item.type}-${item.id}`} className='text-xl justify-between rounded-xl flex mb-2 mx-4 w-[13/14] bg-slate-800 hover:bg-slate-700'>
              <button
                onClick={() => {
                  console.log('🖱️ Click en item:', item);
                  onSelectItem(item);
                }}
                className="w-10/12 p-2 text-left text-gray-300"
              >
                {item.type === 'group' ? (
                  <div>👥 {item.name}</div>
                ) : (
                  <div>{item.name}#{item.tag}</div>
                )}
              </button>

              {item.type === 'contact' && (
                <button
                  onClick={() => eliminarContacto(contactos.find(c => c.id === item.id) as any)}
                  className="w-2/12 p-2 text-gray-400 hover:text-red-500"
                >
                  ✕
                </button>
              )}
            </div>
          ))
        )}
      </div>

      {/* PopUp para agregar contacto */}
      {popUpAbierto && (
        <PopUp
          usuariosDisponibles={usuariosDisponibles}
          onAgregar={agregarContacto}
          onCerrar={() => setPopUpAbierto(false)}
        />
      )}

      {/* PopUp para solicitudes pendientes */}
      {popUpSolicitudesAbierto && (
        <SolicitudesPopUp
          solicitudes={solicitudesPendientes}
          onAceptar={aceptarSolicitud}
          onRechazar={rechazarSolicitud}
          onCerrar={() => setPopUpSolicitudesAbierto(false)}
        />
      )}
    </section>
  );
};

export default ContactList;