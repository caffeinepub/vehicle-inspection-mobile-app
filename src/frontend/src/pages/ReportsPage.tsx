import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, FileText, Calendar, Car } from 'lucide-react';
import { useGetUserInspections } from '../hooks/useQueries';

interface ReportsPageProps {
  onNavigate: (page: 'dashboard' | 'pdf-preview', inspectionId?: bigint) => void;
}

export default function ReportsPage({ onNavigate }: ReportsPageProps) {
  const { data: inspections, isLoading, isError } = useGetUserInspections();

  const handleViewReport = (inspectionId: bigint) => {
    onNavigate('pdf-preview', inspectionId);
  };

  const formatDate = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1000000);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="flex-1 bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <div className="container max-w-4xl mx-auto p-4 py-8 space-y-6">
        <Button variant="ghost" onClick={() => onNavigate('dashboard')} className="mb-2">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>

        <Card className="shadow-lg">
          <CardHeader className="space-y-3">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-primary" />
            </div>
            <CardTitle className="text-2xl">My Reports</CardTitle>
            <CardDescription>
              View and manage all your inspection reports
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading && (
              <div className="py-12 text-center">
                <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
                <p className="text-muted-foreground">Loading reports...</p>
              </div>
            )}

            {isError && (
              <div className="py-12 text-center">
                <p className="text-destructive mb-4">Failed to load reports</p>
                <Button onClick={() => window.location.reload()} variant="outline">
                  Try Again
                </Button>
              </div>
            )}

            {!isLoading && !isError && inspections && inspections.length === 0 && (
              <div className="py-12 text-center">
                <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No reports yet</h3>
                <p className="text-muted-foreground mb-6">
                  Start your first vehicle inspection to create a report
                </p>
                <Button onClick={() => onNavigate('dashboard')}>
                  Go to Dashboard
                </Button>
              </div>
            )}

            {!isLoading && !isError && inspections && inspections.length > 0 && (
              <div className="space-y-3">
                {inspections.map((inspection) => (
                  <Card
                    key={inspection.id.toString()}
                    className="hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => handleViewReport(inspection.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <Car className="w-4 h-4 text-primary" />
                            <h3 className="font-semibold text-lg">
                              {inspection.vehicleNumber}
                            </h3>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {inspection.makeModel}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Calendar className="w-3 h-3" />
                            <span>{formatDate(inspection.timestamp)}</span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <span className="text-xs text-muted-foreground">
                            ID: {inspection.id.toString()}
                          </span>
                          <Button size="sm" variant="outline">
                            View Report
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
