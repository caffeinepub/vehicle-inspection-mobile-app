import { useInternetIdentity } from './hooks/useInternetIdentity';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import VehicleDetailsPage from './pages/VehicleDetailsPage';
import PreInspectionFormPage from './pages/PreInspectionFormPage';
import PhotoCapturePage from './pages/PhotoCapturePage';
import RemarksPage from './pages/RemarksPage';
import PdfPreviewPage from './pages/PdfPreviewPage';
import ReportsPage from './pages/ReportsPage';
import InstallHelpPage from './pages/InstallHelpPage';
import Header from './components/Header';
import Footer from './components/Footer';
import { Toaster } from './components/ui/sonner';
import { ThemeProvider } from 'next-themes';
import { useState } from 'react';

type Page = 'login' | 'dashboard' | 'vehicle-details' | 'pre-inspection-form' | 'photo-capture' | 'remarks' | 'pdf-preview' | 'reports' | 'install-help';

export default function App() {
  const { identity, isInitializing } = useInternetIdentity();
  const [currentPage, setCurrentPage] = useState<Page>('login');
  const [currentInspectionId, setCurrentInspectionId] = useState<bigint | null>(null);

  const isAuthenticated = !!identity;

  if (isInitializing) {
    return (
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <div className="flex min-h-screen items-center justify-center bg-background">
          <div className="text-center">
            <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </ThemeProvider>
    );
  }

  const handleNavigateWithInspection = (page: Page, inspectionId?: bigint) => {
    setCurrentPage(page);
    if (inspectionId !== undefined) {
      setCurrentInspectionId(inspectionId);
    }
  };

  const renderPage = () => {
    if (!isAuthenticated) {
      return <LoginPage onLoginSuccess={() => setCurrentPage('dashboard')} />;
    }

    switch (currentPage) {
      case 'dashboard':
        return <DashboardPage onNavigate={setCurrentPage} />;
      case 'vehicle-details':
        return <VehicleDetailsPage onNavigate={handleNavigateWithInspection} />;
      case 'pre-inspection-form':
        return (
          <PreInspectionFormPage
            inspectionId={currentInspectionId}
            onNavigate={setCurrentPage}
          />
        );
      case 'photo-capture':
        return (
          <PhotoCapturePage
            inspectionId={currentInspectionId}
            onNavigate={setCurrentPage}
          />
        );
      case 'remarks':
        return (
          <RemarksPage
            inspectionId={currentInspectionId}
            onNavigate={setCurrentPage}
          />
        );
      case 'pdf-preview':
        return (
          <PdfPreviewPage
            inspectionId={currentInspectionId}
            onNavigate={setCurrentPage}
          />
        );
      case 'reports':
        return <ReportsPage onNavigate={handleNavigateWithInspection} />;
      case 'install-help':
        return <InstallHelpPage onNavigate={setCurrentPage} />;
      default:
        return <DashboardPage onNavigate={setCurrentPage} />;
    }
  };

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <div className="flex min-h-screen flex-col bg-background">
        <Header currentPage={currentPage} onNavigate={setCurrentPage} />
        <main className="flex-1 flex flex-col">{renderPage()}</main>
        <Footer />
        <Toaster />
      </div>
    </ThemeProvider>
  );
}
