import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Database,
  Settings,
  Trash2,
  Users,
  MoreHorizontal,
  Search,
  Calendar
} from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { Badge } from '../ui/badge';
import { useStore } from '../../context/ContextHooks';
import { Store } from '../../types/api';
import { LoadingSpinner } from '../ui/loading-spinner';

export function Stores() {
  const { stores, loading, fetchStores, createStore, deleteStore, setCurrentStore } = useStore();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [newStore, setNewStore] = useState({ name: '', description: '' });
  const navigate = useNavigate();

  useEffect(() => {
    fetchStores();
  }, [fetchStores]);

  const filteredStores = stores.filter(store => {
    return (
      (store.name?.toLowerCase() ?? '').includes(searchQuery.toLowerCase()) ||
      (store.description?.toLowerCase() ?? '').includes(searchQuery.toLowerCase())
    );
  });

  const handleCreateStore = async () => {
    if (!newStore.name.trim()) return;

    await createStore(newStore.name, newStore.description);
    setNewStore({ name: '', description: '' });
    setIsCreateOpen(false);
  };

  const handleDeleteStore = async (token: string) => {
    if (window.confirm('Are you sure you want to delete this store? This action cannot be undone.')) {
      await deleteStore(token);
    }
  };

  const handleOpenStore = (store: Store) => {
    setCurrentStore(store);
    navigate(`/dashboard/stores/${store.token}`);
  };

  const handleManageAccess = (store: Store) => {
    setCurrentStore(store);
    navigate('/dashboard/access');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner className="w-8 h-8" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Stores</h1>
            <p className="text-muted-foreground">Manage your key-value stores</p>
          </div>

          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="group">
                <Plus className="w-4 h-4 mr-2" />
                Create Store
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Store</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Store Name</Label>
                  <Input
                    id="name"
                    value={newStore.name}
                    onChange={(e) => setNewStore(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="my-awesome-store"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newStore.description}
                    onChange={(e) => setNewStore(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="A brief description of your store..."
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateStore}>
                    Create Store
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search stores..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Stores Grid */}
        {filteredStores.length === 0 ? (
          <div className="text-center py-12">
            <Database className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No stores found</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery ? 'No stores match your search.' : 'Create your first store to get started.'}
            </p>
            {!searchQuery && (
              <Button onClick={() => setIsCreateOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Store
              </Button>
            )}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredStores.map((store) => (
              <Card key={store.token} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Database className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{store.name}</CardTitle>
                      <div className="flex items-center text-xs text-muted-foreground mt-1">
                        <Calendar className="w-3 h-3 mr-1" />
                        {new Date(store.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleOpenStore(store)}>
                        <Database className="w-4 h-4 mr-2" />
                        Open Store
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleManageAccess(store)}>
                        <Users className="w-4 h-4 mr-2" />
                        Manage Access
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-red-500"
                        onClick={() => handleDeleteStore(store.token)}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete Store
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardHeader>

                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {store.description || 'No description provided'}
                  </p>

                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-xs">
                      {store.token.slice(0, 8)}...
                    </Badge>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleOpenStore(store)}
                      >
                        <Settings className="w-3 h-3 mr-1" />
                        Manage
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}