import { Link } from 'react-router-dom';
import { Button } from '../ui/button';
import { useAuth } from '../../context/ContextHooks';
import { InteractiveConsole } from '../console/InteractiveTCPConsole';
import { ArrowLeft, LogIn, LayoutDashboard } from 'lucide-react';

export default function TryKVSppDemo() {
    const { user, login } = useAuth();
    return (
        <div className="p-4 sm:p-6">
            <div className="max-w-6xl mx-auto space-y-3 sm:space-y-4">
                <div className="flex flex-col sm:flex-row flex-wrap gap-2 mb-4">
                    <Link to="/" className="w-full sm:w-auto">
                        <Button variant="outline" className="w-full sm:w-auto">
                            <ArrowLeft className="w-4 h-4 mr-1" />
                            Back to Home
                        </Button>
                    </Link>
                    {!user ? (
                        <Button onClick={login} variant="default" className="w-full sm:w-auto">
                            <LogIn className="w-4 h-4 mr-1" />
                            <span className="hidden sm:inline">Login to Use the Real Thing</span>
                            <span className="sm:hidden">Login</span>
                        </Button>
                    ) : (
                        <Link to="/dashboard" className="w-full sm:w-auto">
                            <Button variant="default" className="w-full sm:w-auto">
                                <LayoutDashboard className="w-4 h-4 mr-1" />
                                Go to Dashboard
                            </Button>
                        </Link>
                    )}
                </div>
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">KVS++ Public Demo</h1>
                <p className="text-sm sm:text-base text-muted-foreground">Try KVS++ TCP commands live! No login required. This connects to a public demo store.</p>
                <InteractiveConsole storeToken="public" wsPath="/ws/tcp-proxy-demo" />
            </div>
        </div>
    );
}
