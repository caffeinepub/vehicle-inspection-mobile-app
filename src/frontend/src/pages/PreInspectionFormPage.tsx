import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, ArrowRight, ClipboardCheck, Camera } from 'lucide-react';
import { toast } from 'sonner';
import { useGetDetailedInspectionById, useSavePreInspectionForm } from '../hooks/useQueries';
import PartsChecklistTable from '../components/preInspection/PartsChecklistTable';
import GlassStatusTable from '../components/preInspection/GlassStatusTable';
import AccessoriesSection from '../components/preInspection/AccessoriesSection';
import YesNoField from '../components/preInspection/YesNoField';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { PartChecklist, GlassStatus, ElectricalAccessory, NonElectricalAccessory, PreviousInsuranceDetails, Declaration } from '../backend';
import { Variant_cngLpg_petrol_diesel } from '../backend';

interface PreInspectionFormPageProps {
  inspectionId: bigint | null;
  onNavigate: (page: 'dashboard' | 'vehicle-details' | 'photo-capture') => void;
}

export default function PreInspectionFormPage({ inspectionId, onNavigate }: PreInspectionFormPageProps) {
  const { data: inspection, isLoading } = useGetDetailedInspectionById(inspectionId);
  const saveForm = useSavePreInspectionForm();

  const [recommendedForInsurance, setRecommendedForInsurance] = useState(true);
  const [fuelType, setFuelType] = useState<Variant_cngLpg_petrol_diesel>(Variant_cngLpg_petrol_diesel.petrol);
  const [partsChecklist, setPartsChecklist] = useState<PartChecklist[]>([]);
  const [glasses, setGlasses] = useState<GlassStatus[]>([]);
  const [electricalAccessories, setElectricalAccessories] = useState<ElectricalAccessory[]>([]);
  const [nonElectricalAccessories, setNonElectricalAccessories] = useState<NonElectricalAccessory[]>([]);
  const [previousInsurance, setPreviousInsurance] = useState<PreviousInsuranceDetails>({
    insuranceCompany: '',
    policyNumber: '',
    expiryDate: '',
    numOfClaims: BigInt(0),
    timeLapse: '',
  });
  const [declaration, setDeclaration] = useState<Declaration>({
    proposerName: '',
    surveyorName: '',
    signatureDate: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    if (!inspectionId) {
      toast.error('No inspection ID found');
      onNavigate('dashboard');
    }
  }, [inspectionId, onNavigate]);

  useEffect(() => {
    if (inspection) {
      setRecommendedForInsurance(inspection.header.recommendedForInsurance);
      setFuelType(inspection.vehicleSpecs.fuelType);
      setPartsChecklist(inspection.partsChecklist);
      setGlasses(inspection.glasses);
      setElectricalAccessories(inspection.electricalAccessories);
      setNonElectricalAccessories(inspection.nonElectricalAccessories);
      setPreviousInsurance(inspection.previousInsurance);
      setDeclaration(inspection.declaration);
    }
  }, [inspection]);

  const handleNext = async () => {
    if (!inspectionId) {
      toast.error('No inspection ID found');
      return;
    }

    try {
      await saveForm.mutateAsync({
        inspectionId,
        recommendedForInsurance,
        fuelType,
        partsChecklist,
        glasses,
        electricalAccessories,
        nonElectricalAccessories,
        previousInsurance,
        declaration,
      });

      toast.success('Pre-inspection form saved successfully!');
      onNavigate('photo-capture');
    } catch (error: any) {
      console.error('Error saving form:', error);
      toast.error('Failed to save form. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
          <p className="text-muted-foreground">Loading inspection data...</p>
        </div>
      </div>
    );
  }

  if (!inspection) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive">Inspection not found</p>
          <Button onClick={() => onNavigate('dashboard')} className="mt-4">
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <div className="container max-w-5xl mx-auto p-4 py-8 space-y-6">
        <Button variant="ghost" onClick={() => onNavigate('vehicle-details')} className="mb-2">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <Card className="shadow-lg">
          <CardHeader className="space-y-3">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <ClipboardCheck className="w-6 h-6 text-primary" />
            </div>
            <CardTitle className="text-2xl">Pre-Inspection Format Car</CardTitle>
            <CardDescription>
              Complete the detailed inspection checklist
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="space-y-4">
              <h3 className="font-semibold text-lg border-b pb-2">Recommendation</h3>
              <YesNoField
                label="Recommended for Insurance"
                value={recommendedForInsurance}
                onChange={setRecommendedForInsurance}
              />
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-lg border-b pb-2">Fuel Type</h3>
              <div className="space-y-2">
                <Label>Select Fuel Type</Label>
                <Select
                  value={fuelType}
                  onValueChange={(value) => setFuelType(value as Variant_cngLpg_petrol_diesel)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={Variant_cngLpg_petrol_diesel.petrol}>Petrol</SelectItem>
                    <SelectItem value={Variant_cngLpg_petrol_diesel.diesel}>Diesel</SelectItem>
                    <SelectItem value={Variant_cngLpg_petrol_diesel.cngLpg}>CNG/LPG</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-lg border-b pb-2">Parts Checklist</h3>
              <PartsChecklistTable
                parts={partsChecklist}
                onChange={setPartsChecklist}
              />
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-lg border-b pb-2">Glasses</h3>
              <GlassStatusTable
                glasses={glasses}
                onChange={setGlasses}
              />
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-lg border-b pb-2">Accessories</h3>
              <AccessoriesSection
                electricalAccessories={electricalAccessories}
                nonElectricalAccessories={nonElectricalAccessories}
                onElectricalChange={setElectricalAccessories}
                onNonElectricalChange={setNonElectricalAccessories}
              />
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-lg border-b pb-2">Previous Insurance Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="insuranceCompany">Insurance Company</Label>
                  <Input
                    id="insuranceCompany"
                    value={previousInsurance.insuranceCompany}
                    onChange={(e) =>
                      setPreviousInsurance({ ...previousInsurance, insuranceCompany: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="policyNumber">Policy Number</Label>
                  <Input
                    id="policyNumber"
                    value={previousInsurance.policyNumber}
                    onChange={(e) =>
                      setPreviousInsurance({ ...previousInsurance, policyNumber: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expiryDate">Expiry Date</Label>
                  <Input
                    id="expiryDate"
                    type="date"
                    value={previousInsurance.expiryDate}
                    onChange={(e) =>
                      setPreviousInsurance({ ...previousInsurance, expiryDate: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="numOfClaims">Number of Claims</Label>
                  <Input
                    id="numOfClaims"
                    type="number"
                    min="0"
                    value={previousInsurance.numOfClaims.toString()}
                    onChange={(e) =>
                      setPreviousInsurance({
                        ...previousInsurance,
                        numOfClaims: BigInt(e.target.value || 0),
                      })
                    }
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="timeLapse">Time Lapse</Label>
                  <Input
                    id="timeLapse"
                    placeholder="e.g., 2 years"
                    value={previousInsurance.timeLapse}
                    onChange={(e) =>
                      setPreviousInsurance({ ...previousInsurance, timeLapse: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-lg border-b pb-2">Declaration</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="proposerName">Proposer Name</Label>
                  <Input
                    id="proposerName"
                    value={declaration.proposerName}
                    onChange={(e) =>
                      setDeclaration({ ...declaration, proposerName: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="surveyorName">Surveyor Name</Label>
                  <Input
                    id="surveyorName"
                    value={declaration.surveyorName}
                    onChange={(e) =>
                      setDeclaration({ ...declaration, surveyorName: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signatureDate">Signature Date</Label>
                  <Input
                    id="signatureDate"
                    type="date"
                    value={declaration.signatureDate}
                    onChange={(e) =>
                      setDeclaration({ ...declaration, signatureDate: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>

            <Alert className="bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800">
              <Camera className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <AlertDescription className="text-blue-900 dark:text-blue-100">
                <strong>Next Step:</strong> After saving this form, you'll use your device camera to capture inspection photos with GPS coordinates and timestamps.
              </AlertDescription>
            </Alert>

            <div className="pt-4 border-t">
              <Button
                onClick={handleNext}
                disabled={saveForm.isPending}
                className="w-full h-11 text-base font-medium"
                size="lg"
              >
                {saveForm.isPending ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                    Saving...
                  </>
                ) : (
                  <>
                    Next: Photo Capture
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
