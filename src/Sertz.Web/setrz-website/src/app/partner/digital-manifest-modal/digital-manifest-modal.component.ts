import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GeminiAnalyzedItem, GeminiLogistics, GeminiPackagingLayer } from '../shared/models';

@Component({
  selector: 'app-digital-manifest-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './digital-manifest-modal.component.html',
  styleUrl: './digital-manifest-modal.component.scss',
})
export class DigitalManifestModalComponent {
  @Input() manifestData: GeminiAnalyzedItem[] | null = null;
  @Input() isLoading: boolean = false;
  @Output() closeModal = new EventEmitter<void>();

  getLogisticsTags(logistics: GeminiLogistics): string[] {
    const tags: string[] = [];
    if (logistics.fragility === 'High') {
      tags.push('Fragile');
    }
    if (!logistics.is_stackable) {
      tags.push('Stackable: No');
    }
    if (logistics.requires_disassembly) {
      tags.push('Disassemble: Yes');
    }
    if (logistics.handling_priority && logistics.handling_priority !== 'Standard') {
      tags.push(logistics.handling_priority);
    }
    return tags;
  }

  onClose() {
    this.closeModal.emit();
  }
}
