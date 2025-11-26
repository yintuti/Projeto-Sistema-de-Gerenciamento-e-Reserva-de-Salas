import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Admin from './pages/Admin';
import Cadastro from './pages/Cadastro';

function App() {
  return (
    <Routes>
      <Route path="/" element={ <Login /> } />

      <Route path="/login" element={ <Login /> } />

      <Route path="/admin" element={ <Admin />} />

      <Route path="/cadastro" element={ <Cadastro />} />
    </Routes>
  )
}

export default App;