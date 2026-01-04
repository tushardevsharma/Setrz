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
    tags.push(`Fragility: ${logistics.fragility}`);
    tags.push(`Stackable: ${logistics.is_stackable ? 'Yes' : 'No'}`);
    tags.push(`Disassembly: ${logistics.requires_disassembly ? 'Yes' : 'No'}`);
    tags.push(`Priority: ${logistics.handling_priority}`);
    return tags;
  }

  sortPackagingPlan(packagingPlan: GeminiPackagingLayer[]): GeminiPackagingLayer[] {
    return packagingPlan.sort((a, b) => a.layer_order - b.layer_order);
  }

  onClose() {
    this.closeModal.emit();
  }
}
