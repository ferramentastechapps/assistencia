export declare class EvolutionClient {
    private client;
    constructor();
    createInstance(instanceName: string, webhookUrl: string): Promise<any>;
    deleteInstance(instanceName: string): Promise<any>;
    getInstanceInfo(instanceName: string): Promise<any>;
    getAllInstances(): Promise<any>;
    getQrCode(instanceName: string): Promise<any>;
    sendText(instanceName: string, to: string, message: string): Promise<any>;
    sendTyping(instanceName: string, to: string, durationMs?: number): Promise<void>;
    sendButtons(instanceName: string, to: string, text: string, buttons: Array<{
        id: string;
        title: string;
    }>): Promise<any>;
    sendList(instanceName: string, to: string, title: string, sections: Array<{
        title: string;
        rows: Array<{
            id: string;
            title: string;
            description?: string;
        }>;
    }>): Promise<any>;
    getProfilePicture(instanceName: string, number: string): Promise<any>;
    getMediaBase64(instanceName: string, messageData: any): Promise<string | null>;
    sendMedia(instanceName: string, to: string, mediaUrlOrBase64: string, mediatype?: 'image' | 'audio' | 'document', caption?: string, fileName?: string): Promise<any>;
    logout(instanceName: string): Promise<any>;
}
export declare const evolutionClient: EvolutionClient;
//# sourceMappingURL=evolution.client.d.ts.map