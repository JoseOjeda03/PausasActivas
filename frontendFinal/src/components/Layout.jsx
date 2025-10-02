import React from "react";

const Layout = ({ children }) => {
  return (
    <>
      <nav className="navbar navbar-dark bg-dark">
        <div className="container">
          <span className="navbar-brand mb-0 h1">Monitor de Postura</span>
        </div>
      </nav>
      <main>{children}</main>
    </>
  );
};

export default Layout;
