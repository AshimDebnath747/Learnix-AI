import express from 'express';
import { registerUser,loginUser, logout, changePasswordUser } from '../../controllers/auth/registerUser.controller.js';
import wrapRoutes from '../../utils/wrapRoutes.js';
import { validate } from '../../middlewares/zodvalidation.js';
import { googleAuthSchema, loginSchema, registerSchema, changePasswordSchema } from '../../validators/auth.validator.js';
import { googleAuthUser } from '../../controllers/auth/googleAuth.Controller.js';
import checkAuthMiddleware from '../../middlewares/checkAuthMiddleware.js';

const router = express.Router();

router.post('/register',validate(registerSchema),registerUser );
router.post('/login',validate(loginSchema),loginUser)
router.post('/google',validate(googleAuthSchema),googleAuthUser)
router.post('/logout',logout)
router.post('/changepassword', checkAuthMiddleware, validate(changePasswordSchema), changePasswordUser)

export default wrapRoutes(router);