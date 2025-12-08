import { Oferta } from "./Oferta";

export class ResultadosEntity {
    succeeded: boolean;
    data: {
        entidades: number,
        evaluados: number,
        finalizo: boolean,
        resultados: Oferta[]
    } | null;
    message: string;

    constructor(values: Partial<ResultadosEntity> = {}) {
        this.succeeded = values.succeeded ?? false;
        this.message = values.message ?? '';
        this.data = values.data ?? null;
    }
}