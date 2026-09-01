import { useEffect, useState } from 'react';
import { http } from '../services/http';
export function ConnectionStatus() {
    const [state, setState] = useState('checking');
    useEffect(() => { http.get('/health').then(({ data }) => setState(data.mongo === 'connected' ? 'connected' : 'offline')).catch(() => setState('offline')); }, []);
    const text = state === 'checking' ? 'Checking server connection…' : state === 'connected' ? 'Frontend, backend, and MongoDB are connected.' : 'Backend or MongoDB is not connected.';
    return <p className={`connection ${state}`}>{text}</p>;
}
