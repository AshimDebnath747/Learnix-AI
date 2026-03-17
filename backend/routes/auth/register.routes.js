import express from 'express';
import { registerUser,loginUser, logout } from '../../controllers/auth/registerUser.controller.js';
import wrapRoutes from '../../utils/wrapRoutes.js';
import { validate } from '../../middlewares/zodvalidation.js';
import { googleAuthSchema, loginSchema, registerSchema } from '../../validators/auth.validator.js';
import { googleAuthUser } from '../../controllers/auth/googleAuth.Controller.js';

const router = express.Router();

router.post('/register',validate(registerSchema),registerUser );
router.post('/login',validate(loginSchema),loginUser)
router.post('/google',validate(googleAuthSchema),googleAuthUser)
router.post('/logout',logout)

export default wrapRoutes(router);