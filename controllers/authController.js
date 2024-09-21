const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const postgre = require('../database'); // Conexión a la base de datos

const authController = {
  register: async (req, res) => {
    try {
      const { username, password } = req.body;

      // Hashear la contraseña
      const hashedPassword = await bcrypt.hash(password, 10);

      // Insertar usuario en la base de datos
      const sql = 'INSERT INTO users(username, password) VALUES($1, $2) RETURNING *';
      const { rows } = await postgre.query(sql, [username, hashedPassword]);

      // Generar el token JWT
      const token = jwt.sign({ username: rows[0].username }, process.env.JWT_SECRET, { expiresIn: '1h' });

      // Enviar respuesta exitosa con el token
      res.json({ msg: 'Registro exitoso', token });
    } catch (error) {
      console.error('Error en el registro:', error);
      res.status(500).json({ msg: 'Error en el registro', error: error.message });
    }
  },

  login: async (req, res) => {
    try {
      const { username, password } = req.body;

      // Buscar el usuario en la base de datos
      const sql = 'SELECT * FROM users WHERE username = $1';
      const { rows } = await postgre.query(sql, [username]);

      // Si no se encuentra el usuario
      if (rows.length === 0) {
        return res.status(401).json({ error: 'Credenciales incorrectas' });
      }

      const user = rows[0];

      // Verificar la contraseña
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ error: 'Credenciales incorrectas' });
      }

      // Generar el token JWT
      const token = jwt.sign({ username: user.username }, process.env.JWT_SECRET, { expiresIn: '1h' });

      // Enviar el token como respuesta
      res.json({msg: 'login exitoso',  token });
    } catch (error) {
      console.error('Error en el login:', error);
      res.status(500).json({ msg: 'Error en el login', error: error.message });
    }
  },

  logout: async(req, res) => {
    res.json({ message: 'Sesión finalizada' });
  }
};

module.exports = authController;

