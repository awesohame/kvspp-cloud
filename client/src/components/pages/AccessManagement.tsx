import { useState } from 'react';
import { Users, Mail, UserPlus, Trash2, AlertTriangle } from 'lucide-react';
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


export function AccessManagement() {
  const { stores, currentStore } = useStore();
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [selectedStore, setSelectedStore] = useState<string>('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter stores based on current store or show all
  const relevantStores = currentStore ? [currentStore] : stores;

  const filteredStores = relevantStores.filter(store =>
    store.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (store.users || []).some(user =>
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const handleAddUser = () => {
    if (!newUserEmail || !selectedStore) return;

    // TODO: Add API call to add user
    console.log('Adding user:', newUserEmail, 'to store:', selectedStore);

    setNewUserEmail('');
    setSelectedStore('');
    setIsAddUserOpen(false);
  };

  const handleRemoveUser = (storeToken: string, userId: string) => {
    // TODO: Add API call to remove user
    console.log('Removing user:', userId, 'from store:', storeToken);
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Access Management</h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              {currentStore
                ? `Manage access for ${currentStore.name}`
                : 'Manage user access to your stores'
              }
            </p>
          </div>

          <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto">
                <UserPlus className="w-4 h-4 mr-2" />
                Add User
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-[95vw] sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Add User Access</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                {/* Warning about full access */}
                <div className="bg-yellow-500/10 border border-yellow-500/20 p-3 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <p className="text-xs sm:text-sm font-medium text-yellow-700 dark:text-yellow-300">
                      Users will have full access to the store, including read, write, and delete permissions.
                    </p>
                  </div>
                </div>

                <div>
                  <Label htmlFor="store-select">Store</Label>
                  <Select value={selectedStore} onValueChange={setSelectedStore}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a store" />
                    </SelectTrigger>
                    <SelectContent>
                      {relevantStores.map((store) => (
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
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                    placeholder="user@example.com"
                  />
                </div>
                <div className="flex flex-col sm:flex-row justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsAddUserOpen(false)} className="w-full sm:w-auto">
                    Cancel
                  </Button>
                  <Button onClick={handleAddUser} className="w-full sm:w-auto">
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
        {filteredStores.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-base sm:text-lg font-medium mb-2">No access data found</h3>
            <p className="text-sm sm:text-base text-muted-foreground mb-4 px-4">
              {searchQuery
                ? 'No users or stores match your search.'
                : 'Add users to your stores to manage their access.'
              }
            </p>
            {!searchQuery && (
              <Button onClick={() => setIsAddUserOpen(true)} className="w-full sm:w-auto mx-4 sm:mx-0">
                <UserPlus className="w-4 h-4 mr-2" />
                Add User
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4 sm:space-y-6">
            {filteredStores.map((store) => (
              <Card key={store.token}>
                <CardHeader className="pb-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <CardTitle className="flex items-center space-x-2 sm:space-x-3 text-base sm:text-lg">
                      <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Users className="w-4 h-4 text-primary" />
                      </div>
                      <span className="break-all">{store.name}</span>
                    </CardTitle>
                    <Badge variant="outline" className="self-start sm:self-auto">
                      {(store.users || []).length} user{(store.users || []).length !== 1 ? 's' : ''}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {(!store.users || store.users.length === 0) ? (
                    <div className="text-center py-6 text-sm text-muted-foreground">
                      No users have access to this store
                    </div>
                  ) : (
                    <div className="space-y-2 sm:space-y-3">
                      {store.users.map((user) => (
                        <div
                          key={user.id}
                          className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-center space-x-3 min-w-0 flex-1">
                            <Avatar className="flex-shrink-0">
                              <AvatarFallback>
                                <Mail className="w-4 h-4" />
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0 flex-1">
                              <p className="font-medium text-sm sm:text-base truncate">{user.name}</p>
                              <p className="text-xs sm:text-sm text-muted-foreground truncate">
                                {user.email}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center justify-end sm:justify-start">
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="sm" className="text-red-500 w-full sm:w-auto">
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  <span className="sm:hidden">Remove Access</span>
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent className="max-w-[95vw] sm:max-w-lg">
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Remove User Access</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to remove access for "{user.name}" ({user.email})
                                    from "{store.name}"? They will no longer be able
                                    to access this store.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter className="flex-col sm:flex-row gap-2">
                                  <AlertDialogCancel className="w-full sm:w-auto m-0">Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleRemoveUser(store.token, user.id)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90 w-full sm:w-auto m-0"
                                  >
                                    Remove Access
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Access Information */}
        <Card className="mt-6 sm:mt-8 bg-muted/30">
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">Access Permissions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p className="text-sm sm:text-base text-muted-foreground">
                Users you add will have <strong>full access</strong> to the selected store, including:
              </p>
              <ul className="text-sm sm:text-base text-muted-foreground space-y-2 ml-4">
                <li>• Read all keys and values</li>
                <li>• Create, update, and delete keys</li>
                <li>• Export and import store data</li>
                <li>• Manage store persistence settings</li>
              </ul>
              <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                <p className="text-xs sm:text-sm text-yellow-700 dark:text-yellow-300">
                  <strong>Note:</strong> Only add users you trust completely, as they will have the same level of access as you do.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}