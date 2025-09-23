import { useState } from 'react';
import { Plus, Key, Copy, Trash2, Eye, EyeOff, Calendar } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Badge } from '../ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../ui/alert-dialog';

// Dummy data for API tokens
const dummyTokens = [
  {
    id: '1',
    name: 'Production API Key',
    token: 'kvs_prod_1234567890abcdef...',
    createdAt: '2025-01-15T10:00:00Z',
    lastUsed: '2025-01-20T14:30:00Z',
  },
  {
    id: '2',
    name: 'Development Key',
    token: 'kvs_dev_abcdef1234567890...',
    createdAt: '2025-01-10T09:15:00Z',
    lastUsed: '2025-01-19T11:45:00Z',
  },
  {
    id: '3',
    name: 'Mobile App Token',
    token: 'kvs_mobile_fedcba0987654321...',
    createdAt: '2025-01-05T16:20:00Z',
    lastUsed: null,
  },
];

export function ApiTokens() {
  const [tokens, setTokens] = useState(dummyTokens);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newTokenName, setNewTokenName] = useState('');
  const [visibleTokens, setVisibleTokens] = useState<Set<string>>(new Set());
  const [generatedToken, setGeneratedToken] = useState<string | null>(null);

  const toggleTokenVisibility = (tokenId: string) => {
    setVisibleTokens(prev => {
      const newSet = new Set(prev);
      if (newSet.has(tokenId)) {
        newSet.delete(tokenId);
      } else {
        newSet.add(tokenId);
      }
      return newSet;
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  const handleCreateToken = () => {
    if (!newTokenName.trim()) return;

    const newToken = {
      id: Date.now().toString(),
      name: newTokenName,
      token: `kvs_${Math.random().toString(36).substring(2)}...`,
      createdAt: new Date().toISOString(),
      lastUsed: null,
    };

    setTokens(prev => [...prev, newToken]);
    setGeneratedToken(newToken.token);
    setNewTokenName('');
    setIsCreateOpen(false);
  };

  const handleDeleteToken = (tokenId: string) => {
    setTokens(prev => prev.filter(token => token.id !== tokenId));
  };

  const formatToken = (token: string, isVisible: boolean) => {
    if (isVisible) {
      return token;
    }
    const parts = token.split('_');
    if (parts.length >= 2) {
      return `${parts[0]}_${parts[1]}_${'*'.repeat(20)}...`;
    }
    return '*'.repeat(token.length - 3) + token.slice(-3);
  };

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">API Tokens</h1>
            <p className="text-muted-foreground">Manage your API authentication tokens</p>
          </div>

          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Token
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New API Token</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="token-name">Token Name</Label>
                  <Input
                    id="token-name"
                    value={newTokenName}
                    onChange={(e) => setNewTokenName(e.target.value)}
                    placeholder="e.g., Production API, Mobile App, etc."
                  />
                </div>
                <div className="bg-muted/50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Important:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Store your token securely - it won't be shown again</li>
                    <li>• Use environment variables to store tokens in your code</li>
                    <li>• Each token has full access to your account</li>
                  </ul>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateToken}>
                    Create Token
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Generated Token Modal */}
        {generatedToken && (
          <Dialog open={!!generatedToken} onOpenChange={() => setGeneratedToken(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Your New API Token</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="bg-muted p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <code className="text-sm font-mono break-all">{generatedToken}</code>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(generatedToken)}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div className="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-lg">
                  <p className="text-sm font-medium text-yellow-700 dark:text-yellow-300">
                    ⚠️ Save this token now - you won't be able to see it again!
                  </p>
                </div>
                <div className="flex justify-end">
                  <Button onClick={() => setGeneratedToken(null)}>
                    I've saved my token
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Tokens List */}
        {tokens.length === 0 ? (
          <div className="text-center py-12">
            <Key className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No API tokens</h3>
            <p className="text-muted-foreground mb-4">
              Create your first API token to start using the KVS++ API
            </p>
            <Button onClick={() => setIsCreateOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Token
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {tokens.map((token) => (
              <Card key={token.id}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Key className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{token.name}</CardTitle>
                      <div className="flex items-center text-xs text-muted-foreground mt-1">
                        <Calendar className="w-3 h-3 mr-1" />
                        Created {new Date(token.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {token.lastUsed && (
                      <Badge variant="outline" className="text-xs">
                        Last used {new Date(token.lastUsed).toLocaleDateString()}
                      </Badge>
                    )}

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="text-destructive">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete API Token</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete "{token.name}"? This action cannot be undone
                            and will immediately invalidate the token.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteToken(token.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete Token
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 bg-muted p-3 rounded-md font-mono text-sm">
                      {formatToken(token.token, visibleTokens.has(token.id))}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleTokenVisibility(token.id)}
                    >
                      {visibleTokens.has(token.id) ?
                        <EyeOff className="w-4 h-4" /> :
                        <Eye className="w-4 h-4" />
                      }
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(token.token)}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>

                  {!token.lastUsed && (
                    <div className="mt-3 text-sm text-muted-foreground">
                      This token has never been used
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Usage Instructions */}
        <Card className="mt-8 bg-muted/30">
          <CardHeader>
            <CardTitle className="text-lg">Using Your API Tokens</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Authentication</h4>
              <p className="text-sm text-muted-foreground mb-2">
                Include your token in the Authorization header:
              </p>
              <pre className="text-xs bg-background p-3 rounded-md overflow-x-auto">
                {`Authorization: Bearer YOUR_API_TOKEN`}
              </pre>
            </div>

            <div>
              <h4 className="font-medium mb-2">Example Request</h4>
              <pre className="text-xs bg-background p-3 rounded-md overflow-x-auto">
                {`curl -X GET "https://api.kvscloud.com/store/your-store-token/my-key" \\
  -H "Authorization: Bearer YOUR_API_TOKEN"`}
              </pre>
            </div>

            <div className="text-sm text-muted-foreground">
              <p>
                <strong>Security Tips:</strong> Never expose API tokens in client-side code.
                Always use environment variables and secure storage mechanisms.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}