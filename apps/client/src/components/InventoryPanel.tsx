import { ITEM_LIBRARY, useGameStore } from "../state/useGameStore";

export function InventoryPanel() {
  const inventory = useGameStore((state) => state.inventory);
  const entries = Object.entries(inventory).filter(([, quantity]) => quantity > 0);

  if (entries.length === 0) {
    return <p className="inventory-empty">Loot chests or defeat enemies to discover gear.</p>;
  }

  return (
    <ul className="inventory-list">
      {entries.map(([itemId, quantity]) => {
        const item = ITEM_LIBRARY[itemId];
        if (!item) return null;
        return (
          <li key={itemId} className="inventory-entry">
            <div className="inventory-header">
              <strong>{item.name}</strong>
              <span className="inventory-quantity">x{quantity}</span>
            </div>
            <div className="inventory-subheader">
              <span className="inventory-tag">{item.type.toUpperCase()}</span>
              <span className="inventory-value">{item.value}g</span>
            </div>
            <p className="inventory-description">{item.description}</p>
          </li>
        );
      })}
    </ul>
  );
}
