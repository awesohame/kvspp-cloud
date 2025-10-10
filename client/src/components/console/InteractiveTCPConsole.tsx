import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { cn } from '@/lib/utils';
import { AlertCircle, ArrowDownCircle, ArrowUpCircle } from 'lucide-react';

export type ConsoleMessage =
    | { role: 'system'; text: string }
    | { role: 'server'; text: string }
    | { role: 'client'; text: string };

export interface InteractiveConsoleProps {
    storeToken: string;
    className?: string;
    wsPath?: string; // optional override for ws path (e.g. /ws/tcp-proxy-demo)
}

export function InteractiveConsole({ storeToken, className, wsPath }: InteractiveConsoleProps) {
    const [messages, setMessages] = useState<ConsoleMessage[]>([
        { role: 'system', text: 'Interactive mode connected to KVS++ TCP proxy. Type a command and press Enter.' },
    ]);
    const [input, setInput] = useState('');
    const [connected, setConnected] = useState(false);
    const [connecting, setConnecting] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const wsRef = useRef<WebSocket | null>(null);
    const endRef = useRef<HTMLDivElement | null>(null);

    const wsUrl = useMemo(() => {
        const origin = import.meta.env.VITE_WS_BASE_URL;
        if (wsPath) {
            return `${origin}${wsPath}`;
        }
        return `${origin}/ws/tcp-proxy?storeToken=${encodeURIComponent(storeToken)}`;
    }, [storeToken, wsPath]);

    useEffect(() => {
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;
        setConnecting(true);
        setError(null);

        ws.onopen = () => {
            setConnected(true);
            setConnecting(false);
        };

        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                if (data?.type === 'select_response') {
                    setMessages((prev) => [...prev, { role: 'system', text: String(data.payload ?? '') }]);
                } else if (data?.type === 'command_response') {
                    setMessages((prev) => [...prev, { role: 'server', text: String(data.payload ?? '') }]);
                } else if (data?.type === 'error') {
                    setMessages((prev) => [...prev, { role: 'system', text: `Error: ${String(data.message ?? 'Unknown error')}` }]);
                } else {
                    setMessages((prev) => [...prev, { role: 'system', text: `Unknown message: ${event.data}` }]);
                }
            } catch {
                setMessages((prev) => [...prev, { role: 'system', text: `Malformed server message` }]);
            }
        };

        ws.onerror = () => {
            setError('WebSocket error. Ensure you are logged in and have access to this store.');
        };

        ws.onclose = () => {
            setConnected(false);
            setConnecting(false);
            setMessages((prev) => [...prev, { role: 'system', text: 'Connection closed.' }]);
        };

        return () => {
            ws.close();
            wsRef.current = null;
        };
    }, [wsUrl]);

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const sendCommand = () => {
        const command = input.trim();
        if (!command || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;

        if (/^\s*select\b/i.test(command)) {
            setMessages((prev) => [
                ...prev,
                { role: 'client', text: command },
                { role: 'system', text: 'SELECT is not allowed after connection is established.' },
            ]);
            setInput('');
            return;
        }

        const payload = { type: 'command', payload: { command } };
        wsRef.current.send(JSON.stringify(payload));
        setMessages((prev) => [...prev, { role: 'client', text: command }]);
        setInput('');
    };

    const onKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            sendCommand();
        }
    };

    return (
        <Card className={cn('p-4 sm:p-6 flex flex-col h-[70vh] md:h-[72vh]', className)}>
            <div className="flex items-center justify-between mb-3">
                <div>
                    <div className="text-sm text-muted-foreground">Store</div>
                    <div className="font-medium break-all">{storeToken}</div>
                </div>
                <div className="text-right text-sm">
                    {connecting && <span className="text-muted-foreground">Connecting…</span>}
                    {!connecting && connected && <span className="text-green-600">Connected</span>}
                    {!connecting && !connected && <span className="text-red-600">Disconnected</span>}
                </div>
            </div>

            <div className="flex-1 overflow-auto rounded-md bg-muted p-3 text-sm">
                {messages.map((m, idx) => (
                    <div
                        key={idx}
                        className={cn(
                            'text-lg whitespace-pre-wrap break-words flex items-center gap-2',
                            {
                                'italic text-muted-foreground': m.role === 'system',
                                'font-semibold text-blue-600': m.role === 'client',
                                'text-green-500': m.role === 'server',
                            }
                        )}
                    >
                        {m.role === 'system' && (
                            <span className="inline-block align-middle" title="System">
                                <AlertCircle className="w-5 h-5" />
                            </span>
                        )}
                        {m.role === 'client' && <span className="inline-block align-middle" title="Client">
                            <ArrowUpCircle className="w-5 h-5" />
                        </span>}
                        {m.role === 'server' && <span className="inline-block align-middle" title="Server">
                            <ArrowDownCircle className="w-5 h-5" />
                        </span>}
                        <span>{m.text}</span>
                    </div>
                ))}
                <div ref={endRef} />
            </div>

            {error && (
                <div className="text-xs text-red-600 mt-2" role="alert">{error}</div>
            )}

            <div className="mt-3 flex gap-2">
                <Input
                    placeholder={connected ? 'Type a command like: GET mykey' : 'Connecting…'}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={onKeyDown}
                    disabled={!connected}
                    className="flex-1 !text-lg"
                />
                <Button onClick={sendCommand} disabled={!connected || !input.trim()}>Send</Button>
            </div>

            <div className="mt-2 text-sm text-muted-foreground">
                Tip: Commands mimics TCP connection behavior. SELECT is handled automatically and is forbidden on the cloud version.
            </div>
        </Card>
    );
}
