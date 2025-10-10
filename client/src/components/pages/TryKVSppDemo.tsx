import { Link } from 'react-router-dom';
import { Button } from '../ui/button';
import { useAuth } from '../../context/ContextHooks';
import { InteractiveConsole } from '../console/InteractiveTCPConsole';
import { ArrowLeft, LogIn, LayoutDashboard } from 'lucide-react';

export default function TryKVSppDemo() {
    const { user, login } = useAuth();
    return (
        <div className="p-6">
            <div className="max-w-2xl mx-auto space-y-4">
                <div className="flex flex-wrap gap-2 mb-4">
                    <Link to="/">
                        <Button variant="outline">
                            <ArrowLeft className="w-4 h-4 mr-1" />
                            Back to Home
                        </Button>
                    </Link>
                    {!user ? (
                        <Button onClick={login} variant="default">
                            <LogIn className="w-4 h-4 mr-1" />
                            Login to Use the Real Thing
                        </Button>
                    ) : (
                        <Link to="/dashboard">
                            <Button variant="default">
                                <LayoutDashboard className="w-4 h-4 mr-1" />
                                Go to Dashboard
                            </Button>
                        </Link>
                    )}
                </div>
                <h1 className="text-2xl md:text-3xl font-bold">KVS++ Public Demo</h1>
                <p className="text-muted-foreground">Try KVS++ TCP commands live! No login required. This connects to a public demo store.</p>
                <InteractiveConsole storeToken="public" wsPath="/ws/tcp-proxy-demo" />
            </div>
        </div>
    );
}
