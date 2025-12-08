import { Injectable, signal } from '@angular/core';
import { RegistrarCliente } from '../entity/RegistrarCliente';
import { CompletarInformacion } from '../entity/CompletarInformacion';
import { Respuesta } from '../entity/Respuesta';
import { ResultadosEntity } from '../entity/ResultadosEntity';

@Injectable({ providedIn: 'root' })
export class FormDataService {

  registrarClienteData = signal<RegistrarCliente | null>(null);
  completarInformacionData = signal<CompletarInformacion | null>(null);
  processId = signal<string | null>(null);
  entidades = signal<Respuesta | null>(null);
  resultados = signal<ResultadosEntity | null>(null);

  setRegistrarCliente(data: RegistrarCliente) {
    this.registrarClienteData.set(data);
  }

  setCompletarInformacion(data: CompletarInformacion) {
    this.completarInformacionData.set(data);
  }

  setProcesoId(data: string | null) {
    this.processId.set(data);
  }

  setEntidades(data: Respuesta | null) {
    this.entidades.set(data);
  }

  setResultados(data: ResultadosEntity) {
    this.resultados.set(data);
  }
}
