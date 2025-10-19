import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { LoadingSpinner } from '../ui/loading-spinner';

export function AuthCallback() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    useEffect(() => {
        const token = searchParams.get('token');
        console.log('AuthCallback - Current URL:', window.location.href);
        console.log('AuthCallback - Token from URL:', token);

        if (token) {
            // Store the JWT token
            console.log('AuthCallback - Attempting to store token in localStorage');
            localStorage.setItem('auth_token', token);

            // Verify token was stored
            const storedToken = localStorage.getItem('auth_token');
            console.log('AuthCallback - Token stored successfully:', storedToken ? 'YES' : 'NO');
            console.log('AuthCallback - Stored token length:', storedToken?.length);
            console.log("storedToken:", storedToken);

            console.log('AuthCallback - Redirecting to /dashboard');
            navigate('/dashboard', { replace: true });
        } else {
            // No token found, redirect to home
            console.error('AuthCallback - No token received in callback');
            navigate('/', { replace: true });
        }
    }, [searchParams, navigate]);

    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center">
            <LoadingSpinner className="w-8 h-8 mb-4" />
            <p className="text-muted-foreground">Completing authentication...</p>
        </div>
    );
}
