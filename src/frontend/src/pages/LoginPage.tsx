import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Smartphone, Shield } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface LoginPageProps {
  onLoginSuccess: () => void;
}

export default function LoginPage({ onLoginSuccess }: LoginPageProps) {
  const { login, loginStatus } = useInternetIdentity();
  const [mobileNumber, setMobileNumber] = useState('');

  const isLoggingIn = loginStatus === 'logging-in';

  const handleSendOTP = async () => {
    if (!mobileNumber.trim()) {
      toast.error('Please enter your mobile number');
      return;
    }

    if (!/^\d{10}$/.test(mobileNumber.replace(/\D/g, ''))) {
      toast.error('Please enter a valid 10-digit mobile number');
      return;
    }

    try {
      await login();
      onLoginSuccess();
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error('Login failed. Please try again.');
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4 bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-3 text-center">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">Vehicle Inspection</CardTitle>
          <CardDescription>
            Enter your mobile number to access the inspection system
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="mobile" className="text-sm font-medium">
              Mobile Number
            </Label>
            <div className="relative">
              <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                id="mobile"
                type="tel"
                placeholder="Enter 10-digit mobile number"
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
                className="pl-10"
                maxLength={10}
                disabled={isLoggingIn}
              />
            </div>
          </div>

          <Button
            onClick={handleSendOTP}
            disabled={isLoggingIn}
            className="w-full h-11 text-base font-medium"
            size="lg"
          >
            {isLoggingIn ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                Authenticating...
              </>
            ) : (
              'Send OTP'
            )}
          </Button>

          <div className="text-center text-xs text-muted-foreground">
            By continuing, you agree to our secure authentication process
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
