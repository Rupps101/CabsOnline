type Page = 'book' | 'lookup' | 'driver';

interface NavbarProps {
  current_page: Page;
  on_navigate: (page: Page) => void;
}

const nav_items: { id: Page; label: string }[] = [
  { id: 'book', label: 'Book a Cab' },
  { id: 'lookup', label: 'My Booking' },
  { id: 'driver', label: 'Driver Panel' },
];

function Navbar({ current_page, on_navigate }: NavbarProps) {
  return (
    <header className="navbar">
      <div className="navbar-inner">
        <div className="navbar-logo">🚖 CabsOnline</div>
        <nav className="navbar-links">
          {nav_items.map((item) => (
            <button
              key={item.id}
              className={
                'nav-btn' + (current_page === item.id ? ' nav-btn--active' : '')
              }
              onClick={() => on_navigate(item.id)}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
}

export default Navbar;
