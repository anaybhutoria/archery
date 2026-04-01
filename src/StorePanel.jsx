import { UPGRADE_DEFS, getUpgradeCost } from './constants'

export default function StorePanel({ storeOpen, setStoreOpen, coins, setCoins, upgrades, setUpgrades }) {
  return (
    <>
      <button className={`store-toggle ${storeOpen ? 'shifted' : ''}`} onClick={() => setStoreOpen(o => !o)}>Shop</button>

      <div className={`store-panel ${storeOpen ? 'open' : ''}`}>
        <div className="store-header">
          <h2>Shop</h2>
          <div className="store-coins">
            <img src="/coin.png" alt="coins" className="coin-icon" />
            <span>{coins}</span>
          </div>
        </div>
        {Object.entries(UPGRADE_DEFS).map(([key, def]) => {
          const level = upgrades[key]
          const maxed = def.costs ? level >= def.costs.length : false
          const cost = getUpgradeCost(def, level)
          const canAfford = cost !== null && coins >= cost
          return (
            <div key={key} className="upgrade-card">
              <div className="upgrade-info">
                <div className="upgrade-name">{def.name} <span className="upgrade-level">Lv.{level}</span></div>
                <div className="upgrade-desc">{def.desc}</div>
              </div>
              <button
                disabled={maxed || !canAfford}
                onClick={() => {
                  if (maxed || !canAfford) return
                  setCoins(c => c - cost)
                  setUpgrades(u => ({ ...u, [key]: u[key] + 1 }))
                }}
              >
                {maxed ? 'MAX' : <><img src="/coin.png" alt="" className="coin-icon-sm" />{cost}</>}
              </button>
            </div>
          )
        })}
      </div>
    </>
  )
}
