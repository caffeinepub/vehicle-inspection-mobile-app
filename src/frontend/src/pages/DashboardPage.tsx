import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ClipboardList, FileText, Plus } from 'lucide-react';
import { useGetUserInspections } from '../hooks/useQueries';

interface DashboardPageProps {
  onNavigate: (page: 'vehicle-details' | 'reports') => void;
}

export default function DashboardPage({ onNavigate }: DashboardPageProps) {
  const { data: inspections, isLoading } = useGetUserInspections();

  return (
    <div className="flex-1 bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <div className="container max-w-4xl mx-auto p-4 py-8 space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your vehicle inspections and reports
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer group" onClick={() => onNavigate('vehicle-details')}>
            <CardHeader>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-2 group-hover:bg-primary/20 transition-colors">
                <Plus className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="text-xl">New Vehicle Inspection</CardTitle>
              <CardDescription>
                Start a new inspection by entering vehicle details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" size="lg">
                Start Inspection
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer group" onClick={() => onNavigate('reports')}>
            <CardHeader>
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-2 group-hover:bg-accent/20 transition-colors">
                <FileText className="w-6 h-6 text-accent-foreground" />
              </div>
              <CardTitle className="text-xl">My Reports</CardTitle>
              <CardDescription>
                View and manage your inspection reports
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full" size="lg">
                View Reports
              </Button>
            </CardContent>
          </Card>
        </div>

        {isLoading && (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
              <p className="text-muted-foreground">Loading reports...</p>
            </CardContent>
          </Card>
        )}

        {!isLoading && inspections && inspections.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-primary" />
                <CardTitle>Recent Inspections</CardTitle>
              </div>
              <CardDescription>
                Your latest vehicle inspection records
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {inspections.slice(0, 5).map((inspection) => (
                  <div
                    key={inspection.id.toString()}
                    className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/5 transition-colors"
                  >
                    <div className="space-y-1">
                      <p className="font-medium">
                        {inspection.vehicleNumber}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {inspection.makeModel}
                      </p>
                    </div>
                    <div className="text-right text-sm text-muted-foreground">
                      ID: {inspection.id.toString()}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {!isLoading && inspections && inspections.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <ClipboardList className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No inspections yet</p>
              <p className="text-sm text-muted-foreground mt-2">
                Start your first inspection to see it here
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
