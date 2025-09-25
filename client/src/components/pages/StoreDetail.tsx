import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Plus,
  Search,
  Edit,
  Trash2,
  Save,
  Upload,
  Key,
  Database,
  Copy
} from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Badge } from '../ui/badge';
import { Switch } from '../ui/switch';
import { Loader2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { useStore } from '../../context/ContextHooks';
import { apiService } from '../../services/api';
import type { Store } from '@/types/api';
// import { LoadingSpinner } from '../ui/loading-spinner';

export function StoreDetail() {
  const { token } = useParams<{ token: string }>();
  const { updateStore } = useStore();
  const navigate = useNavigate();
  const [storeDetails, setStoreDetails] = useState<Store | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddKeyOpen, setIsAddKeyOpen] = useState(false);
  const [isEditStoreOpen, setIsEditStoreOpen] = useState(false);
  const [newKey, setNewKey] = useState({ key: '', value: '' });
  const [editingStore, setEditingStore] = useState({ name: '', description: '' });
  const [autosave, setAutosave] = useState(false);
  const [loading, setLoading] = useState(true);
  const [autosaveLoading, setAutosaveLoading] = useState(false);

  useEffect(() => {
    const fetchStoreDetails = async () => {
      if (!token) return;
      try {
        setLoading(true);
        const response = await apiService.getStore(token);
        const store: Store = response.data;
        setStoreDetails(store);
        console.log('Store details:', store);
        setEditingStore({
          name: store.name || '',
          description: store.description || ''
        });
        setAutosave(typeof store.store?.autosave === 'boolean' ? store.store.autosave : false);
      } catch (error: unknown) {
        console.error('Failed to fetch store details:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStoreDetails();
  }, [token]);

  // Store Data tab: show all keys except 'autosave'
  const filteredKeys = storeDetails && storeDetails.store
    ? Object.keys(storeDetails.store).filter(key => key !== 'autosave' && key.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];

  const handleAddKey = async () => {
    if (!token || !newKey.key.trim()) return;
    try {
      let value: string | number | boolean = newKey.value;
      try {
        value = JSON.parse(newKey.value);
      } catch {
        // Keep as string if not valid JSON
      }
      await apiService.setValue(token, newKey.key, value);
      setStoreDetails(prev => prev && prev.store
        ? { ...prev, store: { ...prev.store, [newKey.key]: value } }
        : prev
      );
      setNewKey({ key: '', value: '' });
      setIsAddKeyOpen(false);
    } catch (error: unknown) {
      console.error('Failed to add key:', error);
    }
  };

  const handleDeleteKey = async (key: string) => {
    if (!token || !window.confirm(`Are you sure you want to delete the key "${key}"?`)) return;
    try {
      await apiService.deleteValue(token, key);
      setStoreDetails(prev => prev && prev.store
        ? { ...prev, store: Object.fromEntries(Object.entries(prev.store).filter(([k]) => k !== key)) }
        : prev
      );
    } catch (error: unknown) {
      console.error('Failed to delete key:', error);
    }
  };

  const handleUpdateStore = async () => {
    if (!token || !editingStore.name.trim()) return;

    try {
      await updateStore(token, editingStore.name, editingStore.description);
      setIsEditStoreOpen(false);
    } catch (error: unknown) {
      console.error('Failed to update store:', error);
    }
  };

  const handleToggleAutosave = async (enabled: boolean) => {
    if (!token) return;
    setAutosaveLoading(true);
    try {
      await apiService.setAutosave(token, enabled);
      setAutosave(enabled);
    } catch (error: unknown) {
      console.error('Failed to toggle autosave:', error);
    } finally {
      setAutosaveLoading(false);
    }
  };

  const handleSaveStore = async () => {
    if (!token) return;

    try {
      await apiService.saveStore(token);
    } catch (error: unknown) {
      console.error('Failed to save store:', error);
    }
  };

  const handleLoadStore = async () => {
    if (!token) return;

    try {
      await apiService.loadStore(token);
      // Refresh data after load
    } catch (error: unknown) {
      console.error('Failed to load store:', error);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center space-x-4 mb-6">
          <Button variant="ghost" onClick={() => navigate('/dashboard/stores')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Stores
          </Button>
        </div>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading store details...</p>
        </div>
      </div>
    );
  }

  if (!storeDetails) {
    return (
      <div className="p-6">
        <div className="flex items-center space-x-4 mb-6">
          <Button variant="ghost" onClick={() => navigate('/dashboard/stores')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Stores
          </Button>
        </div>
        <div className="text-center py-12">
          <Database className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Store not found</h3>
          <p className="text-muted-foreground">The requested store could not be found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={() => navigate('/dashboard/stores')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Stores
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-foreground">{storeDetails.name}</h1>
              <p className="text-muted-foreground">{storeDetails.description}</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Dialog open={isEditStoreOpen} onOpenChange={setIsEditStoreOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Store
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Edit Store</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="edit-name">Store Name</Label>
                    <Input
                      id="edit-name"
                      value={editingStore.name}
                      onChange={(e) => setEditingStore(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-description">Description</Label>
                    <Textarea
                      id="edit-description"
                      value={editingStore.description}
                      onChange={(e) => setEditingStore(prev => ({ ...prev, description: e.target.value }))}
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setIsEditStoreOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleUpdateStore}>
                      Update Store
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Tabs defaultValue="data" className="space-y-6">
          <TabsList>
            <TabsTrigger value="data">Store Data</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="data" className="space-y-6">
            {/* Controls */}
            <div className="flex items-center justify-between">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search keys..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Dialog open={isAddKeyOpen} onOpenChange={setIsAddKeyOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Key
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Key</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="key">Key</Label>
                      <Input
                        id="key"
                        value={newKey.key}
                        onChange={(e) => setNewKey(prev => ({ ...prev, key: e.target.value }))}
                        placeholder="my-key"
                      />
                    </div>
                    <div>
                      <Label htmlFor="value">Value (JSON or string)</Label>
                      <Textarea
                        id="value"
                        value={newKey.value}
                        onChange={(e) => setNewKey(prev => ({ ...prev, value: e.target.value }))}
                        placeholder='{"name": "John", "age": 30} or just a string'
                        rows={4}
                      />
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={() => setIsAddKeyOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleAddKey}>
                        Add Key
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Data Grid */}
            {filteredKeys.length === 0 ? (
              <div className="text-center py-12">
                <Key className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No keys found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchQuery ? 'No keys match your search.' : 'Add your first key-value pair to get started.'}
                </p>
                {!searchQuery && (
                  <Button onClick={() => setIsAddKeyOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Key
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid gap-4">
                {filteredKeys.map((key) => (
                  <Card key={key}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                      <div className="flex items-center space-x-3">
                        <Badge variant="outline">{key}</Badge>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteKey(key)}
                        className="text-red-500 hover:text-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </CardHeader>
                    <CardContent>
                      <pre className="text-sm bg-muted p-3 rounded-md overflow-x-auto">
                        {JSON.stringify(storeDetails?.store?.[key], null, 2)}
                      </pre>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* General Settings */}
              <Card>
                <CardHeader>
                  <CardTitle>General Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Autosave</Label>
                      <p className="text-sm text-muted-foreground">
                        Automatically save changes to persistent storage
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={autosave}
                        onCheckedChange={handleToggleAutosave}
                        disabled={autosaveLoading}
                      />
                      {autosaveLoading && (
                        <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* File Operations */}
              <Card>
                <CardHeader>
                  <CardTitle>File Operations</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex space-x-2">
                    <Button variant="outline" onClick={handleSaveStore} className="flex-1">
                      <Save className="w-4 h-4 mr-2" />
                      Save to File
                    </Button>
                    <Button variant="outline" onClick={handleLoadStore} className="flex-1">
                      <Upload className="w-4 h-4 mr-2" />
                      Load from File
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Save or load your store data to/from persistent file storage
                  </p>
                </CardContent>
              </Card>

              {/* Store Info */}
              <Card>
                <CardHeader>
                  <CardTitle>Store Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Store Token</Label>
                    <div className="flex items-center space-x-2 mt-1">
                      <Input value={storeDetails.token} readOnly className="font-mono text-xs" />
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => navigator.clipboard.writeText(storeDetails.token)}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div>
                    <Label>Created</Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      {storeDetails.createdAt ? new Date(storeDetails.createdAt).toLocaleString() : 'Unknown'}
                    </p>
                  </div>
                  {/* <div>
                    <Label>Last Updated</Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      {storeDetails.updatedAt ? new Date(storeDetails.updatedAt).toLocaleString() : 'Unknown'}
                    </p>
                  </div> */}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}