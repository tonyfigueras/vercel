const postgre = require('../database');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const bookController = {
    register: async (req, res) => {
        try {
          const { username, password } = req.body;
    
          // Hashear la contraseña
          const hashedPassword = await bcrypt.hash(password, 10);
    
          // Insertar usuario en la base de datos
          const sql = 'INSERT INTO users(username, password) VALUES($1, $2) RETURNING *';
          const { rows } = await postgre.query(sql, [username, hashedPassword]);
    
          // Generar el token JWT
    //      const token = jwt.sign({ username: rows[0].username }, "6666ret", { expiresIn: '1h' });
    
          // Enviar respuesta exitosa con el token
          res.json({ msg: 'Registro exitoso', username: rows[0].username });
        } catch (error) {
          console.error('Error en el registro:', error);
          res.status(500).json({ msg: 'Error en el registro', error: error.message });
        }
      },
    getAll: async(req, res) => {
        try {
            const { rows } = await postgre.query("select * from books")
            res.json({msg: "OK", data: rows})
        } catch (error) {
            res.json({msg: error.msg})
        }
    },
    getById: async(req, res) => {
        try {
            const { rows } = await postgre.query("select * from books where book_id = $1", [req.params.id])

            if (rows[0]) {
                return res.json({msg: "OK", data: rows})
            }

            res.status(404).json({msg: "not found"})
        } catch (error) {
            res.json({msg: error.msg})
        }
    },
    create: async(req, res) => {
        try {
            const { name, price } = req.body

            const sql = 'INSERT INTO books(name, price) VALUES($1, $2) RETURNING *'

            const { rows } = await postgre.query(sql, [name, price])

            res.json({msg: "OK", data: rows[0]})

        } catch (error) {
            res.json({msg: error.msg})
        }
    },
    updateById: async(req, res) => {
        try {
            const { name, price } = req.body

            const sql = 'UPDATE books set name = $1, price = $2 where book_id = $3 RETURNING *'

            const { rows } = await postgre.query(sql, [name, price, req.params.id])

            res.json({msg: "OK", data: rows[0]})

        } catch (error) {
            res.json({msg: error.msg})
        }
    },
    deleteById: async(req, res) => {
        try {
            const sql = 'DELETE FROM books where book_id = $1 RETURNING *'

            const { rows } = await postgre.query(sql, [req.params.id])

            if (rows[0]) {
                return res.json({msg: "OK", data: rows[0]})
            }

            return res.status(404).json({msg: "not found"})
            

        } catch (error) {
            res.json({msg: error.msg})
        }
    },
    login: async (req, res) => {
        try {
          res.json({msg: 'login exitoso' });
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
}

module.exports = bookController