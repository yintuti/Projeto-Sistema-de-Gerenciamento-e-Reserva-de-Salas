import { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

function Cadastro() {
    const [nome, setNome] = useState('');
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const navigate = useNavigate();
    const handleSubmitCadastro = async (event) => {
        event.preventDefault();

        try {
            await axios.post('http://localhost:5000/api/cadastro', {
                nome,
                email,
                senha
            });

            alert('Cadastro realizado com sucesso!');

            navigate('/login');
        } catch (erro) {
            if (erro.response) {
                alert('Erro no cadastro: ' + erro.response.data.message);
            } else if (erro.request) {
                alert('Erro: Não foi possível conectar ao servidor.');
            } else {
                alert('Erro desconhecido.');
            }
        }
    };

    return (
        <div>
            <h1>Criar Conta de Professor</h1>

            <form onSubmit={handleSubmitCadastro}>
                <div>
                    <label>Nome Completo:</label>
                    <br />
                    <input
                        type="text"
                        value={nome}
                        onChange={(e) => setNome(e.target.value)}
                        required
                    />
                </div>

                <div>
                    <label>E-mail:</label>
                    <br />
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>

                <div>
                    <label>Senha:</label>
                    <br />
                    <input
                        type="password"
                        value={senha}
                        onChange={(e) => setSenha(e.target.value)}
                        required
                    />
                </div>

                <br />
                <button type="submit">Cadastrar</button>
            </form>

            <p>
                Já tem uma conta? <Link to ="/login">Fazer Login</Link>
            </p>
        </div>
    );
}

export default Cadastro;