import { FastifyRequest, FastifyReply } from 'fastify';
import '@fastify/jwt';
declare module '@fastify/jwt' {
    interface FastifyJWT {
        payload: {
            id: string;
            email: string;
            role: string;
            tenantId: string;
        };
        user: {
            id: string;
            email: string;
            role: string;
            tenantId: string;
        };
    }
}
declare module 'fastify' {
    interface FastifyInstance {
        authenticate: any;
    }
}
export declare function authMiddleware(request: FastifyRequest, reply: FastifyReply): Promise<undefined>;
export declare function adminMiddleware(request: FastifyRequest, reply: FastifyReply): Promise<undefined>;
export declare function tenantAdminMiddleware(request: FastifyRequest, reply: FastifyReply): Promise<undefined>;
export declare function checkTenantActive(request: FastifyRequest, reply: FastifyReply): Promise<undefined>;
//# sourceMappingURL=auth.d.ts.map