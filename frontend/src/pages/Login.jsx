import { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

function Login() {
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');

    const handleSubmitLogin = async (event) => {
        event.preventDefault();

        try {
            const resposta = await axios.post(
                'http://localhost:5000/api/login',
                { email, senha }
            );
            console.log('Resposta do back-end:', resposta.data);
            alert('Login bem-sucedido. Bem-vindo, ' + resposta.data.usuario.nome);
        } catch (erro) {
            console.error('Erro no login:', erro);
            alert('Falha no Login: ' + erro.response.data.message);
        }
    };

    return (
        <div>
            <h1>Página de Login</h1>

            <form onSubmit={handleSubmitLogin}>
                <div>
                    <label>Email:</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>Senha:</label>
                    <input
                        type="password"
                        value={senha}
                        onChange={(e) => setSenha(e.target.value)}
                        required
                    />
                </div>
                <button type="submit">Entrar</button>
            </form>
            <p>
                Não tem uma conta? <Link to="/cadastro">Cadastre-se aqui!</Link>
            </p>
        </div>
    );
}
export default Login;