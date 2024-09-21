const express = require("express")
const router = express.Router()
const authController = require('../controllers/auth.controller');
//const hederaController = require('../controllers/hederaController');
//const authMiddleware = require('../middleware/authMiddleware');

//router.post('/logout', authMiddleware, authController.logout);

const bookController = require('../controllers/book.controller')
router.post('/register', bookController.register);
router.post('/login', bookController.login);

router.get("/", bookController.getAll)
router.get("/:id", bookController.getById)
router.post("/", bookController.create)
router.put("/:id", bookController.updateById)
router.delete("/:id", bookController.deleteById)

module.exports = router