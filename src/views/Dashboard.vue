<script>
import { mapState } from 'pinia';
import { useWatchlistStore } from '../stores/watchlist';
import { useAuthStore } from '../stores/auth';
export default {
  data() {
    return {
      showResetModal: false,
      ratingModal: { show: false, anime: null, tempRating: 8.5 },
      searchQuery: '',
      statusFilter: 'All',
      sortBy: 'default',
      catalogId: '',
      newAnime: {
        title: '',
        genre: 'Action',
        rating: 8.5,
        status: 'Plan to Watch',
        image: '/images/komi.jpg',
        synopsis: ''
      },
      formError: '',
      toastMessage: '',
      toastTimeout: null,
      lastFocus: null
    };
  },
  computed: {
    ...mapState(useWatchlistStore, {
      animeList: 'items',
      featuredAnimeId: 'spotlightId',
      catalog: 'catalog',
      loading: 'loading',
      busy: 'busy',
      loadError: 'loadError',
      actionError: 'actionError',
      metadata: 'metadata'
    }),
    ...mapState(useAuthStore, ['user']),
    featuredAnime() {
      return (
        this.animeList.find((a) => a.id === this.featuredAnimeId) ||
        this.animeList.find((a) => a.isFavorite) ||
        this.animeList[0] ||
        null
      );
    },
    filteredAnime() {
      const query = this.searchQuery.toLowerCase().trim();
      const list = this.animeList.filter(
        (a) =>
          (a.title.toLowerCase().includes(query) || a.genre.toLowerCase().includes(query)) &&
          (this.statusFilter === 'All' || a.status === this.statusFilter)
      );
      const sorts = {
        'rating-high': (a, b) => b.rating - a.rating,
        'rating-low': (a, b) => a.rating - b.rating,
        'title-az': (a, b) => a.title.localeCompare(b.title),
        'title-za': (a, b) => b.title.localeCompare(a.title)
      };
      return sorts[this.sortBy] ? list.sort(sorts[this.sortBy]) : list;
    },
    totalAnime() {
      return this.animeList.length;
    },
    watchingCount() {
      return this.animeList.filter((a) => a.status === 'Watching').length;
    },
    completedCount() {
      return this.animeList.filter((a) => a.status === 'Completed').length;
    },
    planToWatchCount() {
      return this.animeList.filter((a) => a.status === 'Plan to Watch').length;
    },
    favoriteCount() {
      return this.animeList.filter((a) => a.isFavorite).length;
    },
    statusOptions() {
      return ['All', ...this.metadata.statuses];
    },
    availableGenres() {
      return this.metadata.genres;
    },
    presetImages() {
      return this.metadata.posters.map((p) => ({ label: p.title, path: p.image }));
    }
  },
  methods: {
    async loadCollection() {
      await useWatchlistStore().load();
    },
    async perform(action, success) {
      try {
        const result = await action();
        if (result !== undefined) {
          this.showToast(success);
          return true;
        }
      } catch {
        return false;
      }
      return false;
    },
    async setSpotlight(anime) {
      if (await this.perform(() => useWatchlistStore().spotlight(anime.id), 'Spotlight updated.'))
        window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    async nextSpotlight() {
      if (this.animeList.length < 2) return;
      const index = this.animeList.findIndex((a) => a.id === this.featuredAnime.id);
      await this.setSpotlight(this.animeList[(index + 1) % this.animeList.length]);
    },
    async openModal() {
      this.lastFocus = document.activeElement;
      await this.$nextTick();
      this.$el.querySelector('[role="dialog"]')?.focus();
    },
    restoreFocus() {
      this.lastFocus?.focus();
    },
    openRatingModal(anime) {
      this.ratingModal = { show: true, anime, tempRating: anime.rating };
      this.openModal();
    },
    closeRatingModal() {
      if (this.busy) return;
      this.ratingModal.show = false;
      this.ratingModal.anime = null;
      this.restoreFocus();
    },
    async saveRatingModal() {
      if (!this.ratingModal.anime) return;
      if (
        await this.perform(
          () =>
            useWatchlistStore().update(this.ratingModal.anime.id, {
              rating: Number(this.ratingModal.tempRating)
            }),
          'Rating saved.'
        )
      )
        this.closeRatingModal();
    },
    async toggleFavorite(anime) {
      await this.perform(
        () => useWatchlistStore().update(anime.id, { isFavorite: !anime.isFavorite }),
        anime.isFavorite ? 'Removed from favorites.' : 'Added to favorites.'
      );
    },
    async changeStatus(anime) {
      const statuses = this.metadata.statuses;
      const status = statuses[(statuses.indexOf(anime.status) + 1) % statuses.length];
      await this.perform(
        () => useWatchlistStore().update(anime.id, { status }),
        'Watch status updated.'
      );
    },
    async removeAnime(id) {
      await this.perform(
        () => useWatchlistStore().remove(id),
        'Anime removed from your collection.'
      );
    },
    async addAnime() {
      this.formError = '';
      if (!this.newAnime.title.trim()) {
        this.formError = 'Please enter an anime title.';
        return;
      }
      const input = {
        ...this.newAnime,
        title: this.newAnime.title.trim(),
        image: this.newAnime.image.trim() || '/images/komi.jpg',
        rating: Number(this.newAnime.rating)
      };
      if (await this.perform(() => useWatchlistStore().add(input), 'Added to your watchlist.')) {
        this.newAnime = {
          title: '',
          genre: 'Action',
          rating: 8.5,
          status: 'Plan to Watch',
          image: '/images/komi.jpg',
          synopsis: ''
        };
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else this.formError = this.actionError;
    },
    async addFromCatalog() {
      if (!this.catalogId) return;
      if (
        await this.perform(
          () => useWatchlistStore().add({ animeId: this.catalogId }),
          'Added from the catalog.'
        )
      )
        this.catalogId = '';
    },
    setFormImage(path) {
      this.newAnime.image = path;
    },
    handleFileUpload(event) {
      const file = event.target.files?.[0];
      if (!file) return;
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 1048576) {
        this.formError = 'Choose a JPEG, PNG, or WebP image smaller than 1 MB.';
        event.target.value = '';
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        this.newAnime.image = reader.result;
        this.formError = '';
        this.showToast('Poster ready to save with your anime.');
      };
      reader.onerror = () => {
        this.formError = 'Could not read the image.';
      };
      reader.readAsDataURL(file);
    },
    setStatusFilter(status) {
      this.statusFilter = status;
    },
    resetFilters() {
      this.searchQuery = '';
      this.statusFilter = 'All';
      this.sortBy = 'default';
    },
    openResetModal() {
      this.showResetModal = true;
      this.openModal();
    },
    closeResetModal() {
      if (this.busy) return;
      this.showResetModal = false;
      this.restoreFocus();
    },
    async confirmReset() {
      if (
        await this.perform(() => useWatchlistStore().reset(), 'Collection reset from the catalog.')
      ) {
        this.resetFilters();
        this.closeResetModal();
      }
    },
    showToast(message) {
      this.toastMessage = message;
      clearTimeout(this.toastTimeout);
      this.toastTimeout = setTimeout(() => {
        this.toastMessage = '';
      }, 2600);
    },
    modalKeys(event) {
      if (!this.showResetModal && !this.ratingModal.show) return;
      if (event.key === 'Escape') {
        this.closeResetModal();
        this.closeRatingModal();
      }
      if (event.key !== 'Tab') return;
      const elements = [
        ...this.$el.querySelectorAll(
          '[role="dialog"] button:not(:disabled), [role="dialog"] input:not(:disabled)'
        )
      ];
      const first = elements[0];
      const last = elements.at(-1);
      if (
        event.shiftKey &&
        (document.activeElement === first ||
          document.activeElement.getAttribute('role') === 'dialog')
      ) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    }
  },
  mounted() {
    this.loadCollection();
  },
  beforeUnmount() {
    clearTimeout(this.toastTimeout);
  }
};
</script>
<template>
  <div @keydown="modalKeys">
    <div class="container dashboard-topbar">
      <div>
        <h1>Your watchlist.</h1>
        <p>Welcome back, {{ user?.name }}. What are we watching next?</p>
      </div>
      <div class="header-actions">
        <a href="#add-anime-section" class="btn btn-primary-action">+ Add anime</a
        ><button
          class="btn btn-glass"
          :disabled="busy || loading || !!loadError"
          @click="openResetModal"
        >
          Reset collection
        </button>
      </div>
    </div>
    <main class="container dashboard-content" :aria-busy="busy">
      <div v-if="loading" class="loading-skeleton" role="status">Loading your watchlist…</div>
      <div v-if="loadError" class="state-panel" role="alert">
        <h2>Could not load your watchlist</h2>
        <p>{{ loadError }}</p>
        <button :disabled="busy" class="btn btn-primary-action" @click="loadCollection">
          Try again
        </button>
      </div>
      <div v-if="actionError" class="form-error" role="alert">{{ actionError }}</div>
      <div v-if="!loading && !loadError">
        <section v-if="featuredAnime" class="hero-billboard">
          <div
            class="hero-backdrop"
            :style="{ backgroundImage: 'url(' + featuredAnime.image + ')' }"
          ></div>
          <div class="hero-gradient-overlay"></div>

          <div class="hero-content">
            <div class="hero-tagline">
              <span class="anitrack-pill">⛩️ ANITRACK SPOTLIGHT</span>
              <span class="tagline-sub">• FEATURED PICK</span>
            </div>

            <h2 class="hero-title">{{ featuredAnime.title }}</h2>

            <div class="hero-meta">
              <button
                :disabled="busy"
                @click="openRatingModal(featuredAnime)"
                class="hero-rating-badge"
                title="Click to edit rating with slider"
                style="cursor: pointer; border: none"
              >
                ★ {{ featuredAnime.rating.toFixed(1) }} / 10 ✏️
              </button>
              <span class="hero-genre-pill">{{ featuredAnime.genre }}</span>

              <span v-if="featuredAnime.status === 'Watching'" class="status-badge badge-watching">
                Watching
              </span>
              <span
                v-else-if="featuredAnime.status === 'Completed'"
                class="status-badge badge-completed"
              >
                Completed
              </span>
              <span v-else class="status-badge badge-plan"> Plan to Watch </span>
            </div>

            <p class="hero-synopsis">
              {{ featuredAnime.synopsis || 'A title in your personal anime watchlist collection.' }}
            </p>

            <div class="hero-actions">
              <button
                :disabled="busy"
                @click="changeStatus(featuredAnime)"
                class="btn btn-primary-action"
              >
                <span>🔄</span> Status: {{ featuredAnime.status }}
              </button>

              <button :disabled="busy" @click="toggleFavorite(featuredAnime)" class="btn btn-glass">
                <span v-if="featuredAnime.isFavorite">❤️ Favorited</span>
                <span v-else>🤍 Favorite</span>
              </button>

              <button
                :disabled="busy"
                @click="nextSpotlight"
                class="btn btn-glass"
                title="Cycle to next anime in spotlight"
              >
                <span>🎲</span> Next Spotlight
              </button>
            </div>
          </div>

          <div class="hero-poster-showcase">
            <div class="hero-poster-card">
              <img
                :src="featuredAnime.image"
                :alt="featuredAnime.title"
                class="hero-showcase-img"
              />
              <div class="hero-poster-glow"></div>
              <div class="hero-poster-badge">★ {{ featuredAnime.rating.toFixed(1) }}</div>
            </div>
          </div>
        </section>

        <section class="stats-section">
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-icon">📺</div>
              <div class="stat-info">
                <span class="stat-label">Total Anime</span>

                <span class="stat-value">{{ totalAnime }}</span>
              </div>
            </div>

            <div class="stat-card">
              <div class="stat-icon">▶️</div>
              <div class="stat-info">
                <span class="stat-label">Watching</span>

                <span class="stat-value">{{ watchingCount }}</span>
              </div>
            </div>

            <div class="stat-card">
              <div class="stat-icon">✅</div>
              <div class="stat-info">
                <span class="stat-label">Completed</span>

                <span class="stat-value">{{ completedCount }}</span>
              </div>
            </div>

            <div class="stat-card">
              <div class="stat-icon">🔖</div>
              <div class="stat-info">
                <span class="stat-label">Plan to Watch</span>

                <span class="stat-value">{{ planToWatchCount }}</span>
              </div>
            </div>

            <div class="stat-card">
              <div class="stat-icon">💖</div>
              <div class="stat-info">
                <span class="stat-label">Favorites</span>

                <span class="stat-value">{{ favoriteCount }}</span>
              </div>
            </div>
          </div>
        </section>

        <section class="controls-section">
          <div class="controls-card">
            <div class="search-row">
              <div class="search-wrapper">
                <span class="search-icon">🔍</span>

                <input
                  type="text"
                  v-model="searchQuery"
                  placeholder="Search anime by title or genre..."
                  class="search-input"
                  aria-label="Search anime by title or genre"
                />

                <button
                  :disabled="busy"
                  v-if="searchQuery"
                  @click="searchQuery = ''"
                  class="search-clear-btn"
                  title="Clear search"
                >
                  ✕
                </button>
              </div>

              <div class="sort-wrapper">
                <select v-model="sortBy" aria-label="Sort watchlist">
                  <option value="default">Sort: Default</option>
                  <option value="rating-high">Highest Rating (10-1)</option>
                  <option value="rating-low">Lowest Rating (1-10)</option>
                  <option value="title-az">Title (A - Z)</option>
                  <option value="title-za">Title (Z - A)</option>
                </select>
              </div>
            </div>

            <div class="filter-row">
              <div class="filter-pills">
                <button
                  :disabled="busy"
                  v-for="status in statusOptions"
                  :key="status"
                  @click="setStatusFilter(status)"
                  :class="['filter-btn', { active: statusFilter === status }]"
                >
                  {{ status }}

                  <span class="filter-count" v-if="status === 'All'">{{ totalAnime }}</span>
                  <span class="filter-count" v-else-if="status === 'Watching'">{{
                    watchingCount
                  }}</span>
                  <span class="filter-count" v-else-if="status === 'Completed'">{{
                    completedCount
                  }}</span>
                  <span class="filter-count" v-else>{{ planToWatchCount }}</span>
                </button>
              </div>

              <div class="results-meta">
                Showing <strong>{{ filteredAnime.length }}</strong> of {{ totalAnime }} anime
              </div>
            </div>
          </div>
        </section>

        <section id="anime-grid-section" class="anime-grid-section">
          <div class="section-header">
            <h2 class="section-title">
              <span v-if="statusFilter === 'All'">All Watchlist ({{ filteredAnime.length }})</span>
              <span v-else>{{ statusFilter }} Anime ({{ filteredAnime.length }})</span>
            </h2>
            <a href="#add-anime-section" class="btn btn-glass"> <span>+</span> Add Anime </a>
          </div>

          <div v-if="filteredAnime.length === 0" class="empty-state">
            <div class="empty-icon">📭</div>
            <h3 class="empty-title">No anime here yet.</h3>
            <p class="empty-desc">
              Add your first title below, browse the catalog, or reset your filters.
            </p>

            <button :disabled="busy" @click="resetFilters" class="btn btn-primary-action">
              Reset Filters
            </button>
          </div>

          <div v-else class="anime-grid">
            <div v-for="anime in filteredAnime" :key="anime.id" class="anime-card">
              <div
                class="card-poster"
                @click="setSpotlight(anime)"
                title="Click to view in Spotlight Hero"
              >
                <img :src="anime.image" :alt="anime.title" class="card-img" loading="lazy" />

                <div class="card-top-badges">
                  <button
                    :disabled="busy"
                    @click.stop="openRatingModal(anime)"
                    class="card-rating-badge"
                    title="Click to edit rating score with slider"
                    style="cursor: pointer; font-family: inherit"
                  >
                    <span>★</span>

                    <span>{{ anime.rating.toFixed(1) }}</span>
                  </button>

                  <div class="card-top-actions">
                    <button
                      :disabled="busy"
                      @click.stop="toggleFavorite(anime)"
                      :class="['card-fav-btn', { 'is-favorite': anime.isFavorite }]"
                      :title="anime.isFavorite ? 'Remove from favorites' : 'Add to favorites'"
                    >
                      <span v-if="anime.isFavorite">❤️</span>
                      <span v-else>🤍</span>
                    </button>

                    <button
                      :disabled="busy"
                      @click.stop="removeAnime(anime.id)"
                      class="card-delete-btn"
                      title="Remove this anime from collection"
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                <div class="poster-bottom-brand">
                  <span class="brand-badge">⛩️</span>
                  <span class="brand-text">ANITRACK</span>
                </div>
              </div>

              <div class="card-body">
                <div class="card-tags">
                  <span class="genre-tag">{{ anime.genre }}</span>

                  <span v-if="anime.status === 'Watching'" class="status-badge badge-watching">
                    Watching
                  </span>
                  <span
                    v-else-if="anime.status === 'Completed'"
                    class="status-badge badge-completed"
                  >
                    Completed
                  </span>
                  <span v-else class="status-badge badge-plan"> Plan to Watch </span>
                </div>

                <h3 class="card-title">{{ anime.title }}</h3>

                <div class="card-footer">
                  <button
                    :disabled="busy"
                    @click.stop="changeStatus(anime)"
                    class="btn-cycle-status"
                    title="Click to cycle status: Plan to Watch → Watching → Completed"
                  >
                    <span>🔄</span> {{ anime.status }}
                  </button>

                  <button
                    :disabled="busy"
                    @click.stop="setSpotlight(anime)"
                    class="btn-spotlight"
                    title="Feature this anime in the Hero Spotlight"
                  >
                    ✨ Spotlight
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section class="catalog-add">
          <label for="catalog-title">Add from the catalog</label
          ><select id="catalog-title" v-model="catalogId">
            <option value="">Choose a title…</option>
            <option v-for="anime in catalog" :key="anime.id" :value="anime.id">
              {{ anime.title }}
            </option></select
          ><button class="btn btn-glass" :disabled="busy || !catalogId" @click="addFromCatalog">
            Add to watchlist
          </button>
        </section>
        <section id="add-anime-section" class="add-anime-section">
          <div class="form-card">
            <div class="form-header">
              <div>
                <h2 class="form-title"><span>➕</span> Add New Anime to Collection</h2>
                <p class="form-subtitle">
                  Add a title to your personal watchlist with custom rating, watch status, and
                  poster image.
                </p>
              </div>
            </div>

            <form @submit.prevent="addAnime" class="anime-form">
              <div v-if="formError" class="form-error">
                <span>⚠️</span>
                <span>{{ formError }}</span>
              </div>

              <div class="form-grid">
                <div class="form-group">
                  <label for="anime-title" class="form-label">Anime Title *</label>

                  <input
                    id="anime-title"
                    type="text"
                    v-model="newAnime.title"
                    placeholder="e.g. Komi Can't Communicate, Bleach, Vinland Saga"
                    class="form-input"
                    required
                  />
                </div>

                <div class="form-group">
                  <label for="anime-genre" class="form-label">Genre</label>

                  <select id="anime-genre" v-model="newAnime.genre" class="form-select">
                    <option v-for="g in availableGenres" :key="g" :value="g">{{ g }}</option>
                  </select>
                </div>

                <div class="form-group">
                  <label for="anime-rating" class="form-label">Personal Rating (1.0 to 10.0)</label>
                  <div class="rating-input-row">
                    <input
                      id="anime-rating"
                      type="range"
                      min="1"
                      max="10"
                      step="0.1"
                      v-model.number="newAnime.rating"
                    />

                    <span class="rating-preview-badge">★ {{ newAnime.rating }} / 10</span>
                  </div>
                </div>

                <div class="form-group">
                  <label for="anime-status" class="form-label">Watch Status</label>

                  <select id="anime-status" v-model="newAnime.status" class="form-select">
                    <option value="Plan to Watch">Plan to Watch</option>
                    <option value="Watching">Watching</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>

                <div class="form-group full-width">
                  <label for="anime-image" class="form-label"
                    >Cover Image (Type path, pick preset, or choose any JPG from your PC)</label
                  >

                  <div class="image-input-container">
                    <input
                      id="anime-image"
                      type="text"
                      v-model="newAnime.image"
                      placeholder="e.g. images/komi.jpg or paste image URL"
                      class="form-input"
                    />

                    <label
                      class="btn-file-upload"
                      title="Upload any JPG/PNG image from your computer"
                    >
                      📁 Choose JPG from PC
                      <input
                        type="file"
                        @change="handleFileUpload"
                        accept="image/*"
                        style="display: none"
                      />
                    </label>
                  </div>

                  <div class="quick-image-pills">
                    <span
                      style="font-size: 0.76rem; color: var(--text-secondary); align-self: center"
                      >Catalog posters:</span
                    >

                    <button
                      type="button"
                      v-for="preset in presetImages"
                      :key="preset.path"
                      @click="setFormImage(preset.path)"
                      class="quick-img-btn"
                    >
                      {{ preset.label }}
                    </button>
                  </div>
                </div>

                <div class="form-group full-width">
                  <label for="anime-synopsis" class="form-label"
                    >Story Summary / Synopsis (Shown in Spotlight Hero)</label
                  >

                  <textarea
                    id="anime-synopsis"
                    v-model="newAnime.synopsis"
                    placeholder="Write a brief story summary or premise for this anime (e.g. A legendary warrior embarks on a journey across uncharted lands...)"
                    class="form-input form-textarea"
                    rows="3"
                  ></textarea>
                </div>
              </div>

              <div class="form-actions">
                <button :disabled="busy" type="submit" class="btn btn-primary-action">
                  <span>+</span> {{ busy ? 'Saving…' : 'Add to Watchlist' }}
                </button>
              </div>
            </form>
          </div>
        </section>
      </div>
    </main>

    <div v-if="showResetModal" class="modal-backdrop" @click.self="closeResetModal">
      <div
        class="modal-card"
        role="dialog"
        aria-modal="true"
        tabindex="-1"
        aria-label="Watchlist confirmation"
      >
        <div v-if="actionError" class="form-error" role="alert">{{ actionError }}</div>
        <div class="modal-icon-circle">
          <span>↺</span>
        </div>
        <h3 class="modal-title">Reset Watchlist?</h3>
        <p class="modal-description">
          Are you sure you want to reset your watchlist with the current catalog titles, all marked
          Plan to Watch? Any custom anime you added will be cleared.
        </p>
        <div class="modal-actions">
          <button :disabled="busy" @click="closeResetModal" class="btn btn-glass">Cancel</button>
          <button :disabled="busy" @click="confirmReset" class="btn btn-primary-action">
            <span>↺</span> Yes, Reset Watchlist
          </button>
        </div>
      </div>
    </div>

    <div v-if="ratingModal.show" class="modal-backdrop" @click.self="closeRatingModal">
      <div
        class="modal-card"
        role="dialog"
        aria-modal="true"
        tabindex="-1"
        aria-label="Watchlist confirmation"
      >
        <div v-if="actionError" class="form-error" role="alert">{{ actionError }}</div>
        <div class="modal-icon-circle rating-icon-circle">
          <span>⭐</span>
        </div>
        <h3 class="modal-title">
          Rate {{ ratingModal.anime ? '"' + ratingModal.anime.title + '"' : 'Anime' }}
        </h3>
        <p class="modal-description">
          Adjust your personal score using the slider below (1.0 to 10.0):
        </p>

        <div class="modal-rating-preview">
          <span class="modal-rating-score">★ {{ Number(ratingModal.tempRating).toFixed(1) }}</span>
          <span class="modal-rating-max">/ 10</span>
        </div>

        <div class="modal-slider-container">
          <input
            type="range"
            min="1.0"
            max="10.0"
            step="0.1"
            v-model.number="ratingModal.tempRating"
            class="modal-rating-slider"
            aria-label="Edit personal rating"
          />
          <div class="slider-ticks">
            <span>1.0</span>
            <span>5.0</span>
            <span>10.0</span>
          </div>
        </div>

        <div class="modal-actions" style="margin-top: 1.65rem">
          <button :disabled="busy" @click="closeRatingModal" class="btn btn-glass">Cancel</button>
          <button :disabled="busy" @click="saveRatingModal" class="btn btn-primary-action">
            <span>⭐</span> Save Rating
          </button>
        </div>
      </div>
    </div>

    <div class="toast-container" role="status" aria-live="polite" v-if="toastMessage">
      <div class="toast">
        <span>🔔</span>
        <span>{{ toastMessage }}</span>
      </div>
    </div>
  </div>
</template>
