import type { DetailedInspection } from '../backend';

export function validateReport(inspection: DetailedInspection): string[] {
  const errors: string[] = [];

  if (!inspection.header.customerName.trim()) {
    errors.push('Customer name is required');
  }

  if (!inspection.header.vehicleNo.trim()) {
    errors.push('Vehicle number is required');
  }

  if (!inspection.vehicleSpecs.chassisNo.trim()) {
    errors.push('Chassis number is required');
  }

  if (!inspection.vehicleSpecs.engineNo.trim()) {
    errors.push('Engine number is required');
  }

  if (!inspection.vehicleSpecs.modelVariant.trim()) {
    errors.push('Model/Variant is required');
  }

  if (inspection.partsChecklist.length === 0) {
    errors.push('At least one part must be inspected');
  }

  if (!inspection.declaration.proposerName.trim()) {
    errors.push('Proposer name is required for declaration');
  }

  if (!inspection.declaration.surveyorName.trim()) {
    errors.push('Surveyor name is required for declaration');
  }

  return errors;
}
