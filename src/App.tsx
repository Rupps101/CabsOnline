import { useState } from 'react';
import Navbar from './components/Navbar.tsx';
import BookingForm from './components/BookingForm.tsx';
import BookingLookup from './components/BookingLookup.tsx';
import DriverPanel from './components/DriverPanel.tsx';
import './index.css';

type Page = 'book' | 'lookup' | 'driver';

function App() {
  const [current_page, set_current_page] = useState<Page>('book');

  const render_page = () => {
    switch (current_page) {
      case 'book':
        return <BookingForm />;
      case 'lookup':
        return <BookingLookup />;
      case 'driver':
        return <DriverPanel />;
    }
  };

  return (
    <div className="app">
      <Navbar current_page={current_page} on_navigate={set_current_page} />
      <main className="main-content">{render_page()}</main>
      <footer className="site-footer">
        <p>&copy; 2026 CabsOnline. Auckland, New Zealand.</p>
      </footer>
    </div>
  );
}

export default App;
