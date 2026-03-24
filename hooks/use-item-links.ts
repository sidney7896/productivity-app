"use client";

import { useState, useEffect, useCallback } from "react";
import { ItemLink, LinkableType } from "@/types";
import { getItem, setItem, generateId } from "@/lib/store";

const STORAGE_KEY = "productivity-item-links";

export function useItemLinks() {
  const [links, setLinks] = useState<ItemLink[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLinks(getItem<ItemLink[]>(STORAGE_KEY, []));
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) setItem(STORAGE_KEY, links);
  }, [links, loaded]);

  const addLink = useCallback(
    (fromType: LinkableType, fromId: string, toType: LinkableType, toId: string) => {
      // Prevent duplicate links
      const exists = links.some(
        (l) =>
          (l.fromType === fromType && l.fromId === fromId && l.toType === toType && l.toId === toId) ||
          (l.fromType === toType && l.fromId === toId && l.toType === fromType && l.toId === fromId)
      );
      if (exists) return;

      const link: ItemLink = {
        id: generateId(),
        fromType,
        fromId,
        toType,
        toId,
      };
      setLinks((prev) => [...prev, link]);
    },
    [links]
  );

  const removeLink = useCallback((linkId: string) => {
    setLinks((prev) => prev.filter((l) => l.id !== linkId));
  }, []);

  // Get all links for a specific item (bidirectional)
  const getLinksForItem = useCallback(
    (type: LinkableType, id: string) => {
      return links
        .filter(
          (l) =>
            (l.fromType === type && l.fromId === id) ||
            (l.toType === type && l.toId === id)
        )
        .map((l) => {
          // Return the "other" side of the link
          if (l.fromType === type && l.fromId === id) {
            return { linkId: l.id, type: l.toType, id: l.toId };
          }
          return { linkId: l.id, type: l.fromType, id: l.fromId };
        });
    },
    [links]
  );

  // Convenience: get only linked notes for an item
  const getLinkedNotes = useCallback(
    (type: LinkableType, id: string) => {
      return getLinksForItem(type, id).filter((l) => l.type === "note");
    },
    [getLinksForItem]
  );

  // Check if two items are linked
  const areLinked = useCallback(
    (typeA: LinkableType, idA: string, typeB: LinkableType, idB: string) => {
      return links.some(
        (l) =>
          (l.fromType === typeA && l.fromId === idA && l.toType === typeB && l.toId === idB) ||
          (l.fromType === typeB && l.fromId === idB && l.toType === typeA && l.toId === idA)
      );
    },
    [links]
  );

  return { links, loaded, addLink, removeLink, getLinksForItem, getLinkedNotes, areLinked };
}
