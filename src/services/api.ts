import axios from 'axios';
// La URL del API ahora se inyecta en tiempo de ejecución a través de Docker.
// Vite reemplazará `import.meta.env.VITE_API_URL` con un placeholder durante la construcción.
const API_URL = import.meta.env.VITE_API_URL;
// ── fetch nativo (usado por Login/Register) ──────────────────────────────────
export async function apiFetch(method: string, endpoint: string, body?: any) {
  const url = `${API_URL}${endpoint}`;
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  const token = localStorage.getItem('token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || data.message || 'Error en la petición');
  }

  return data;
}

// ── axios instance (usado por los demás componentes) ─────────────────────────
const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config: any) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor de respuesta: Manejo global de errores (Ej. Token expirado)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.warn('Token expirado o inválido. Cerrando sesión automáticamente...');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/'; // O la ruta que corresponda a tu Login
    }
    return Promise.reject(error);
  }
);

export default api;

export const usersAPI = {
  search: (query: string) => api.get(`/users/search/name?q=${encodeURIComponent(query)}`),
  getProfile: () => api.get('/users/profile'),
};

export const contactsAPI = {
  getContacts: () => api.get('/contacts'),
  addContact: (userId: number) => api.post('/contacts', { contactId: userId }), // nota: contactId, no userId
  removeContact: (contactId: number) => api.delete(`/contacts/${contactId}`),
  
  getPendingRequests: () => api.get('/contacts?status=pending'),
  acceptRequest: (contactId: number) => api.put(`/contacts/${contactId}/accept`, {}),
  rejectRequest: (contactId: number) => api.put(`/contacts/${contactId}/block`, {}),
};

export const chatsAPI = {
  getChats: () => api.get('/chats'),
  createChat: (data: { type: string; participantIds: number[]; name?: string }) =>
    api.post('/chats', data),
  getMessages: (chatId: number) => api.get(`/messages/${chatId}`),
  sendMessage: (chatId: number, content: string, type: string = 'text') =>
    api.post('/messages', { chatId, content, type }),
  markAsRead: (chatId: number) => api.put(`/messages/${chatId}/read`),
};

export const filesAPI = {
  upload: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/files/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};
