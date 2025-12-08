import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-slot',
  imports: [CommonModule],
  templateUrl: './slot.html',
  styleUrl: './slot.scss',
})
export class Slot {
  @Input() url: string | null = '';
  @Input() inferior = false;
}

