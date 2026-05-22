import { Link, NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { to: '/restaurants', label: 'Restaurants', roles: ['customer', 'restaurantOwner', 'deliveryPartner', 'admin'] },
  { to: '/cart', label: 'Cart', roles: ['customer', 'admin'] },
  { to: '/orders', label: 'Orders', roles: ['customer', 'restaurantOwner', 'deliveryPartner', 'admin'] },
  { to: '/dashboard/customer', label: 'Customer', roles: ['customer', 'admin'] },
  { to: '/dashboard/owner', label: 'Owner', roles: ['restaurantOwner', 'admin'] },
  { to: '/dashboard/delivery', label: 'Delivery', roles: ['deliveryPartner', 'admin'] },
  { to: '/dashboard/admin', label: 'Admin', roles: ['admin'] },
];

export default function AppShell() {
  const { user, logout } = useAuth();

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-block">
          <div className="brand-mark">F</div>
          <div>
            <h1>FoodFlow</h1>
            <p>Online ordering suite</p>
          </div>
        </div>

        <nav className="nav-list">
          {navItems
            .filter((item) => !item.roles || item.roles.includes(user?.role))
            .map((item) => (
              <NavLink key={item.to} to={item.to} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                {item.label}
              </NavLink>
            ))}
        </nav>
      </aside>

      <main className="main-panel">
        <header className="topbar">
          <div>
            <span className="eyebrow">Role-based delivery platform</span>
            <h2>Welcome back{user ? `, ${user.name}` : ''}</h2>
          </div>
          <div className="topbar-actions">
            <Link className="ghost-button" to="/login" onClick={logout}>
              Logout
            </Link>
          </div>
        </header>

        <section className="content-card">
          <Outlet />
        </section>
      </main>
    </div>
  );
}
