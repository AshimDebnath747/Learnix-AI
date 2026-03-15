import express from 'express';
import { registerUser,loginUser, logout } from '../../controllers/auth/registerUser.controller.js';
import wrapRoutes from '../../utils/wrapRoutes.js';
import { validate } from '../../middlewares/zodvalidation.js';
import { loginSchema, registerSchema } from '../../validators/auth.validator.js';

const router = express.Router();

router.post('/register',validate(registerSchema),registerUser );
router.post('/login',validate(loginSchema),loginUser)
router.post('/logout',logout)

export default wrapRoutes(router);