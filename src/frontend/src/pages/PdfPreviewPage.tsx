import { useEffect, useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Download, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useGetDetailedInspectionById } from '../hooks/useQueries';
import { validateReport } from '../utils/reportValidation';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface PdfPreviewPageProps {
  inspectionId: bigint | null;
  onNavigate: (page: 'dashboard' | 'remarks') => void;
}

interface CapturedPhoto {
  dataUrl: string;
  gpsCoordinates: string;
  timestamp: number;
  watermarkText: string;
}

export default function PdfPreviewPage({ inspectionId, onNavigate }: PdfPreviewPageProps) {
  const [photos, setPhotos] = useState<CapturedPhoto[]>([]);
  const [pdfGenerated, setPdfGenerated] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);
  const { data: inspection, isLoading } = useGetDetailedInspectionById(inspectionId);

  useEffect(() => {
    if (!inspectionId) {
      toast.error('No inspection ID found');
      onNavigate('dashboard');
      return;
    }

    const storedPhotos = localStorage.getItem(`inspection_${inspectionId}_photos`);
    if (storedPhotos) {
      setPhotos(JSON.parse(storedPhotos));
    }
  }, [inspectionId, onNavigate]);

  const validationErrors = inspection ? validateReport(inspection) : [];
  const canGenerate = validationErrors.length === 0;

  const generatePDF = async () => {
    if (!inspection || !canGenerate) {
      toast.error('Please complete all required fields');
      return;
    }

    setPdfGenerated(true);
    toast.success('PDF report generated successfully!');
  };

  const downloadPDF = () => {
    if (!inspection || !previewRef.current) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error('Please allow pop-ups to download the PDF');
      return;
    }

    const content = previewRef.current.innerHTML;
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Pre-Inspection Format Car - ${inspection.header.vehicleNo}</title>
          <style>
            @page { size: A4; margin: 15mm; }
            body { font-family: Arial, sans-serif; font-size: 10pt; margin: 0; padding: 0; }
            .report-container { max-width: 210mm; margin: 0 auto; }
            .header-section { text-align: center; border: 2px solid #000; padding: 10px; margin-bottom: 10px; }
            .header-title { font-size: 16pt; font-weight: bold; margin-bottom: 5px; }
            .header-subtitle { font-size: 9pt; margin-bottom: 3px; }
            .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 5px; margin-bottom: 10px; border: 1px solid #000; }
            .info-row { display: flex; border-bottom: 1px solid #ccc; padding: 3px 5px; }
            .info-label { font-weight: bold; min-width: 120px; }
            .info-value { flex: 1; }
            .table-section { margin-bottom: 10px; }
            .section-title { font-weight: bold; background: #f0f0f0; padding: 5px; border: 1px solid #000; margin-bottom: 5px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 10px; }
            th, td { border: 1px solid #000; padding: 4px; text-align: left; font-size: 9pt; }
            th { background: #e0e0e0; font-weight: bold; }
            .checkbox { display: inline-block; width: 12px; height: 12px; border: 1px solid #000; margin: 0 3px; vertical-align: middle; }
            .checkbox.checked::after { content: '✓'; font-weight: bold; font-size: 10pt; }
            .signature-section { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 20px; }
            .signature-box { border-top: 1px solid #000; padding-top: 5px; text-align: center; }
            @media print { body { margin: 0; } .no-print { display: none; } }
          </style>
        </head>
        <body>
          ${content}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const handleComplete = () => {
    if (inspectionId) {
      localStorage.removeItem(`inspection_${inspectionId}_photos`);
    }
    toast.success('Inspection completed successfully!');
    onNavigate('dashboard');
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

  const getFuelTypeLabel = (fuelType: any) => {
    switch (fuelType) {
      case 'petrol': return 'Petrol';
      case 'diesel': return 'Diesel';
      case 'cngLpg': return 'CNG/LPG';
      default: return '';
    }
  };

  const getStatusLabel = (status: any) => {
    switch (status) {
      case 'safe': return 'Safe';
      case 'scratch': return 'Scratch';
      case 'pressed': return 'Pressed';
      case 'broken': return 'Broken';
      default: return '';
    }
  };

  return (
    <div className="flex-1 bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <div className="container max-w-5xl mx-auto p-4 py-8 space-y-6">
        <Button variant="ghost" onClick={() => onNavigate('remarks')} className="mb-2 no-print">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Remarks
        </Button>

        <Card className="shadow-lg">
          <CardHeader className="space-y-3 no-print">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-primary" />
            </div>
            <CardTitle className="text-2xl">PDF Report Preview</CardTitle>
            <CardDescription>
              Review your inspection report before completing
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {validationErrors.length > 0 && (
              <Alert variant="destructive" className="no-print">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <p className="font-semibold mb-2">Please complete the following required fields:</p>
                  <ul className="list-disc list-inside space-y-1">
                    {validationErrors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            <div ref={previewRef} className="bg-white rounded-lg border p-6 space-y-4 text-sm report-container">
              <div className="header-section">
                <div className="header-title">DINESH KUMAR JANGIR</div>
                <div className="header-subtitle">Surveyor & Loss Assessor</div>
                <div className="header-subtitle">Licence no. SLA-121529</div>
                <div className="header-subtitle">Validity: 26.01.2026</div>
                <div className="header-subtitle" style={{ marginTop: '8px', fontWeight: 'bold' }}>
                  Break-in survey report- Private Car
                </div>
              </div>

              <div className="info-grid">
                <div className="info-row">
                  <span className="info-label">Ref No.:</span>
                  <span className="info-value">{inspection.header.refNo}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Company:</span>
                  <span className="info-value">{inspection.header.company}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Name of Customer:</span>
                  <span className="info-value">{inspection.header.customerName}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Vehicle No.:</span>
                  <span className="info-value">{inspection.header.vehicleNo}</span>
                </div>
                <div className="info-row" style={{ gridColumn: '1 / -1' }}>
                  <span className="info-label">Address:</span>
                  <span className="info-value">{inspection.header.customerAddress}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Name of Dealer/Agent:</span>
                  <span className="info-value">{inspection.header.dealerAgent}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Inspection Place:</span>
                  <span className="info-value">{inspection.header.inspectionPlace}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Inspection Date:</span>
                  <span className="info-value">{inspection.header.inspectionDate}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Inspection Time:</span>
                  <span className="info-value">{inspection.header.inspectionTime}</span>
                </div>
                <div className="info-row" style={{ gridColumn: '1 / -1' }}>
                  <span className="info-label">Recommended for Insurance:</span>
                  <span className="info-value">
                    Yes <span className={`checkbox ${inspection.header.recommendedForInsurance ? 'checked' : ''}`}></span>
                    {' '}No <span className={`checkbox ${!inspection.header.recommendedForInsurance ? 'checked' : ''}`}></span>
                  </span>
                </div>
              </div>

              <div className="table-section">
                <div className="section-title">Details of Vehicle</div>
                <table>
                  <thead>
                    <tr>
                      <th>Part Name</th>
                      <th>Safe</th>
                      <th>Scratch</th>
                      <th>Pressed</th>
                      <th>Broken</th>
                      <th>Remarks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inspection.partsChecklist.map((part, index) => (
                      <tr key={index}>
                        <td>{part.partName}</td>
                        <td className="text-center">
                          {part.status === 'safe' && <span className="checkbox checked"></span>}
                        </td>
                        <td className="text-center">
                          {part.status === 'scratch' && <span className="checkbox checked"></span>}
                        </td>
                        <td className="text-center">
                          {part.status === 'pressed' && <span className="checkbox checked"></span>}
                        </td>
                        <td className="text-center">
                          {part.status === 'broken' && <span className="checkbox checked"></span>}
                        </td>
                        <td>{part.remarks}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="info-grid">
                <div className="info-row">
                  <span className="info-label">Old policy from:</span>
                  <span className="info-value">{inspection.vehicleSpecs.oldPolicyFrom}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Chassis No.:</span>
                  <span className="info-value">{inspection.vehicleSpecs.chassisNo}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Engine No.:</span>
                  <span className="info-value">{inspection.vehicleSpecs.engineNo}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Model-I-Variant:</span>
                  <span className="info-value">{inspection.vehicleSpecs.modelVariant}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Colour:</span>
                  <span className="info-value">{inspection.vehicleSpecs.color}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Fuel:</span>
                  <span className="info-value">
                    Petrol <span className={`checkbox ${inspection.vehicleSpecs.fuelType === 'petrol' ? 'checked' : ''}`}></span>
                    {' '}Diesel <span className={`checkbox ${inspection.vehicleSpecs.fuelType === 'diesel' ? 'checked' : ''}`}></span>
                    {' '}CNG/LPG <span className={`checkbox ${inspection.vehicleSpecs.fuelType === 'cngLpg' ? 'checked' : ''}`}></span>
                  </span>
                </div>
                <div className="info-row">
                  <span className="info-label">Yr of Manufacturing:</span>
                  <span className="info-value">{inspection.vehicleSpecs.yearOfManufacturing}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Odometer Reading in KM:</span>
                  <span className="info-value">{inspection.vehicleSpecs.odometerReading.toString()}</span>
                </div>
              </div>

              {inspection.electricalAccessories.length > 0 && (
                <div className="table-section">
                  <div className="section-title">Electrical Accessories</div>
                  <table>
                    <thead>
                      <tr>
                        <th>Name / Make</th>
                        <th>Working</th>
                        <th>Remarks</th>
                      </tr>
                    </thead>
                    <tbody>
                      {inspection.electricalAccessories.map((acc, index) => (
                        <tr key={index}>
                          <td>{acc.name}</td>
                          <td className="text-center">
                            {acc.isWorking ? 'Yes' : 'No'}
                          </td>
                          <td>{acc.remarks}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {inspection.nonElectricalAccessories.length > 0 && (
                <div className="table-section">
                  <div className="section-title">Non-Electrical Accessories</div>
                  <table>
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Present</th>
                        <th>Remarks</th>
                      </tr>
                    </thead>
                    <tbody>
                      {inspection.nonElectricalAccessories.map((acc, index) => (
                        <tr key={index}>
                          <td>{acc.name}</td>
                          <td className="text-center">
                            {acc.isPresent ? 'Yes' : 'No'}
                          </td>
                          <td>{acc.remarks}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {inspection.glasses.length > 0 && (
                <div className="table-section">
                  <div className="section-title">Glasses</div>
                  <table>
                    <thead>
                      <tr>
                        <th>Glass Name</th>
                        <th>Safe</th>
                        <th>Broken</th>
                        <th>Remarks</th>
                      </tr>
                    </thead>
                    <tbody>
                      {inspection.glasses.map((glass, index) => (
                        <tr key={index}>
                          <td>{glass.glassName}</td>
                          <td className="text-center">
                            {glass.isSafe && <span className="checkbox checked"></span>}
                          </td>
                          <td className="text-center">
                            {glass.isBroken && <span className="checkbox checked"></span>}
                          </td>
                          <td>{glass.remarks}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="table-section">
                <div className="section-title">Previous Insurance Details</div>
                <div className="info-grid">
                  <div className="info-row">
                    <span className="info-label">Insurance Company:</span>
                    <span className="info-value">{inspection.previousInsurance.insuranceCompany}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Policy Number:</span>
                    <span className="info-value">{inspection.previousInsurance.policyNumber}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Expiry Date:</span>
                    <span className="info-value">{inspection.previousInsurance.expiryDate}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">No. of Claims:</span>
                    <span className="info-value">{inspection.previousInsurance.numOfClaims.toString()}</span>
                  </div>
                  <div className="info-row" style={{ gridColumn: '1 / -1' }}>
                    <span className="info-label">Time Lapse:</span>
                    <span className="info-value">{inspection.previousInsurance.timeLapse}</span>
                  </div>
                </div>
              </div>

              {photos.length > 0 && (
                <div className="table-section">
                  <div className="section-title">Inspection Photos ({photos.length})</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginTop: '10px' }}>
                    {photos.map((photo, index) => (
                      <div key={index}>
                        <img src={photo.dataUrl} alt={`Inspection ${index + 1}`} style={{ width: '100%', border: '1px solid #ccc', borderRadius: '4px' }} />
                        <p style={{ fontSize: '8pt', color: '#666', marginTop: '3px' }}>{photo.watermarkText}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="table-section">
                <div className="section-title">Declaration</div>
                <p style={{ fontSize: '9pt', lineHeight: '1.4', marginBottom: '10px' }}>
                  Declaration of Owner: I hereby confirm and declare that above mentioned identification of my vehicle as well as that of damage to the vehicle as noted by the inspection official is correct. Nothing has been hidden / undisclosed. I further confirm and declare that the motor vehicle proposed for insurance after a break in cover has not met with any accident giving rise to any claim for injury or death caused to any person or damages to any property/insured vehicle during the period following the expiry of the previous insurance, till the moment it is proposed for insurance.
                </p>
                <p style={{ fontSize: '9pt', lineHeight: '1.4', marginBottom: '15px' }}>
                  I also agree that damages mentioned above shall be excluded / adjusted in the event of any claim being lodged.
                </p>
                <div className="signature-section">
                  <div className="signature-box">
                    <div style={{ marginBottom: '5px' }}>{inspection.declaration.proposerName}</div>
                    <div style={{ fontSize: '9pt' }}>Name & Sign of Proposer</div>
                  </div>
                  <div className="signature-box">
                    <div style={{ marginBottom: '5px' }}>{inspection.declaration.surveyorName}</div>
                    <div style={{ fontSize: '9pt' }}>Name & Sign of Surveyor (DINESH KUMAR JANGIR)</div>
                  </div>
                </div>
                <div style={{ textAlign: 'center', marginTop: '10px', fontSize: '9pt' }}>
                  Date: {inspection.declaration.signatureDate}
                </div>
              </div>
            </div>

            <div className="space-y-3 no-print">
              {!pdfGenerated ? (
                <Button
                  onClick={generatePDF}
                  disabled={!canGenerate}
                  className="w-full h-11 text-base font-medium"
                  size="lg"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Generate PDF Report
                </Button>
              ) : (
                <>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="text-green-800 font-medium">PDF report generated successfully!</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Button onClick={downloadPDF} variant="outline" size="lg">
                      <Download className="w-4 h-4 mr-2" />
                      Download PDF
                    </Button>
                    <Button onClick={handleComplete} size="lg">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Complete Inspection
                    </Button>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
