import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, Smartphone, Chrome, MoreVertical, Home, ArrowLeft } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface InstallHelpPageProps {
  onNavigate: (page: 'dashboard') => void;
}

export default function InstallHelpPage({ onNavigate }: InstallHelpPageProps) {
  return (
    <div className="flex-1 bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <div className="container max-w-3xl mx-auto p-4 py-8 space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onNavigate('dashboard')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>

        <div className="text-center space-y-2">
          <Smartphone className="w-16 h-16 mx-auto text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">Install App</h1>
          <p className="text-muted-foreground">
            Add this app to your home screen for easy access
          </p>
        </div>

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>APK File Not Available</AlertTitle>
          <AlertDescription>
            This is a web-based application that runs on the Internet Computer blockchain. 
            An Android APK file cannot be generated or exported from this platform. 
            However, you can install this app on your device using the steps below.
          </AlertDescription>
        </Alert>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Chrome className="w-6 h-6 text-primary" />
              <CardTitle>Install on Android (Chrome)</CardTitle>
            </div>
            <CardDescription>
              Follow these steps to add the app to your home screen
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                  1
                </div>
                <div className="flex-1">
                  <p className="font-medium">Open Chrome Browser</p>
                  <p className="text-sm text-muted-foreground">
                    Make sure you're viewing this page in Google Chrome on your Android device
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                  2
                </div>
                <div className="flex-1">
                  <p className="font-medium">Tap the Menu Icon</p>
                  <p className="text-sm text-muted-foreground">
                    Tap the three dots <MoreVertical className="w-4 h-4 inline" /> in the top-right corner of Chrome
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                  3
                </div>
                <div className="flex-1">
                  <p className="font-medium">Select "Add to Home screen"</p>
                  <p className="text-sm text-muted-foreground">
                    Look for the option that says "Add to Home screen" or "Install app"
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                  4
                </div>
                <div className="flex-1">
                  <p className="font-medium">Confirm Installation</p>
                  <p className="text-sm text-muted-foreground">
                    Tap "Add" or "Install" to confirm. The app icon will appear on your home screen
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                  5
                </div>
                <div className="flex-1">
                  <p className="font-medium">Launch the App</p>
                  <p className="text-sm text-muted-foreground">
                    Find the app icon <Home className="w-4 h-4 inline" /> on your home screen and tap it to open
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Benefits of Installing</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span>Quick access from your home screen</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span>Full-screen experience without browser UI</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span>Works like a native app</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span>Faster loading and better performance</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        <div className="text-center">
          <Button onClick={() => onNavigate('dashboard')} size="lg">
            <Home className="w-4 h-4 mr-2" />
            Return to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
