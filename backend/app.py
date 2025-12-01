from flask import Flask, jsonify, request
from flask_mysql_connector import MySQL
from flask_cors import CORS
from dotenv import load_dotenv
import os
from flask_bcrypt import Bcrypt

load_dotenv()

app = Flask(__name__)

CORS(app)

app.config['MYSQL_HOST'] = os.getenv('DB_HOST')
app.config['MYSQL_USER'] = os.getenv('DB_USER')
app.config['MYSQL_PASSWORD'] = os.getenv('DB_PASSWORD')
app.config['MYSQL_DATABASE'] = os.getenv('DB_NAME')

mysql = MySQL(app)
bcrypt = Bcrypt(app)

@app.route('/')
def index():
    try:
        cur = mysql.connection.cursor(dictionary=True)

        cur.execute("SELECT * FROM salas")

        salas = cur.fetchall()

        cur.close()

        return jsonify(salas)

    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/api/salas', methods=['GET'])
def get_salas():
    try:
        cur = mysql.connection.cursor(dictionary=True)

        cur.execute("SELECT * FROM salas")

        salas = cur.fetchall()

        cur.close()

        return jsonify(salas)
    
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500
    
@app.route('/api/salas', methods=['POST'])
def create_sala():
    try:
        dados = request.get_json()

        nome = dados['nome']
        capacidade = dados['capacidade']
        recursos = dados.get('recursos', '')

        cur = mysql.connection.cursor()

        sql = "INSERT INTO salas (nome, capacidade, recursos) VALUES (%s, %s, %s)"

        cur.execute(sql, (nome, capacidade, recursos))

        mysql.connection.commit()

        cur.close()

        return jsonify({"status": "sucess", "message": "Sala cadastrada com sucesso."})
    
    except Exception as e:
        mysql.connection.rollback()
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/api/salas/<int:id>', methods=['DELETE'])
def delete_sala(id):
    try:
        cur = mysql.connection.cursor()

        sql_reservas = "DELETE FROM reservas WHERE id_sala = %s"
        cur.execute(sql_reservas, (id,))

        sql_sala = "DELETE FROM salas WHERE id = %s"
        cur.execute(sql_sala, (id,))

        mysql.connection.commit()
        cur.close()

        return jsonify({"status": "sucess", "message": "Sala excluída com sucesso."})
    
    except Exception as e:
        mysql.connection.rollback()
        print(f"ERRO AO DELETAR SALA: {e}")
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/api/salas/<int:id>', methods=['PUT'])
def update_sala(id):
    try:
        dados = request.get_json()

        nome = dados['nome']
        capacidade = dados['capacidade']
        recursos = dados.get('recursos', '')

        cur = mysql.connection.cursor()

        sql = "UPDATE salas SET nome = %s, capacidade = %s, recursos = %s WHERE id = %s"

        cur.execute(sql, (nome, capacidade, recursos, id))

        mysql.connection.commit()

        cur.close()

        return jsonify({"status": "success", "message": "Sala atualizada com sucesso."})
    
    except Exception as e:
        mysql.connection.rollback()
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/api/cadastro', methods=['POST'])
def cadastro_professor():
    try:
        dados = request.get_json()
        nome = dados['nome']
        email = dados['email']
        senha_pura = dados['senha']

        cur = mysql.connection.cursor(dictionary=True)

        sql_check = "SELECT * FROM usuarios WHERE email = %s"
        cur.execute(sql_check, (email,))
        usuario_existente = cur.fetchone()

        if usuario_existente:
            cur.close()
            return jsonify({"status": "error", "message": "Este e-mail já está cadastrado."})
        
        senha_hash = bcrypt.generate_password_hash(senha_pura).decode('utf-8')

        sql_insert = "INSERT INTO usuarios (nome, email, senha, tipo) VALUES (%s, %s, %s, 'professor')"
        cur.execute(sql_insert, (nome, email, senha_hash))

        mysql.connection.commit()

        cur.close()

        return jsonify({"status": "success", "message": "Professor cadastrado com sucesso."})
    
    except Exception as e:
        mysql.connection.rollback()
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/api/login', methods=['POST'])
def login():
    try:
        dados = request.get_json()
        email = dados['email']
        senha_pura = dados['senha']

        cur = mysql.connection.cursor(dictionary=True)

        sql = "SELECT * FROM usuarios WHERE email = %s"
        cur.execute(sql, (email,))
        usuario = cur.fetchone()

        cur.close()

        if not usuario:
            return jsonify({"status": "error", "message": "E-mail ou senha inválidos"}), 401
        
        if not bcrypt.check_password_hash(usuario['senha'], senha_pura):
            return jsonify({"status": "error", "message": "E-mail ou senha inválidos"}), 401
        
        return jsonify({
            "status": "success",
            "message": "Login bem-sucedido.",
            "usuario": {
                "id": usuario['id'],
                "nome": usuario['nome'],
                "email": usuario['email'],
                "tipo": usuario['tipo']
            }
        })
    
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/api/reservas', methods=['POST'])
def create_reserva():
    try:
        dados = request.get_json()
        id_usuario = dados['id_usuario']
        id_sala = dados['id_sala']
        data_reserva = dados['data_reserva']
        horario_inicio = dados['horario_inicio']
        horario_fim = dados['horario_fim']

        cur = mysql.connection.cursor(dictionary=True)

        sql_check = """
            SELECT * FROM reservas
            WHERE id_sala = %s
            AND data_reserva = %s
            AND (
                (horario_inicio < %s AND horario_fim > %s) OR
                (horario_inicio < %s AND horario_fim > %s) OR
                (horario_inicio >= %s AND horario_fim <= %s)
            )
        """

        cur.execute(sql_check, (id_sala, data_reserva, horario_fim, horario_inicio, horario_fim, horario_inicio, horario_inicio, horario_fim))
        conflito = cur.fetchone()

        if conflito:
            cur.close()
            return jsonify({
                "status": "error",
                "message": "Horário indisponível! Já existe uma reserva neste período."
            }), 409

        sql_insert = """
            INSERT INTO reservas (id_usuario, id_sala, data_reserva, horario_inicio, horario_fim)
            VALUES (%s, %s, %s, %s, %s)
        """

        cur.execute(sql_insert, (id_usuario, id_sala, data_reserva, horario_inicio, horario_fim))

        mysql.connection.commit()
        cur.close()

        return jsonify({"status": "success", "message": "Reserva realizada com sucesso!"}), 201

    except Exception as e:
        mysql.connection.rollback()
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/api/reservas', methods=['GET'])
def get_reservas():
    try:
        data_filtro = request.args.get('data')
        id_usuario_filtro = request.args.get('id_usuario')

        cur = mysql.connection.cursor(dictionary=True)

        sql = """
            SELECT 
                r.id,
                r.data_reserva,
                r.horario_inicio,
                r.horario_fim,
                r.id_usuario,
                r.id_sala,
                s.nome AS nome_sala
            FROM reservas r
            JOIN salas s ON r.id_sala = s.id
            WHERE 1=1
        """
        params = []

        if data_filtro:
            sql += " AND r.data_reserva = %s"
            params.append(data_filtro)

        if id_usuario_filtro:
            sql += " AND r.id_usuario = %s"
            params.append(id_usuario_filtro)

        sql += " ORDER BY r.data_reserva, r.horario_inicio"

        cur.execute(sql, tuple(params))
        resultados = cur.fetchall()
        cur.close()
        reservas_formatadas = []

        for item in resultados:
            reservas_formatadas.append({
                "id": item['id'],
                "id_usuario": item['id_usuario'],
                "id_sala": item['id_sala'],
                "nome_sala": item['nome_sala'],
                "data_reserva": str(item['data_reserva']),
                "horario_inicio": str(item['horario_inicio']),
                "horario_fim": str(item['horario_fim'])
            })

        return jsonify(reservas_formatadas)
    except Exception as e:
        print(f"ERRO BACKEND: {e}")
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/api/reservas/<int:id>', methods=['DELETE'])
def delete_reserva(id):
    try:
        cur = mysql.connection.cursor()

        sql = "DELETE FROM reservas WHERE id = %s"
        cur.execute(sql, (id,))

        mysql.connection.commit()
        cur.close()

        return jsonify({"status": "success", "message": "Reserva cancelada com sucesso."})
    except Exception as e:
        mysql.connection.rollback()
        return jsonify({"status": "error", "message": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)