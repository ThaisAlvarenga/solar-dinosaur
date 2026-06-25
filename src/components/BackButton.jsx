import ChromeCtaArrow from './ChromeCtaArrow'

export default function BackButton({ onClick }) {
  return (
    <button type="button" className="chrome-cta" onClick={onClick}>
      <ChromeCtaArrow direction="left" />
      <span className="chrome-cta-label">Back</span>
    </button>
  )
}
