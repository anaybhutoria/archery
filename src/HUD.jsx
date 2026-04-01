export default function HUD({ score, streak, coins, countdown, status, heard }) {
  return (
    <>
      <div className="score-panel">
        <div className="score">{score}</div>
        {streak >= 3 && <div className="multiplier">x{Math.floor(streak / 3) + 1}</div>}
        <div className="coins-display">
          <img src="/coin.png" alt="coins" className="coin-icon" />
          <span>{coins}</span>
        </div>
      </div>

      {countdown !== null && <div className="countdown">{countdown}</div>}
      <div className="status">{status}</div>
      {heard && <div className="heard">{heard}</div>}
    </>
  )
}
