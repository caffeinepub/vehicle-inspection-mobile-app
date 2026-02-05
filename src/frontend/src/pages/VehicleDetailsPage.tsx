import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, ArrowRight, Car } from 'lucide-react';
import { useCreateDetailedInspection } from '../hooks/useQueries';
import { toast } from 'sonner';
import type { InspectionHeader, VehicleSpecs } from '../backend';
import { Variant_cngLpg_petrol_diesel } from '../backend';

interface VehicleDetailsPageProps {
  onNavigate: (page: 'dashboard' | 'pre-inspection-form', inspectionId?: bigint) => void;
}

export default function VehicleDetailsPage({ onNavigate }: VehicleDetailsPageProps) {
  const [formData, setFormData] = useState({
    refNo: '',
    company: '',
    vehicleNo: '',
    customerName: '',
    customerAddress: '',
    dealerAgent: '',
    inspectionPlace: '',
    inspectionDate: new Date().toISOString().split('T')[0],
    inspectionTime: new Date().toTimeString().slice(0, 5),
    chassisNo: '',
    engineNo: '',
    modelVariant: '',
    color: '',
    yearOfManufacturing: '',
    odometerReading: '',
    oldPolicyFrom: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const createInspection = useCreateDetailedInspection();

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.vehicleNo.trim()) newErrors.vehicleNo = 'Vehicle number is required';
    if (!formData.customerName.trim()) newErrors.customerName = 'Customer name is required';
    if (!formData.chassisNo.trim()) newErrors.chassisNo = 'Chassis number is required';
    if (!formData.engineNo.trim()) newErrors.engineNo = 'Engine number is required';
    if (!formData.modelVariant.trim()) newErrors.modelVariant = 'Model/Variant is required';
    if (!formData.odometerReading.trim()) {
      newErrors.odometerReading = 'Odometer reading is required';
    } else if (!/^\d+$/.test(formData.odometerReading)) {
      newErrors.odometerReading = 'Odometer must be a valid number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast.error('Please fill in all required fields correctly');
      return;
    }

    try {
      const header: InspectionHeader = {
        refNo: formData.refNo.trim(),
        company: formData.company.trim(),
        vehicleNo: formData.vehicleNo.trim(),
        customerName: formData.customerName.trim(),
        customerAddress: formData.customerAddress.trim(),
        dealerAgent: formData.dealerAgent.trim(),
        inspectionPlace: formData.inspectionPlace.trim(),
        inspectionDate: formData.inspectionDate,
        inspectionTime: formData.inspectionTime,
        recommendedForInsurance: true,
      };

      const vehicleSpecs: VehicleSpecs = {
        oldPolicyFrom: formData.oldPolicyFrom.trim(),
        chassisNo: formData.chassisNo.trim(),
        engineNo: formData.engineNo.trim(),
        modelVariant: formData.modelVariant.trim(),
        color: formData.color.trim(),
        fuelType: Variant_cngLpg_petrol_diesel.petrol,
        yearOfManufacturing: formData.yearOfManufacturing.trim(),
        odometerReading: BigInt(formData.odometerReading),
      };

      const inspectionId = await createInspection.mutateAsync({ header, vehicleSpecs });
      toast.success('Vehicle details saved successfully!');
      onNavigate('pre-inspection-form', inspectionId);
    } catch (error: any) {
      console.error('Error creating inspection:', error);
      toast.error('Failed to create inspection. Please try again.');
    }
  };

  return (
    <div className="flex-1 bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <div className="container max-w-3xl mx-auto p-4 py-8 space-y-6">
        <Button variant="ghost" onClick={() => onNavigate('dashboard')} className="mb-2">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>

        <Card className="shadow-lg">
          <CardHeader className="space-y-3">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <Car className="w-6 h-6 text-primary" />
            </div>
            <CardTitle className="text-2xl">Vehicle Details</CardTitle>
            <CardDescription>
              Enter the basic vehicle and customer information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="refNo">Reference No.</Label>
                  <Input
                    id="refNo"
                    placeholder="e.g., REF-001"
                    value={formData.refNo}
                    onChange={(e) => handleChange('refNo', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company">Company</Label>
                  <Input
                    id="company"
                    placeholder="Insurance company name"
                    value={formData.company}
                    onChange={(e) => handleChange('company', e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="vehicleNo">
                  Vehicle Number <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="vehicleNo"
                  placeholder="e.g., ABC-1234"
                  value={formData.vehicleNo}
                  onChange={(e) => handleChange('vehicleNo', e.target.value)}
                  className={errors.vehicleNo ? 'border-destructive' : ''}
                />
                {errors.vehicleNo && (
                  <p className="text-sm text-destructive">{errors.vehicleNo}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="customerName">
                  Customer Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="customerName"
                  placeholder="Full name"
                  value={formData.customerName}
                  onChange={(e) => handleChange('customerName', e.target.value)}
                  className={errors.customerName ? 'border-destructive' : ''}
                />
                {errors.customerName && (
                  <p className="text-sm text-destructive">{errors.customerName}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="customerAddress">Customer Address</Label>
                <Input
                  id="customerAddress"
                  placeholder="Full address"
                  value={formData.customerAddress}
                  onChange={(e) => handleChange('customerAddress', e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dealerAgent">Dealer / Agent</Label>
                  <Input
                    id="dealerAgent"
                    placeholder="Dealer name"
                    value={formData.dealerAgent}
                    onChange={(e) => handleChange('dealerAgent', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="inspectionPlace">Inspection Place</Label>
                  <Input
                    id="inspectionPlace"
                    placeholder="Location"
                    value={formData.inspectionPlace}
                    onChange={(e) => handleChange('inspectionPlace', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="inspectionDate">Inspection Date</Label>
                  <Input
                    id="inspectionDate"
                    type="date"
                    value={formData.inspectionDate}
                    onChange={(e) => handleChange('inspectionDate', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="inspectionTime">Inspection Time</Label>
                  <Input
                    id="inspectionTime"
                    type="time"
                    value={formData.inspectionTime}
                    onChange={(e) => handleChange('inspectionTime', e.target.value)}
                  />
                </div>
              </div>

              <div className="pt-4 border-t">
                <h3 className="font-semibold mb-4">Vehicle Specifications</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="chassisNo">
                      Chassis No. <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="chassisNo"
                      placeholder="e.g., CHS987654321"
                      value={formData.chassisNo}
                      onChange={(e) => handleChange('chassisNo', e.target.value)}
                      className={errors.chassisNo ? 'border-destructive' : ''}
                    />
                    {errors.chassisNo && (
                      <p className="text-sm text-destructive">{errors.chassisNo}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="engineNo">
                      Engine No. <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="engineNo"
                      placeholder="e.g., ENG123456789"
                      value={formData.engineNo}
                      onChange={(e) => handleChange('engineNo', e.target.value)}
                      className={errors.engineNo ? 'border-destructive' : ''}
                    />
                    {errors.engineNo && (
                      <p className="text-sm text-destructive">{errors.engineNo}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="modelVariant">
                        Model / Variant <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="modelVariant"
                        placeholder="e.g., Toyota Camry 2020"
                        value={formData.modelVariant}
                        onChange={(e) => handleChange('modelVariant', e.target.value)}
                        className={errors.modelVariant ? 'border-destructive' : ''}
                      />
                      {errors.modelVariant && (
                        <p className="text-sm text-destructive">{errors.modelVariant}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="color">Color</Label>
                      <Input
                        id="color"
                        placeholder="e.g., White"
                        value={formData.color}
                        onChange={(e) => handleChange('color', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="yearOfManufacturing">Year of Manufacturing</Label>
                      <Input
                        id="yearOfManufacturing"
                        placeholder="e.g., 2020"
                        value={formData.yearOfManufacturing}
                        onChange={(e) => handleChange('yearOfManufacturing', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="odometerReading">
                        Odometer Reading (km) <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="odometerReading"
                        type="text"
                        inputMode="numeric"
                        placeholder="e.g., 45000"
                        value={formData.odometerReading}
                        onChange={(e) => handleChange('odometerReading', e.target.value)}
                        className={errors.odometerReading ? 'border-destructive' : ''}
                      />
                      {errors.odometerReading && (
                        <p className="text-sm text-destructive">{errors.odometerReading}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="oldPolicyFrom">Old Policy From</Label>
                    <Input
                      id="oldPolicyFrom"
                      placeholder="Previous insurance company"
                      value={formData.oldPolicyFrom}
                      onChange={(e) => handleChange('oldPolicyFrom', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t">
              <Button
                onClick={handleSubmit}
                disabled={createInspection.isPending}
                className="w-full h-11 text-base font-medium"
                size="lg"
              >
                {createInspection.isPending ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                    Saving...
                  </>
                ) : (
                  <>
                    Next: Pre-Inspection Form
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
