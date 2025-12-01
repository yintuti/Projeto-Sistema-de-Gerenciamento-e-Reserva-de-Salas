import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Admin from './pages/Admin';
import Cadastro from './pages/Cadastro';
import Professor from './pages/Professor';

function App() {
  return (
    <Routes>
      <Route path="/" element={ <Login /> } />

      <Route path="/login" element={ <Login /> } />

      <Route path="/admin" element={ <Admin />} />

      <Route path="/cadastro" element={ <Cadastro />} />

      <Route path="/professor" element={ <Professor /> } />
    </Routes>
  )
}

export default App;