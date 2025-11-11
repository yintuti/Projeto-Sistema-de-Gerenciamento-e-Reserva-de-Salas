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

        sql = "DELETE FROM salas WHERE id = %s"

        cur.execute(sql, (id,))

        mysql.connection.commit()

        cur.close()

        return jsonify({"status": "sucess", "message": "Sala excluída com sucesso."})
    
    except Exception as e:
        mysql.connection.rollback()
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

if __name__ == '__main__':
    app.run(debug=True)