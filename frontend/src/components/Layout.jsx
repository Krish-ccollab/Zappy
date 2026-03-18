import { useMemo } from 'react';
import Navbar from './Navbar';

const Layout = ({ children, requests = [], onRespond, onSearchPick }) => {
  const safeRequests = useMemo(() => requests || [], [requests]);

  return (
    <div className="app-shell">
      <Navbar requests={safeRequests} onRespond={onRespond} onSearchPick={onSearchPick} />
      <main>{children}</main>
    </div>
  );
};

export default Layout;
