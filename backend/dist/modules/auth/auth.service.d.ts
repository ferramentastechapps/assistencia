import { FastifyInstance } from 'fastify';
export declare class AuthService {
    register(data: {
        name: string;
        email: string;
        password: string;
        companyName: string;
    }): Promise<{
        message: string;
        user: {
            id: string;
            name: string;
            email: string;
            role: import(".prisma/client").$Enums.UserRole;
        };
        tenant: {
            id: string;
            name: string;
            plan: import(".prisma/client").$Enums.Plan;
        };
    }>;
    login(email: string, password: string, app: FastifyInstance): Promise<{
        token: string;
        user: {
            id: string;
            name: string;
            email: string;
            avatarUrl: string | null;
            role: import(".prisma/client").$Enums.UserRole;
            tenant: {
                id: string;
                name: string;
                plan: import(".prisma/client").$Enums.Plan;
                isActive: boolean;
            };
        };
    }>;
    loginWithGoogle(credential: string, app: FastifyInstance): Promise<{
        token: string;
        user: {
            id: string;
            name: string;
            email: string;
            avatarUrl: string | null;
            role: import(".prisma/client").$Enums.UserRole;
            tenant: {
                id: string;
                name: string;
                plan: import(".prisma/client").$Enums.Plan;
                isActive: boolean;
            };
        };
    }>;
    getMe(userId: string): Promise<{
        tenant: {
            id: string;
            name: string;
            plan: import(".prisma/client").$Enums.Plan;
            isActive: boolean;
            apiUsage: number;
            maxMessages: number;
        };
        id: string;
        email: string;
        avatarUrl: string | null;
        name: string;
        role: import(".prisma/client").$Enums.UserRole;
        createdAt: Date;
    }>;
}
//# sourceMappingURL=auth.service.d.ts.map