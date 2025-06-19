import { Shield } from "lucide-react";
import { HashLink } from "react-router-hash-link";"react-router-hash-link";

const Header = () => {
  return (
    <header className="bg-space-panel bg-opacity-90 border-b border-space-grid sticky top-0 z-50">
      <div className="container mx-auto flex justify-between items-center h-14 px-4">
        <HashLink to="/" className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-space-accent" />
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-500 to-space-accent bg-clip-text text-transparent">
            Project AuroGuard
          </h1>
        </HashLink>

        <nav className="flex items-center gap-6">
          <HashLink to="/" className="text-sm hover:text-space-accent transition-colors">Dashboard</HashLink>
          <HashLink to="/simulation" className="text-sm hover:text-space-accent transition-colors">Simulation</HashLink>
          <button className="tech-button bg-space-panel text-sm flex items-center gap-1">
            <span className="indicator-dot bg-space-success"></span>
            Radar: Clear
          </button>
        </nav>
      </div>
    </header>
  );
};

export default Header;
