<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { PhArrowRight, PhEye, PhEyeSlash, PhCheck } from '@phosphor-icons/vue';
import { useAuthStore } from '../stores/auth';
import { ApiError } from '../api';
import { safeAuthRedirect } from '../auth-redirect';
const route = useRoute();
const router = useRouter();
const auth = useAuthStore();
const registering = computed(() => route.path === '/register');
const accessMessage = computed(() => {
  const target = safeAuthRedirect(route.query.redirect);
  if (target.startsWith('/discover')) return 'Log in to discover anime and save your next watch.';
  if (target.startsWith('/assistant')) return 'Log in to use Anime Assistant.';
  if (target.startsWith('/anime/')) return 'Log in to view anime details and track your progress.';
  return 'Your next chapter is waiting.';
});
const artwork = computed(() =>
  registering.value
    ? {
        src: '/images/editorial/kikis-delivery-service.webp',
        alt: "A scene from Kiki's Delivery Service",
        position: '54% center'
      }
    : {
        src: '/images/editorial/whisper-of-the-heart.webp',
        alt: 'Shizuku with city rooftops behind her in Whisper of the Heart',
        position: '68% center'
      }
);
const name = ref('');
const email = ref('');
const password = ref('');
const error = ref('');
const showPassword = ref(false);
async function submit() {
  error.value = '';
  if (registering.value && name.value.trim().length < 2) {
    error.value = 'Please enter a name with at least two characters.';
    return;
  }
  if (
    registering.value &&
    (password.value.length < 10 || new TextEncoder().encode(password.value).length > 72)
  ) {
    error.value = 'Use a password of at least 10 characters and at most 72 bytes.';
    return;
  }
  try {
    await auth.authenticate(registering.value ? 'register' : 'login', {
      email: email.value,
      password: password.value,
      ...(registering.value ? { name: name.value } : {})
    });
    await router.push(safeAuthRedirect(route.query.redirect));
  } catch (cause) {
    error.value =
      cause instanceof ApiError && cause.status >= 500
        ? 'AniTrack is temporarily unavailable. Please try again in a moment. Your details are still here.'
        : cause instanceof Error
          ? cause.message
          : 'Unable to sign in.';
  }
}
</script>

<template>
  <main class="auth-page container">
    <section class="auth-story">
      <div class="auth-story-image">
        <img
          :src="artwork.src"
          :alt="artwork.alt"
          :style="{ objectPosition: artwork.position }"
          width="1440"
          height="779"
        />
      </div>
      <div class="auth-story-copy">
        <h1>Every story.<br />A place in yours.</h1>
        <p>Your favorites, your ratings, your next adventure.</p>
        <span><PhCheck :size="18" /> A watchlist that stays with you</span>
      </div>
    </section>
    <section class="auth-form-wrap" :aria-busy="auth.loading">
      <RouterLink to="/" class="back-link">Back to AniTrack</RouterLink>
      <h2>{{ registering ? 'Start your collection.' : 'Welcome back.' }}</h2>
      <p>
        {{ registering ? 'Make room for your next favorite.' : accessMessage }}
      </p>
      <div v-if="auth.sessionError" class="session-notice" role="alert">
        <p>{{ auth.sessionError }}</p>
        <button type="button" :disabled="Boolean(auth.restorePromise)" @click="auth.restore()">{{ auth.restorePromise ? 'Reconnecting…' : 'Try again' }}</button>
      </div>
      <form @submit.prevent="submit">
        <div v-if="error" id="auth-error" class="form-error" role="alert">{{ error }}</div>
        <div v-if="registering" class="form-group">
          <label for="name" class="form-label">Your name</label
          ><input
            id="name"
            v-model="name"
            name="name"
            class="form-input"
            autocomplete="name"
            minlength="2"
            maxlength="80"
            required
            :disabled="auth.loading"
          />
        </div>
        <div class="form-group">
          <label for="email" class="form-label">Email address</label
          ><input
            id="email"
            v-model="email"
            name="email"
            class="form-input"
            type="email"
            autocomplete="email"
            maxlength="254"
            required
            :disabled="auth.loading"
          />
        </div>
        <div class="form-group">
          <div class="auth-password-heading">
            <label for="password" class="form-label">Password</label>
            <RouterLink v-if="!registering" to="/forgot-password" class="auth-recovery-link">
              Forgot your password?
            </RouterLink>
          </div>
          <div class="password-field">
            <input
              id="password"
              v-model="password"
              name="password"
              class="form-input"
              :type="showPassword ? 'text' : 'password'"
              :autocomplete="registering ? 'new-password' : 'current-password'"
              :minlength="registering ? 10 : 1"
              :maxlength="registering ? 72 : 256"
              :aria-describedby="registering ? 'password-help' : undefined"
              required
              :disabled="auth.loading"
            /><button
              type="button"
              class="icon-button"
              :aria-label="showPassword ? 'Hide password' : 'Show password'"
              @click="showPassword = !showPassword"
            >
              <component :is="showPassword ? PhEyeSlash : PhEye" :size="20" />
            </button>
          </div>
          <small v-if="registering" id="password-help"
            >At least 10 characters. Use a unique password.</small
          >
        </div>
        <button class="btn btn-primary-action auth-submit" type="submit" :disabled="auth.loading">
          {{ auth.loading ? 'Please wait…' : registering ? 'Create your account' : 'Log in'
          }}<PhArrowRight :size="20" />
        </button>
      </form>
      <p class="auth-switch">
        {{ registering ? 'Already have an account?' : 'New to AniTrack?' }}
        <RouterLink
          :to="{
            path: registering ? '/login' : '/register',
            query:
              typeof route.query.redirect === 'string'
                ? { redirect: safeAuthRedirect(route.query.redirect) }
                : {}
          }"
          @click="
            error = '';
            password = '';
          "
          >{{ registering ? 'Log in' : 'Create an account' }}</RouterLink
        >
      </p>
    </section>
  </main>
</template>
