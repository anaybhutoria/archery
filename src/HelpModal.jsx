export default function HelpModal({ showHelp, setShowHelp }) {
  if (!showHelp) return null
  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>How to Play</h2>
        <div className="modal-steps">
          <p><strong>1. Draw</strong> — Say "draw" to pull back the bow</p>
          <p><strong>2. Aim</strong> — Hum at different pitches to aim. Low pitch aims down, high pitch aims up</p>
          <p><strong>3. Shoot</strong> — Say "shoot" to start a 3-second countdown, keep aiming!</p>
          <p><strong>4. Score</strong> — Hit the target for 50 pts, bullseye for 100 pts. Earn coins to spend in the Shop</p>
          <p><strong>5. Shop</strong> — Say "shop" to toggle the store. Say "steady", "power", "big", or "eagle" to buy upgrades</p>
        </div>
        <button className="modal-btn" onClick={() => setShowHelp(false)}>Got it!</button>
      </div>
    </div>
  )
}
