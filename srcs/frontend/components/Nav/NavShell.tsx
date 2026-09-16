// components/Nav/NavShell.tsx
import { navStyles } from "./nav-styles";

interface NavShellProps {
  children: React.ReactNode;
  /** Optional second row rendered under the main bar (e.g. mobile dropdown) */
  below?: React.ReactNode;
}

export function NavShell({ children, below }: NavShellProps) {
  return (
    <nav className={navStyles.shell}>
      <div className={navStyles.inner}>{children}</div>
      {below}
    </nav>
  );
}