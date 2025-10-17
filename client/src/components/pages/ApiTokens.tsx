import { useState } from 'react';
import { Key, Copy, Trash2, Eye, EyeOff } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../ui/alert-dialog';

// Dummy data for API token (single token)
const dummyToken = {
  id: '1',
  name: 'API Key',
  token: 'kvs_1234567890abcdef1234567890abcdef1234567890',
  createdAt: '2025-01-15T10:00:00Z',
  lastUsed: '2025-01-20T14:30:00Z' as string | null,
};

export function ApiTokens() {
  const [token, setToken] = useState(dummyToken);
  const [isVisible, setIsVisible] = useState(false);
  const [isRegenerateOpen, setIsRegenerateOpen] = useState(false);
  const [generatedToken, setGeneratedToken] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const toggleTokenVisibility = () => {
    setIsVisible(!isVisible);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRegenerateToken = () => {
    const newToken = {
      id: Date.now().toString(),
      name: 'API Key',
      token: `kvs_${Math.random().toString(36).substring(2)}${Math.random().toString(36).substring(2)}${Math.random().toString(36).substring(2)}`,
      createdAt: new Date().toISOString(),
      lastUsed: null,
    };

    setToken(newToken);
    setGeneratedToken(newToken.token);
    setIsRegenerateOpen(false);
  };

  const formatToken = (token: string, isVisible: boolean) => {
    if (isVisible) {
      return token;
    }
    const parts = token.split('_');
    if (parts.length >= 2) {
      return `${parts[0]}_${'*'.repeat(32)}`;
    }
    return '*'.repeat(token.length - 3) + token.slice(-3);
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-1 sm:mb-2">API Key</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Manage your API authentication key</p>
        </div>

        {/* Generated Token Modal */}
        {generatedToken && (
          <Dialog open={!!generatedToken} onOpenChange={() => setGeneratedToken(null)}>
            <DialogContent className="max-w-[95vw] sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Your New API Key</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="bg-muted p-3 sm:p-4 rounded-lg">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                    <code className="text-xs sm:text-sm font-mono break-all flex-1">{generatedToken}</code>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(generatedToken)}
                      className="w-full sm:w-auto"
                    >
                      <Copy className="w-4 h-4 mr-2 sm:mr-0" />
                      <span className="sm:hidden">Copy</span>
                    </Button>
                  </div>
                </div>
                <div className="bg-yellow-500/10 border border-yellow-500/20 p-3 sm:p-4 rounded-lg">
                  <p className="text-xs sm:text-sm font-medium text-yellow-700 dark:text-yellow-300">
                    ⚠️ Save this key now - you won't be able to see it again!
                  </p>
                </div>
                <div className="flex justify-end">
                  <Button onClick={() => setGeneratedToken(null)} className="w-full sm:w-auto">
                    I've saved my key
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* API Key Card */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Key className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-base sm:text-lg">Your API Key</CardTitle>
                  <div className="text-xs text-muted-foreground mt-1">
                    Created {new Date(token.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>

              <AlertDialog open={isRegenerateOpen} onOpenChange={setIsRegenerateOpen}>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm" className="text-red-500 w-full sm:w-auto">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Regenerate
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="max-w-[95vw] sm:max-w-lg">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Regenerate API Key</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to regenerate your API key? This action cannot be undone
                      and will immediately invalidate your current key.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter className="flex-col sm:flex-row gap-2">
                    <AlertDialogCancel className="w-full sm:w-auto m-0">Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleRegenerateToken}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90 w-full sm:w-auto m-0"
                    >
                      Regenerate Key
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardHeader>

          <CardContent>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <div className="flex-1 bg-muted p-3 rounded-md font-mono text-xs sm:text-sm break-all overflow-x-auto">
                {formatToken(token.token, isVisible)}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleTokenVisibility}
                  className="flex-1 sm:flex-none"
                  title={isVisible ? "Hide key" : "Show key"}
                >
                  {isVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  <span className="sm:hidden ml-2">{isVisible ? "Hide" : "Show"}</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(token.token)}
                  className="flex-1 sm:flex-none"
                >
                  <Copy className="w-4 h-4" />
                  <span className="sm:hidden ml-2">{copied ? "Copied!" : "Copy"}</span>
                </Button>
              </div>
            </div>

            {token.lastUsed && (
              <div className="mt-3 text-xs sm:text-sm text-muted-foreground">
                Last used {new Date(token.lastUsed).toLocaleDateString()}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Usage Instructions */}
        <Card className="mt-6 sm:mt-8 bg-muted/30">
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">Using Your API Key</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium mb-2 text-sm sm:text-base">Authentication</h4>
              <p className="text-xs sm:text-sm text-muted-foreground mb-2">
                Include your key in the Authorization header:
              </p>
              <pre className="text-[10px] sm:text-xs bg-background p-2 sm:p-3 rounded-md overflow-x-auto">
                {`Authorization: Bearer YOUR_API_KEY`}
              </pre>
            </div>

            <div>
              <h4 className="font-medium mb-2 text-sm sm:text-base">Example Request</h4>
              <pre className="text-[10px] sm:text-xs bg-background p-2 sm:p-3 rounded-md overflow-x-auto">
                {`curl -X GET "https://api.kvscloud.com/store/your-store-token/my-key" \\
  -H "Authorization: Bearer YOUR_API_KEY"`}
              </pre>
            </div>

            <div className="text-xs sm:text-sm text-muted-foreground">
              <p>
                <strong>Security Tips:</strong> Never expose API keys in client-side code.
                Always use environment variables and secure storage mechanisms.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}