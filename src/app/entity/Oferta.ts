export interface Oferta {
    id?: string;
    codigoentidad: string;
    prioridad: number;
    nombre: string;
    url?: string;
    monto: string;
    plazo: string;
    tasa: string;
    resultado?: boolean;
    informacion?: string;
    descripcion?: string;
    logo?: string;
    pasos?: [
        {
            orden: number;
            titulo: string;
            descripcion: string;
        }
    ]
}