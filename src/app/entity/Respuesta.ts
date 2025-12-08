export class Respuesta {
    succeeded: boolean;
    message: string;
    data: {
        total: number,
        procesoid: string,
        entidades: [
            {
                id: string,
                entidad: string,
                condiciones: string,
                logo: string
            }
        ]
    } | null;

    constructor(values: Partial<Respuesta> = {}) {
        this.succeeded = values.succeeded ?? false;
        this.message = values.message ?? '';
        this.data = values.data ?? null;
    }
}