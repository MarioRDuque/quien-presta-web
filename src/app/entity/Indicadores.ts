export class Indicadores {
    succeeded: boolean;
    data: {
        datos: number,
        prestamos: number,
        evaluaciones: number,
        tasaaprobacion: number,
        rechazos: number
    } | null;
    message: string;

    constructor(values: Partial<Indicadores> = {}) {
        this.succeeded = values.succeeded ?? false;
        this.message = values.message ?? '';
        this.data = values.data ?? null;
    }
}