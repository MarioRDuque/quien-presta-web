export class Publicidad {

    succeeded: boolean;
    message: string;

    data: {
        banner_superior: string | null;
        banner_inferior: string | null;
        caja: {
            orden: number;
            logo: string;
            nombre: string;
            detalles: string;
            color: string;
        }[] | null;  // <---- ahora sí es un array permitido
    } | null;

    constructor(values: Partial<Publicidad> = {}) {
        this.succeeded = values.succeeded ?? false;
        this.message = values.message ?? '';
        this.data = values.data ?? null;
    }
}
