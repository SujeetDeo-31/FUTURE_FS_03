import React, { useState } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

import Navbar from './components/Navbar';
import Hero from './components/Hero';
import FlavorConcierge from './components/FlavorConcierge';
import MenuExplorer from './components/MenuExplorer';
import Specials from './components/Specials';
import OurStory from './components/OurStory';
import Gallery from './components/Gallery';
import Testimonials from './components/Testimonials';
import ReservationForm from './components/ReservationForm';
import Footer from './components/Footer';

// Drawers & Overlays
import CartDrawer from './components/CartDrawer';
import UserDrawer from './components/UserDrawer';
import Lightbox from './components/Lightbox';
import AdminPanel from './components/AdminDashboard/AdminPanel';
import TableWelcomeModal from './components/TableWelcomeModal';

function AppContent() {
  const [adminOpen, setAdminOpen] = useState(false);
  const [lightbox, setLightbox] = useState({ isOpen: false, src: '', caption: '' });

  const handleOpenLightbox = (src, caption) => {
    setLightbox({ isOpen: true, src, caption });
  };

  const handleCloseLightbox = () => {
    setLightbox({ isOpen: false, src: '', caption: '' });
  };

  return (
    <>
      <Navbar onOpenAdmin={() => setAdminOpen(true)} />
      
      <main>
        <Hero />
        <FlavorConcierge />
        <MenuExplorer />
        <Specials />
        <OurStory />
        <Gallery onOpenLightbox={handleOpenLightbox} />
        <Testimonials />
        <ReservationForm />
      </main>

      <Footer onOpenAdmin={() => setAdminOpen(true)} />

      {/* Side Overlays & Drawers */}
      <CartDrawer />
      <UserDrawer />
      
      <Lightbox
        isOpen={lightbox.isOpen}
        src={lightbox.src}
        caption={lightbox.caption}
        onClose={handleCloseLightbox}
      />

      <AdminPanel
        isOpen={adminOpen}
        onClose={() => setAdminOpen(false)}
      />

      {/* QR Table Welcome Modal */}
      <TableWelcomeModal />
    </>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CartProvider>
          <AppContent />
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
