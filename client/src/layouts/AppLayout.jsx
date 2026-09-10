import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import dcLogo from '../assets/dc-logo.png';
export function AppLayout() {
    const { user, logout } = useAuthStore();
    const location = useLocation();
    const nav = [['Consultancies', '/consultancies'], ['Explore countries', '/countries'], ['Community stories', '/study/visa'], ['Reviews', '/reviews'], ['Report', '/reports/new']];
    return <>
    <header className="site-header">
      <Link className="brand" to="/"><img className="brand-mark" src={dcLogo} alt="DC logo" /><span>dream<br /><em>chaser</em></span></Link>
      <nav>{nav.map(([label, to]) => <Link className={location.pathname === to ? 'active' : ''} to={to} key={to}>{label}</Link>)}</nav>
      <div className="nav-actions">{user ? <><Link className="plain-link" to={user.role === 'admin' ? '/admin' : '/dashboard'}>My space</Link><button className="link" onClick={logout}>Log out</button></> : <><Link className="plain-link" to="/login">Log in</Link><Link className="button button-small" to="/register">Get started <span>→</span></Link></>}</div>
    </header>
    <main><Outlet /></main>
    <footer><div className="footer-brand"><span className="footer-dot"></span>dream chaser</div><p>Clear information. Confident futures.</p><div><Link to="/consultancies">Consultancies</Link><Link to="/countries">Explore countries</Link><Link to="/reports/new">Report</Link><Link to="/study/visa">Community stories</Link></div></footer>
  </>;
}
