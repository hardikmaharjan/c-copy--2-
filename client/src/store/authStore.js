import { create } from 'zustand';
function storedUser() {
    try {
        const value = JSON.parse(localStorage.getItem('user') || 'null');
        return value && typeof value.id === 'string' && typeof value.name === 'string' && typeof value.email === 'string' && ['student', 'admin'].includes(value.role) ? value : null;
    }
    catch {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        return null;
    }
}
export const useAuthStore = create((set) => ({ user: storedUser(), setUser: (user) => { user ? localStorage.setItem('user', JSON.stringify(user)) : localStorage.removeItem('user'); set({ user }); }, logout: () => { localStorage.removeItem('token'); localStorage.removeItem('user'); set({ user: null }); } }));
