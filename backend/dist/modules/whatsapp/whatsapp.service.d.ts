export declare class WhatsAppService {
    createInstance(tenantId: string, name: string): Promise<{
        id: string;
        tenantId: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.InstanceStatus;
        instanceName: string;
        phoneNumber: string | null;
        profileName: string | null;
        profilePic: string | null;
    }>;
    listInstances(tenantId: string): Promise<{
        id: string;
        tenantId: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.InstanceStatus;
        instanceName: string;
        phoneNumber: string | null;
        profileName: string | null;
        profilePic: string | null;
    }[]>;
    getQrCode(instanceId: string, tenantId: string): Promise<any>;
    disconnect(instanceId: string, tenantId: string): Promise<{
        id: string;
        tenantId: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.InstanceStatus;
        instanceName: string;
        phoneNumber: string | null;
        profileName: string | null;
        profilePic: string | null;
    }>;
    deleteInstance(instanceId: string, tenantId: string): Promise<{
        success: boolean;
    }>;
    updateInstanceStatus(instanceName: string, status: string, phoneNumber?: string): Promise<{
        id: string;
        tenantId: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.InstanceStatus;
        instanceName: string;
        phoneNumber: string | null;
        profileName: string | null;
        profilePic: string | null;
    }>;
    sendMessage(instanceName: string, to: string, message: string): Promise<any>;
}
//# sourceMappingURL=whatsapp.service.d.ts.map