export interface GeminiDimensions {
  height_cm: number;
  length_cm: number;
  width_cm: number;
}

export interface GeminiPackagingLayer {
  layer_order: number;
  primary_material_type: string;
  quantity_estimate: number;
  unit: string;
  packed_volume_m3?: number;
}

export type FragilityLevel = 'Low' | 'Medium' | 'High';

export interface GeminiLogistics {
  fragility: FragilityLevel;
  is_stackable: boolean;
  requires_disassembly: boolean;
  handling_priority: string;
}

export interface GeminiAnalyzedItem {
  item: string;
  quantity: string;
  timestamp_start: string;
  timestamp_end: string;
  dimensions: GeminiDimensions;
  packaging_plan: GeminiPackagingLayer[];
  logistics: GeminiLogistics;
  notes?: string;
}

export interface SurveyUpload {
  uploadId: string;
  status: 'Pending' | 'Processing' | 'Completed' | 'Failed';
  message: string | null;
  createdTimestamp: string;
}
