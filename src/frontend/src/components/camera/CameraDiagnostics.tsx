import { AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import type { CameraError } from '../../camera/useCamera';

interface CameraDiagnosticsProps {
  error: CameraError | null;
}

export default function CameraDiagnostics({ error }: CameraDiagnosticsProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (!error) {
    return null;
  }

  const isSecureContext = window.isSecureContext;
  const hasMediaDevices = !!navigator.mediaDevices;
  const hasGetUserMedia = hasMediaDevices && !!navigator.mediaDevices.getUserMedia;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
      <div className="bg-muted/50 border border-border rounded-lg p-4">
        <CollapsibleTrigger asChild>
          <Button variant="ghost" className="w-full justify-between p-0 h-auto hover:bg-transparent">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">Camera Diagnostics</span>
            </div>
            <span className="text-xs text-muted-foreground">
              {isOpen ? 'Hide' : 'Show'} details
            </span>
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-4 space-y-3">
          <div className="space-y-2 text-sm">
            <DiagnosticItem
              label="Secure Context (HTTPS)"
              status={isSecureContext}
              description={
                isSecureContext
                  ? 'Page is served over HTTPS'
                  : 'Camera requires HTTPS (except localhost)'
              }
            />
            <DiagnosticItem
              label="MediaDevices API"
              status={hasMediaDevices}
              description={
                hasMediaDevices
                  ? 'Browser supports media devices'
                  : 'Browser does not support media devices'
              }
            />
            <DiagnosticItem
              label="getUserMedia API"
              status={hasGetUserMedia}
              description={
                hasGetUserMedia
                  ? 'Camera access API is available'
                  : 'Camera access API is not available'
              }
            />
          </div>

          {error && (
            <div className="pt-3 border-t border-border">
              <div className="text-xs font-medium text-muted-foreground mb-1">Last Error:</div>
              <div className="text-sm">
                <span className="font-medium capitalize">{error.type}</span>
                {' - '}
                <span>{error.message}</span>
              </div>
            </div>
          )}
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}

interface DiagnosticItemProps {
  label: string;
  status: boolean;
  description: string;
}

function DiagnosticItem({ label, status, description }: DiagnosticItemProps) {
  return (
    <div className="flex items-start gap-2">
      {status ? (
        <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
      ) : (
        <XCircle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
      )}
      <div className="flex-1 min-w-0">
        <div className="font-medium">{label}</div>
        <div className="text-xs text-muted-foreground">{description}</div>
      </div>
    </div>
  );
}
