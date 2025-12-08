import { Routes } from "@angular/router";
import { CantidadesComponent } from "./cantidades/cantidades.component";
import { DatosContactoComponent } from "./datos-contacto/datos-contacto.component";
import { Resultados } from "./resultados/resultados.component";
import { AnalizarSolicitud } from "./analizar-solicitud/analizar-solicitud.component";
import { DatosBasicosComponent } from "./datos-basicos/datos-basicos.component";
import { Modal } from "./modal";
import { SinResultados } from "../../components/sin-resultados/sin-resultados";

export const MODAL_ROUTES: Routes = [
    {
        path: '',
        component: Modal,
        children: [
            { path: '', component: DatosBasicosComponent },
            { path: 'cantidades', component: CantidadesComponent },
            { path: 'contacto', component: DatosContactoComponent },
            { path: 'analizar', component: AnalizarSolicitud },
            { path: 'resultados', component: Resultados },
            { path: 'sinresultados', component: SinResultados },
        ]
    }
];