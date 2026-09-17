export declare class AudioService {
    /**
     * Transcreve um áudio a partir de seu conteúdo em Base64 usando Whisper (Groq ou OpenAI)
     * @param base64Audio Áudio codificado em base64
     * @param mimetype Formato do áudio (ex: audio/ogg, audio/mp4, audio/mpeg)
     * @returns Texto transcrito
     */
    transcribeBase64(base64Audio: string, mimetype?: string): Promise<string>;
}
export declare const audioService: AudioService;
//# sourceMappingURL=audio.service.d.ts.map