export class Logo {
    succeeded: boolean;
    data: [
        {
            codigo: string;
            nombre: string;
            logo: string;
        }
    ] | null;
    message: string;

    constructor(values: Partial<Logo> = {}) {
        this.succeeded = values.succeeded ?? false;
        this.message = values.message ?? '';
        this.data = values.data ?? null;
    }
}