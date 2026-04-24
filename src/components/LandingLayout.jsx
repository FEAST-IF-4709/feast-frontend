import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';

const LandingLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-feast-bg font-vietnam">
      <Navbar />
      <main className="pt-20">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default LandingLayout;
