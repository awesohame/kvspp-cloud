import { useState } from 'react';
import { Users, Mail, Crown, Eye, Edit, Trash2, UserPlus } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../ui/alert-dialog';
import { useStore } from '../../context/ContextHooks';
import { AccessUser } from '../../types/api';

// Dummy data
type StoreAccessData = {
  storeToken: string;
  storeName: string;
  users: AccessUser[];
};

const dummyAccessData: StoreAccessData[] = [
  {
    storeToken: 'store1',
    storeName: 'Production Store',
    users: [
      { email: 'john@example.com', role: 'owner', addedAt: '2025-01-10T10:00:00Z' },
      { email: 'jane@example.com', role: 'editor', addedAt: '2025-01-12T14:30:00Z' },
      { email: 'bob@example.com', role: 'viewer', addedAt: '2025-01-15T09:15:00Z' },
    ]
  },
  {
    storeToken: 'store2',
    storeName: 'Development Store',
    users: [
      { email: 'alice@example.com', role: 'owner', addedAt: '2025-01-08T11:20:00Z' },
      { email: 'charlie@example.com', role: 'editor', addedAt: '2025-01-14T16:45:00Z' },
    ]
  }
];

const roleIcons = {
  owner: Crown,
  editor: Edit,
  viewer: Eye,
};


export function AccessManagement() {
  const { stores, currentStore } = useStore();
  const [accessData, setAccessData] = useState<StoreAccessData[]>(dummyAccessData);
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [selectedStore, setSelectedStore] = useState<string>('');
  const [newUser, setNewUser] = useState({ email: '', role: 'viewer' });
  const [searchQuery, setSearchQuery] = useState('');

  // Filter stores and access data based on current store or show all
  const relevantAccessData = currentStore
    ? accessData.filter(data => data.storeToken === currentStore.token)
    : accessData;

  const filteredAccessData = relevantAccessData.filter(data =>
    data.storeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    data.users.some((user: AccessUser) =>
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const handleAddUser = () => {
    if (!newUser.email || !selectedStore) return;

    setAccessData(prev => prev.map(data => {
      if (data.storeToken === selectedStore) {
        return {
          ...data,
          users: [...data.users, {
            email: newUser.email,
            role: newUser.role as 'owner' | 'editor' | 'viewer',
            addedAt: new Date().toISOString()
          }]
        };
      }
      return data;
    }));

    setNewUser({ email: '', role: 'viewer' });
    setSelectedStore('');
    setIsAddUserOpen(false);
  };

  const handleRemoveUser = (storeToken: string, userEmail: string) => {
    setAccessData(prev => prev.map(data => {
      if (data.storeToken === storeToken) {
        return {
          ...data,
          users: data.users.filter((user: AccessUser) => user.email !== userEmail)
        };
      }
      return data;
    }));
  };

  const handleRoleChange = (storeToken: string, userEmail: string, newRole: string) => {
    setAccessData(prev => prev.map(data => {
      if (data.storeToken === storeToken) {
        return {
          ...data,
          users: data.users.map((user: AccessUser) =>
            user.email === userEmail
              ? { ...user, role: newRole as 'owner' | 'editor' | 'viewer' }
              : user
          )
        };
      }
      return data;
    }));
  };

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Access Management</h1>
            <p className="text-muted-foreground">
              {currentStore
                ? `Manage access for ${currentStore.name}`
                : 'Manage user access to your stores'
              }
            </p>
          </div>

          <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="w-4 h-4 mr-2" />
                Add User
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add User Access</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="store-select">Store</Label>
                  <Select value={selectedStore} onValueChange={setSelectedStore}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a store" />
                    </SelectTrigger>
                    <SelectContent>
                      {(currentStore ? [currentStore] : stores).map((store) => (
                        <SelectItem key={store.token} value={store.token}>
                          {store.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="user-email">Email Address</Label>
                  <Input
                    id="user-email"
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="user@example.com"
                  />
                </div>
                <div>
                  <Label htmlFor="user-role">Role</Label>
                  <Select value={newUser.role} onValueChange={(value) => setNewUser(prev => ({ ...prev, role: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="viewer">Viewer - Read only access</SelectItem>
                      <SelectItem value="editor">Editor - Read and write access</SelectItem>
                      <SelectItem value="owner">Owner - Full access</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsAddUserOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddUser}>
                    Add User
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search stores or users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Access Data */}
        {filteredAccessData.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No access data found</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery
                ? 'No users or stores match your search.'
                : 'Add users to your stores to manage their access.'
              }
            </p>
            {!searchQuery && (
              <Button onClick={() => setIsAddUserOpen(true)}>
                <UserPlus className="w-4 h-4 mr-2" />
                Add User
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {filteredAccessData.map((storeData) => (
              <Card key={storeData.storeToken}>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Users className="w-4 h-4 text-primary" />
                    </div>
                    <span>{storeData.storeName}</span>
                    <Badge variant="outline">{storeData.users.length} users</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {storeData.users.map((user: AccessUser) => {
                      const RoleIcon = roleIcons[user.role];
                      return (
                        <div
                          key={user.email}
                          className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-center space-x-3">
                            <Avatar>
                              <AvatarFallback>
                                <Mail className="w-4 h-4" />
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{user.email}</p>
                              <p className="text-xs text-muted-foreground">
                                Added {new Date(user.addedAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center space-x-3">
                            <Select
                              value={user.role}
                              onValueChange={(value) => handleRoleChange(storeData.storeToken, user.email, value)}
                            >
                              <SelectTrigger className="w-32">
                                <div className="flex items-center space-x-2">
                                  <RoleIcon className="w-3 h-3" />
                                  <span className="capitalize">{user.role}</span>
                                </div>
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="viewer">
                                  <div className="flex items-center space-x-2">
                                    <Eye className="w-3 h-3" />
                                    <span>Viewer</span>
                                  </div>
                                </SelectItem>
                                <SelectItem value="editor">
                                  <div className="flex items-center space-x-2">
                                    <Edit className="w-3 h-3" />
                                    <span>Editor</span>
                                  </div>
                                </SelectItem>
                                <SelectItem value="owner">
                                  <div className="flex items-center space-x-2">
                                    <Crown className="w-3 h-3" />
                                    <span>Owner</span>
                                  </div>
                                </SelectItem>
                              </SelectContent>
                            </Select>

                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="sm" className="text-destructive">
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Remove User Access</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to remove access for "{user.email}"
                                    from "{storeData.storeName}"? They will no longer be able
                                    to access this store.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleRemoveUser(storeData.storeToken, user.email)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Remove Access
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Role Information */}
        <Card className="mt-8 bg-muted/30">
          <CardHeader>
            <CardTitle>Role Permissions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Eye className="w-4 h-4 text-green-600" />
                  <span className="font-medium">Viewer</span>
                </div>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Read access to store data</li>
                  <li>• View store information</li>
                  <li>• Cannot modify data</li>
                </ul>
              </div>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Edit className="w-4 h-4 text-blue-600" />
                  <span className="font-medium">Editor</span>
                </div>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Read and write access</li>
                  <li>• Create, update, delete keys</li>
                  <li>• Cannot manage store settings</li>
                </ul>
              </div>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Crown className="w-4 h-4 text-yellow-600" />
                  <span className="font-medium">Owner</span>
                </div>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Full access to everything</li>
                  <li>• Manage store settings</li>
                  <li>• Manage user access</li>
                  <li>• Delete store</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}