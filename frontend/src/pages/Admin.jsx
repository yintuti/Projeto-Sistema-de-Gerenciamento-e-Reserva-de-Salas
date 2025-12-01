import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Admin() {
  const [salas, setSalas] = useState([]);
  const [nome, setNome] = useState('');
  const [capacidade, setCapacidade] = useState('');
  const [recursos, setRecursos] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    const usuarioSalvo = localStorage.getItem('usuario');
    if (!usuarioSalvo) {
      navigate('/login');
    } else {
      const usuario = JSON.parse(usuarioSalvo);
      if (usuario.tipo !== 'admin') {
        alert("Acesso negado. Apenas administradores.");
        navigate('/login');
      } else {
        carregarSalas();
      }
    }
  }, []);

  const carregarSalas = async () => {
    try {
      const resposta = await axios.get('http://localhost:5000/api/salas');
      setSalas(resposta.data);
    } catch (erro) {
      alert('Erro ao carregar salas: ' + erro.message);
    }
  };

  const handleCadastrar = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/salas', {
        nome, capacidade, recursos
      });
      alert('Sala cadastrada com sucesso!');

      setNome('');
      setCapacidade('');
      setRecursos('');

      carregarSalas();
    } catch (erro) {
      alert('Erro ao cadastrar: ' + (erro.response?.data?.message || erro.message));
    }
  };

  const handleExcluir = async (id) => {
    if (!window.confirm("Tem certeza que deseja excluir esta sala?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/salas/${id}`);
      setSalas(salas.filter(sala => sala.id !== id));
      alert("Sala excluída com sucesso.");
    } catch (erro) {
      alert('Erro ao excluir: ' + (erro.responde?.data?.message || erro.message));
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('usuario');
    navigate('/login');
  };

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Painel do Administrador</h1>
        <button onClick={handleLogout} style={{ backgroundColor: '#666', color: 'white' }}>Sair</button>
      </div>

      <div style={{ border: '1px solid #ccc', padding: '15px', margin: '20px 0', backgroundColor: '#f9f9f9'}}>
        <h3>Cadastrar Nova Sala</h3>
        <form onSubmit={handleCadastrar}>
          <input type="text" placeholder="Nome" value={nome} onChange={(e) => setNome(e.target.value)} required />
          &nbsp;
          <input type="number" placeholder="Capacidade" value={capacidade} onChange={(e) => setCapacidade(e.target.value)} required />
          &nbsp;
          <input type="text" placeholder="Recursos" value={recursos} onChange={(e) => setRecursos(e.target.value)} />
          &nbsp;
          <button type="submit" style={{ backgroundColor: 'green', color: 'white' }}>Salvar Sala</button>
        </form>
      </div>

      <table border="1" cellPadding="10" style={{ borderCollapser: 'collapse', width: '100%' }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nome</th>
            <th>Capacidade</th>
            <th>Recursos</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {salas.map((sala) => (
            <tr key={sala.id}>
              <td>{sala.id}</td>
              <td>{sala.nome}</td>
              <td>{sala.capacidade}</td>
              <td>{sala.recursos}</td>
              <td>
                <button onClick={() => handleExcluir(sala.id)} style={{ backgroundColor: 'red', color: 'white' }}>Excluir</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

}

export default Admin;