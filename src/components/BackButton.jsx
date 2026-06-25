export default function BackButton({ onClick }) {
  return (
    <button type="button" className="chrome-cta" onClick={onClick}>
      <span className="chrome-cta-arrow" aria-hidden="true">&lt;--</span>
      <span className="chrome-cta-label">Back</span>
    </button>
  )
}
