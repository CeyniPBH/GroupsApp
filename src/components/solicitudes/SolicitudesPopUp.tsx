import type { PendingRequest } from '../contactList/contactList.types';

interface SolicitudesPopUpProps {
  solicitudes: PendingRequest[];
  onAceptar: (solicitud: PendingRequest) => void;
  onRechazar: (solicitud: PendingRequest) => void;
  onCerrar: () => void;
}

const getInitials = (name: string) => {
  if (!name) return '?';
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
};

const SolicitudesPopUp = ({ 
  solicitudes, 
  onAceptar, 
  onRechazar, 
  onCerrar 
}: SolicitudesPopUpProps) => {
  return (
    <div className="fixed inset-0 bg-gray-900/90 flex items-center justify-center z-50">
      <div className="bg-gray-50 rounded-lg p-6 w-96">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-700">Solicitudes de amistad</h2>
          <button 
            onClick={onCerrar}
            className="text-gray-700 hover:text-red-700 text-2xl"
          >
            ×
          </button>
        </div>
        
        <div className="max-h-96 overflow-y-auto">
          {solicitudes.length === 0 ? (
            <p className="text-gray-700 text-center py-4">
              Sin solicitudes pendientes 
            </p>
          ) : (
            solicitudes.map(solicitud => {
              const usuario = solicitud.user || solicitud.requester;
              const name = usuario?.name || 'Usuario';
              const tag = usuario?.tag || '????';
              
              return (
                <div
                  key={solicitud.id}
                  className="flex justify-between items-center bg-slate-200 p-3 mb-3 rounded-xl"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                      {getInitials(name)}
                    </div>
                    <div>
                      <div className="font-medium text-gray-700">{name}</div>
                      <div className="text-sm text-gray-500">#{tag}</div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => onAceptar(solicitud)}
                      className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                    >
                      ✓ Aceptar
                    </button>
                    <button
                      onClick={() => onRechazar(solicitud)}
                      className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default SolicitudesPopUp;