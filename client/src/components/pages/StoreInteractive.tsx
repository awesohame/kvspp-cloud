import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { InteractiveConsole } from '../console/InteractiveTCPConsole';
import { Button } from '../ui/button';

export default function StoreInteractive() {
    const { token } = useParams<{ token: string }>();
    const navigate = useNavigate();

    if (!token) {
        return (
            <div className="p-4 sm:p-6">
                <Button variant="ghost" onClick={() => navigate('/dashboard/stores')}>
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to Stores
                </Button>
                <div className="mt-10 text-sm sm:text-base text-muted-foreground">Invalid store token.</div>
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-6">
            <div className="max-w-7xl mx-auto space-y-3 sm:space-y-4">
                <div>
                    <Button variant="ghost" onClick={() => navigate(`/dashboard/stores/${token}`)}>
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        <span className="hidden sm:inline">Back to Store</span>
                        <span className="sm:hidden">Back</span>
                    </Button>
                </div>

                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">Interactive Mode</h1>
                <p className="text-sm sm:text-base text-muted-foreground">Send commands to your store directly and see responses instantly.</p>

                <InteractiveConsole storeToken={token} />
            </div>
        </div>
    );
}
