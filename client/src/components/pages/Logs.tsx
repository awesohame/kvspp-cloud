import { useState } from 'react';
import { FileText, Search, Download, User, Database, Key, Shield, AlertCircle, Clock, Globe } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';

// Dummy log data
const dummyLogs = [
  {
    id: '1',
    action: 'login',
    details: 'User logged in via Google OAuth',
    timestamp: '2025-01-20T14:30:00Z',
    ip: '192.168.1.1',
    category: 'auth'
  },
  {
    id: '2',
    action: 'store_created',
    details: 'Created new store "Production API"',
    timestamp: '2025-01-20T14:35:00Z',
    ip: '192.168.1.1',
    category: 'store'
  },
  {
    id: '3',
    action: 'api_token_created',
    details: 'Generated new API token "Mobile App Token"',
    timestamp: '2025-01-20T14:40:00Z',
    ip: '192.168.1.1',
    category: 'security'
  },
  {
    id: '4',
    action: 'store_data_updated',
    details: 'Updated key "user:123" in store "Production API"',
    timestamp: '2025-01-20T14:45:00Z',
    ip: '192.168.1.1',
    category: 'data'
  },
  {
    id: '5',
    action: 'user_access_granted',
    details: 'Granted editor access to john@example.com for store "Production API"',
    timestamp: '2025-01-20T15:00:00Z',
    ip: '192.168.1.1',
    category: 'access'
  },
  {
    id: '6',
    action: 'store_deleted',
    details: 'Deleted store "Test Store"',
    timestamp: '2025-01-20T15:15:00Z',
    ip: '192.168.1.1',
    category: 'store'
  },
  {
    id: '7',
    action: 'api_call',
    details: 'API call to GET /store/abc123/user:456',
    timestamp: '2025-01-20T15:30:00Z',
    ip: '192.168.1.2',
    category: 'api'
  },
  {
    id: '8',
    action: 'logout',
    details: 'User logged out',
    timestamp: '2025-01-20T16:00:00Z',
    ip: '192.168.1.1',
    category: 'auth'
  }
];

const categoryIcons = {
  auth: Shield,
  store: Database,
  security: Key,
  data: FileText,
  access: User,
  api: Globe,
};

const categoryColors = {
  auth: 'bg-blue-500/10 text-blue-700 dark:text-blue-300',
  store: 'bg-purple-500/10 text-purple-700 dark:text-purple-300',
  security: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-300',
  data: 'bg-green-500/10 text-green-700 dark:text-green-300',
  access: 'bg-orange-500/10 text-orange-700 dark:text-orange-300',
  api: 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-300',
};

export function Logs() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');

  const filteredLogs = dummyLogs.filter(log => {
    const matchesSearch = log.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.action.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || log.category === selectedCategory;

    // Simple date filtering (in a real app, you'd want more sophisticated date handling)
    let matchesDate = true;
    if (dateFilter !== 'all') {
      const logDate = new Date(log.timestamp);
      const now = new Date();
      const daysDiff = Math.floor((now.getTime() - logDate.getTime()) / (1000 * 3600 * 24));

      switch (dateFilter) {
        case 'today':
          matchesDate = daysDiff === 0;
          break;
        case 'week':
          matchesDate = daysDiff <= 7;
          break;
        case 'month':
          matchesDate = daysDiff <= 30;
          break;
      }
    }

    return matchesSearch && matchesCategory && matchesDate;
  });

  const exportLogs = () => {
    const csv = [
      ['Timestamp', 'Action', 'Details', 'IP Address', 'Category'].join(','),
      ...filteredLogs.map(log => [
        log.timestamp,
        log.action,
        `"${log.details}"`,
        log.ip || '',
        log.category
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'kvs-logs.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Activity Logs {"(Work in Progess)"}</h1>
            <p className="text-muted-foreground">Monitor your account activity and API usage</p>
          </div>

          <Button onClick={exportLogs} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>

        <div className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search logs..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Filter by category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="auth">Authentication</SelectItem>
                    <SelectItem value="store">Store Management</SelectItem>
                    <SelectItem value="security">Security</SelectItem>
                    <SelectItem value="data">Data Operations</SelectItem>
                    <SelectItem value="access">Access Management</SelectItem>
                    <SelectItem value="api">API Calls</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={dateFilter} onValueChange={setDateFilter}>
                  <SelectTrigger className="w-full md:w-32">
                    <SelectValue placeholder="Date range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="week">This Week</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Shield className="w-5 h-5 text-blue-500" />
                  <div>
                    <p className="text-sm font-medium">Login Events</p>
                    <p className="text-2xl font-bold">
                      {dummyLogs.filter(log => log.category === 'auth').length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Database className="w-5 h-5 text-purple-500" />
                  <div>
                    <p className="text-sm font-medium">Store Operations</p>
                    <p className="text-2xl font-bold">
                      {dummyLogs.filter(log => log.category === 'store').length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Globe className="w-5 h-5 text-cyan-500" />
                  <div>
                    <p className="text-sm font-medium">API Calls</p>
                    <p className="text-2xl font-bold">
                      {dummyLogs.filter(log => log.category === 'api').length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-5 h-5 text-yellow-500" />
                  <div>
                    <p className="text-sm font-medium">Security Events</p>
                    <p className="text-2xl font-bold">
                      {dummyLogs.filter(log => log.category === 'security').length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Logs Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Recent Activity</span>
                <Badge variant="outline">{filteredLogs.length} events</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {filteredLogs.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No logs found</h3>
                  <p className="text-muted-foreground">
                    {searchQuery || selectedCategory !== 'all' || dateFilter !== 'all'
                      ? 'No logs match your current filters.'
                      : 'No activity logs available.'
                    }
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {filteredLogs.map((log) => {
                    const CategoryIcon = categoryIcons[log.category as keyof typeof categoryIcons] || FileText;
                    return (
                      <div key={log.id} className="p-4 hover:bg-muted/50 transition-colors">
                        <div className="flex items-start space-x-4">
                          <div className="flex-shrink-0">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <CategoryIcon className="w-5 h-5 text-primary" />
                            </div>
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-1">
                              <Badge
                                variant="outline"
                                className={categoryColors[log.category as keyof typeof categoryColors]}
                              >
                                {log.category}
                              </Badge>
                              <span className="text-sm font-medium">
                                {log.action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                              </span>
                            </div>

                            <p className="text-sm text-muted-foreground mb-2">
                              {log.details}
                            </p>

                            <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                              <div className="flex items-center space-x-1">
                                <Clock className="w-3 h-3" />
                                <span>{new Date(log.timestamp).toLocaleString()}</span>
                              </div>
                              {log.ip && (
                                <div className="flex items-center space-x-1">
                                  <Globe className="w-3 h-3" />
                                  <span>{log.ip}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}