"use client";

import { useEffect } from "react";
import { reportViewItemList } from "@/lib/gtag";

type Item = {
  item_id: string;
  item_name: string;
  price: number;
  item_category?: string;
};

/**
 * Fires view_item_list when a product list is viewed (store, home carousel, etc.).
 */
export function ViewItemListTracker({
  items,
  listId,
  listName,
}: {
  items: Item[];
  listId: string;
  listName?: string;
}) {
  useEffect(() => {
    if (items.length > 0) {
      reportViewItemList(
        items.map((p) => ({
          item_id: p.item_id,
          item_name: p.item_name,
          price: p.price,
          item_category: p.item_category,
        })),
        listId,
        listName
      );
    }
  }, [items, listId, listName]);

  return null;
}
