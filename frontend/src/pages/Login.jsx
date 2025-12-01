import { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

function Login() {
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');

    const navigate = useNavigate();

    const handleSubmitLogin = async (event) => {
        event.preventDefault();

        try {
            const resposta = await axios.post(
                'http://localhost:5000/api/login',
                { email, senha }
            );

            const usuarioLogado = resposta.data.usuario;

            localStorage.setItem('usuario', JSON.stringify(usuarioLogado));

            alert('Bem-vindo, ' + usuarioLogado.nome + '!');

            if (usuarioLogado.tipo === 'admin') {
                navigate('/admin');
            } else {
                navigate('/professor');
            }
            
        } catch (erro) {
            console.error("Erro detalhado:", erro);

            if (erro.response) {
                alert('Falha no login: ' + erro.response.data.message);
            } else if (erro.request) {
                alert('Falha no login: Não foi possível conectar ao servidor.');
            } else {
                alert('Erro interno no React:' + erro.message);
            }
        }
    };

    return (
        <div style={{ padding: '20px', maxWidth: '400px', margin: 'auto' }}>
            <h1>Acesso ao Sistema</h1>

            <form onSubmit={handleSubmitLogin} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div>
                    <label>Email:</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        style={{ width: '100%', padding: '8px' }}
                    />
                </div>
                <div>
                    <label>Senha:</label>
                    <input
                        type="password"
                        value={senha}
                        onChange={(e) => setSenha(e.target.value)}
                        required
                        style={{ width: '100%', padding: '8px' }}
                    />
                </div>
                <button type="submit" style={{ padding: '10px', backgroundColor: '#007bff', color: 'white', border: 'none', cursor: 'pointer' }}>
                    Entrar
                </button>
            </form>

            <p style={{ marginTop: '15px' }}>
                Não tem uma conta? <Link to="/cadastro">Cadastre-se aqui!</Link>
            </p>
        </div>
    );
}
export default Login;