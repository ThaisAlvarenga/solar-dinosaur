import './SiteMenu.css'

const MENU_LINKS = [
  { id: 'main', label: 'Main site' },
  { id: 'artist-statement', label: 'Artist statement / Context of the project / Overview' },
  { id: 'research', label: 'Research Links / Data points / References' },
  { id: 'team', label: 'Team section' },
]

export default function SiteMenu({ isOpen, onToggle, onNavigate }) {
  const handleLinkClick = (viewId) => {
    onNavigate(viewId)
    onToggle(false)
  }

  return (
    <div className="site-menu">
      <button
        type="button"
        className="site-logo menu-toggle"
        onClick={() => onToggle(!isOpen)}
        aria-expanded={isOpen}
        aria-controls="site-menu-overlay"
      >
        solar-dinosaur
      </button>

      <div
        id="site-menu-overlay"
        className={`menu-overlay${isOpen ? ' is-open' : ''}`}
        aria-hidden={!isOpen}
        onClick={() => onToggle(false)}
        role="presentation"
      >
        <nav
          className="menu-overlay-nav"
          aria-label="Site menu"
          onClick={(event) => event.stopPropagation()}
        >
          <ul className="menu-overlay-links">
            {MENU_LINKS.map((link) => (
              <li key={link.id}>
                <button
                  type="button"
                  className="menu-overlay-link"
                  onClick={() => handleLinkClick(link.id)}
                >
                  {link.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  )
}

export { MENU_LINKS }
