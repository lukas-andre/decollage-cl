export interface WizardFormData {
  roomTypeId: string
  roomCategory: string
  inspirationMode: 'style' | 'prompt'
  styleId: string
  customPrompt: string
  furnitureMode: string
  roomWidth: number
  roomHeight: number
  colorPaletteId: string
}

export const DEFAULT_WIZARD_FORM_DATA: WizardFormData = {
  roomTypeId: '',
  roomCategory: 'interiores',
  inspirationMode: 'style',
  styleId: '',
  customPrompt: '',
  furnitureMode: 'replace_all',
  roomWidth: 4,
  roomHeight: 4,
  colorPaletteId: ''
}
