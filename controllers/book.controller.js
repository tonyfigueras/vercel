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
    }
}

module.exports = bookController