import './App.css'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/login';
import RegisterPage from './pages/Register';
import HomePage from './pages/Home';

function App() {
  const token = localStorage.getItem('token');
  const isAuthenticated = !!token;
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route 
        path="/" 
        element={isAuthenticated ? <HomePage /> : <Navigate to="/login" />} />
      <Route 
        path="*" 
        element={isAuthenticated ? <Navigate to="/" /> : <Navigate to="/login" />} 
      />
    </Routes>
  )
}
export default App

/*

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [usuarioActual, setUsuarioActual] = useState('samuel');
  const handleSendMessage = (message: string) => {
    //aqui deberias conectar con db
  };
  if (!isAuthenticated) {
    return <AuthWrapper onAuthSuccess={() => setIsAuthenticated(true)} />;
  }
  return (
      <div id="app" className="flex h-screen w-full">
              <ContactList
        usuarioActual={usuarioActual}
        onSelectContacto={setUsuarioActual}
      />
          <section id="chat" className=' h-full w-3/5 bg-gray-800 flex flex-col'>
            <Chat key={usuarioActual} userId={usuarioActual} />
            
          </section>
          
      </div>
  )
}
*/