import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Professor() {
    const [salas, setSalas] = useState([]);
    const [minhasReservas, setMinhasReservas] = useState([]);
    const [salaSelecionada, setSalaSelecionada] = useState(null);
    const [data, setData] = useState('');
    const [inicio, setInicio] = useState('');
    const [fim, setFim] = useState('');
    const [usuario, setUsuario] = useState(null);
    const navigate = useNavigate();

    const carregarSalas = async () => {
        try {
            const resposta = await axios.get('http://localhost:5000/api/salas');
            setSalas(resposta.data);
        } catch (erro) {
            alert('Erro ao buscar salas: ' + erro.message);
        }
    };

    const carregarMinhasReservas = async (idUsuario) => {
        try {
            const resposta = await axios.get(`http://localhost:5000/api/reservas?id_usuario=${idUsuario}`);
            setMinhasReservas(resposta.data);
        } catch (erro) {
            console.error("Erro ao buscar reservas: ", erro);
        }
    };

    const handleCancelar = async (idReserva) => {
        if (!window.confirm("Tem certeza que deseja cancelar esta reserva?")) return;

        try {
            await axios.delete(`http://localhost:5000/api/reservas/${idReserva}`);
            alert("Reserva cancelada!");
            carregarMinhasReservas(usuario.id);
        } catch (erro) {
            alert("Erro ao cancelar: " + erro.message);
        }
    };

    useEffect(() => {
        const usuarioSalvo = localStorage.getItem('usuario');
        if (!usuarioSalvo) {
            navigate('/login');
        } else {
            try {
                const usuarioConvertido = JSON.parse(usuarioSalvo);
                setUsuario(usuarioConvertido);

                carregarSalas();
                carregarMinhasReservas(usuarioConvertido.id);
            } catch (e) {
                localStorage.removeItem('usuario');
                navigate('/login');
            }
        }
    }, []);

    const abrirReserva = (sala) => {
        setSalaSelecionada(sala);
        setData('');
        setInicio('');
        setFim('');
    };

    const handleReservar = async (e) => {
        e.preventDefault();

        if (!usuario) return;

        try {
            const payload = {
                id_usuario: usuario.id,
                id_sala: salaSelecionada.id,
                data_reserva: data,
                horario_inicio: inicio,
                horario_fim: fim
            };

            await axios.post('http://localhost:5000/api/reservas', payload);

            alert('Reserva realizada com sucesso!');
            setSalaSelecionada(null);

            carregarMinhasReservas(usuario.id);
        } catch (erro) {
            alert('Erro: ' + (erro.response?.data?.message || erro.message));
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('usuario');
        navigate('/login');
    };

    if (!usuario) return <div>Carregando...</div>;

    return (
        <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #ccc', paddingBottom: '10px'}}>
                <div>
                    <h1>Painel do Professor</h1>
                    <p>Bem-vindo, <strong>{usuario.nome}</strong> (ID: {usuario.id})</p>
                </div>
                <button onClick={handleLogout} style={{ backgroundColor: '#666', color: 'white', padding: '5px 15px' }}>
                    Sair
                </button>
            </div>

            <div style={{ display: 'flex', gap: '40px', alignItems: 'felx-start'}}>
                <div style={{ flex:1 }}>
                    <h2>Fazer Nova Reserva</h2>

                    {salaSelecionada && (
                        <div style={{ border: '2px solid #007bff', padding: '15px', marginBottom: '20px', backgroundColor: '#eef', borderRadius: '8px' }}>
                            <h3 style={{marginTop: 0}}>Reservando: {salaSelecionada.nome}</h3>
                            <form onSubmit={handleReservar}>
                                <label>Data: </label>
                                <input type="date" value={data} onChange={e => setData(e.target.value)} required />
                                <br /><br />
                                <label>Início: </label>
                                <input type="time" value={inicio} onChange={e => setInicio(e.target.value)} required />
                                &nbsp;&nbsp;
                                <label>Fim:</label>
                                <input type="time" value={fim} onChange={e => setFim(e.target.value)} required />
                                <br /><br />
                                <button type="submit" style={{ backgroundColor: '#007bff', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '4px', cursor: 'pointer' }}>Confirmar</button>
                                &nbsp;
                                <button type="button" onClick={() => setSalaSelecionada(null)} style={{ cursor: 'pointer', padding: '8px 15px' }}>Cancelar</button>
                            </form>
                        </div>
                    )}

                    <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                        {salas.map((sala) => (
                            <div key={sala.id} style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '15px', width: '180px', boxShadow: '2px 2px 5px rgba(0,0,0,0.1)' }}>
                                <h3 style={{marginTop: 0, fontSize: '1.1em'}}>{sala.nome}</h3>
                                <p style={{fontSize: '0.9em'}}>Capacidade: {sala.capacidade}</p>
                                <p style={{ color: '#666', fontSize: '0.9em' }}>{sala.recursos}</p>
                                <button onClick={() => abrirReserva(sala)} style={{ width: '100%', cursor: 'pointer', padding: '8px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px'}}>
                                    Reservar
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                <div style={{ flex:1, borderLeft: '1px solid #ccc',paddingLeft: '40px'}}>
                    <h2>Minhas Reservas</h2>

                    {minhasReservas.length === 0 ? (
                        <p style={{color: '#777'}}>Você não possui reservas agendadas.</p>
                    ) : (
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{backgroundColor: '#f2f2f2', textAlign: 'left'}}>
                                    <th style={{padding: '10px'}}>Data</th>
                                    <th style={{padding: '10px'}}>Sala</th>
                                    <th style={{padding: '10px'}}>Horário</th>
                                    <th style={{padding: '10px'}}>Ação</th>
                                </tr>
                            </thead>
                            <tbody>
                                {minhasReservas.map((reserva) => (
                                    <tr key={reserva.id} style={{borderBottom: '1px solid #eee'}}>
                                        <td style={{padding: '10px'}}>{new Date(reserva.data_reserva + 'T12:00:00').toLocaleDateString('pt-BR')}</td>
                                        <td style={{padding: '10px'}}><strong>{reserva.nome_sala}</strong></td>
                                        <td style={{padding: '10px'}}>{reserva.horario_inicio.slice(0, 5)} - {reserva.horario_fim.slice(0, 5)}</td>
                                        <td style={{padding: '10px'}}>
                                            <button
                                                onClick={() => handleCancelar(reserva.id)}
                                                style={{ backgroundColor: '#dc3545', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}
                                            >
                                                Cancelar
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Professor;