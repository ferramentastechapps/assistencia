"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRoutes = authRoutes;
const zod_1 = require("zod");
const auth_service_1 = require("./auth.service");
async function authRoutes(app) {
    const authService = new auth_service_1.AuthService();
    const registerSchema = zod_1.z.object({
        name: zod_1.z.string().min(2),
        email: zod_1.z.string().email(),
        password: zod_1.z.string().min(8),
        companyName: zod_1.z.string().min(2)
    });
    const loginSchema = zod_1.z.object({
        email: zod_1.z.string().email(),
        password: zod_1.z.string()
    });
    // POST /auth/register — Criar nova conta (tenant + admin)
    app.post('/auth/register', async (request, reply) => {
        const body = registerSchema.parse(request.body);
        const result = await authService.register(body);
        return reply.code(201).send(result);
    });
    const googleLoginSchema = zod_1.z.object({
        credential: zod_1.z.string().min(10)
    });
    // POST /auth/google — Login / Cadastro instantâneo com Google
    app.post('/auth/google', async (request, reply) => {
        const { credential } = googleLoginSchema.parse(request.body);
        const result = await authService.loginWithGoogle(credential, app);
        return reply.send(result);
    });
    // POST /auth/login
    app.post('/auth/login', async (request, reply) => {
        const { email, password } = loginSchema.parse(request.body);
        const result = await authService.login(email, password, app);
        return reply.send(result);
    });
    // GET /auth/me — Dados do usuário logado
    app.get('/auth/me', {
        preHandler: [app.authenticate]
    }, async (request, reply) => {
        const result = await authService.getMe(request.user.id);
        return reply.send(result);
    });
    // POST /auth/refresh — Renovar token
    app.post('/auth/refresh', {
        preHandler: [app.authenticate]
    }, async (request, reply) => {
        const user = request.user;
        const token = app.jwt.sign({
            id: user.id,
            email: user.email,
            role: user.role,
            tenantId: user.tenantId
        }, { expiresIn: '7d' });
        return reply.send({ token });
    });
}
//# sourceMappingURL=auth.routes.js.map