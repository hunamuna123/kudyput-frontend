import { defineStore } from "pinia";

interface FavoritesState {
  ids: string[];
}

function loadFavorites(): string[] {
  if (import.meta.server) return [];
  try {
    const raw = localStorage.getItem("dk_favorites");
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveFavorites(ids: string[]) {
  if (import.meta.server) return;
  localStorage.setItem("dk_favorites", JSON.stringify(ids));
}

export const useFavoritesStore = defineStore("favorites", {
  state: (): FavoritesState => ({
    ids: [],
  }),

  getters: {
    isFavorite: (state) => (locationId: string) => state.ids.includes(locationId),
    count: (state) => state.ids.length,
  },

  actions: {
    load() {
      this.ids = loadFavorites();
    },

    toggle(locationId: string) {
      const idx = this.ids.indexOf(locationId);
      if (idx !== -1) {
        this.ids.splice(idx, 1);
      } else {
        this.ids.push(locationId);
      }
      saveFavorites(this.ids);
    },
  },
});
