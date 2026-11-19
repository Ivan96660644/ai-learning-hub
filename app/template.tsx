/**
 * A template re-mounts on every navigation, so this CSS-only fade gives light
 * page-transition feedback. No exit animation and no JS: App Router navigation
 * and scroll restoration keep working as usual.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="page-enter">{children}</div>;
}
