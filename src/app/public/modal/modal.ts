import { Component } from '@angular/core';
import { RouterModule } from "@angular/router";
import { NavModal } from '../../components/nav-modal/nav-modal';

@Component({
  selector: 'app-modal',
  imports: [RouterModule, NavModal],
  templateUrl: './modal.html',
  styleUrl: './modal.scss',
})
export class Modal {

}
