import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, ArrowRight, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { useAddRemarks } from '../hooks/useQueries';

interface RemarksPageProps {
  inspectionId: bigint | null;
  onNavigate: (page: 'dashboard' | 'photo-capture' | 'pdf-preview') => void;
}

export default function RemarksPage({ inspectionId, onNavigate }: RemarksPageProps) {
  const [remarks, setRemarks] = useState('');
  const [charCount, setCharCount] = useState(0);
  const maxChars = 2000;
  const addRemarks = useAddRemarks();

  useEffect(() => {
    if (!inspectionId) {
      toast.error('No inspection ID found');
      onNavigate('dashboard');
    }
  }, [inspectionId, onNavigate]);

  const handleRemarksChange = (value: string) => {
    if (value.length <= maxChars) {
      setRemarks(value);
      setCharCount(value.length);
    }
  };

  const handleNext = async () => {
    if (!remarks.trim()) {
      toast.error('Please add some remarks before proceeding');
      return;
    }

    if (!inspectionId) {
      toast.error('No inspection ID found');
      return;
    }

    try {
      await addRemarks.mutateAsync({ inspectionId, remarks: remarks.trim() });
      toast.success('Remarks saved successfully!');
      onNavigate('pdf-preview');
    } catch (error: any) {
      console.error('Error saving remarks:', error);
      toast.error('Failed to save remarks. Please try again.');
    }
  };

  const handleSkip = () => {
    if (inspectionId) {
      addRemarks.mutate({ inspectionId, remarks: '' });
    }
    onNavigate('pdf-preview');
  };

  return (
    <div className="flex-1 bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <div className="container max-w-2xl mx-auto p-4 py-8 space-y-6">
        <Button variant="ghost" onClick={() => onNavigate('photo-capture')} className="mb-2">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Photos
        </Button>

        <Card className="shadow-lg">
          <CardHeader className="space-y-3">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-primary" />
            </div>
            <CardTitle className="text-2xl">Inspection Remarks</CardTitle>
            <CardDescription>
              Add observations, notes, or any important details about the inspection
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="remarks" className="text-sm font-medium">
                Remarks and Observations
              </Label>
              <Textarea
                id="remarks"
                placeholder="Enter your inspection observations, vehicle condition notes, or any other relevant details..."
                value={remarks}
                onChange={(e) => handleRemarksChange(e.target.value)}
                className="min-h-[200px] resize-none"
              />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Add detailed notes about the vehicle condition</span>
                <span>
                  {charCount} / {maxChars}
                </span>
              </div>
            </div>

            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              <h4 className="font-medium text-sm">Suggested Topics:</h4>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>Overall vehicle condition</li>
                <li>Exterior and interior damage</li>
                <li>Tire condition and tread depth</li>
                <li>Engine performance observations</li>
                <li>Any repairs or maintenance needed</li>
              </ul>
            </div>

            <div className="pt-4 border-t space-y-3">
              <Button
                onClick={handleNext}
                disabled={!remarks.trim() || addRemarks.isPending}
                className="w-full h-11 text-base font-medium"
                size="lg"
              >
                {addRemarks.isPending ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                    Saving...
                  </>
                ) : (
                  <>
                    Next: Generate Report
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={handleSkip}
                className="w-full"
                disabled={addRemarks.isPending}
              >
                Skip Remarks
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
