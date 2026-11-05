<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRoute } from 'vue-router';
import { api, jsonBody } from '../api';
import type { User } from '../types';
import { useAuthStore } from '../stores/auth';
import { safeAuthRedirect } from '../auth-redirect';
const route = useRoute();
const auth = useAuthStore();
const mode = computed(() => route.path === '/verify-email' ? 'verify' : route.path === '/reset-password' ? 'reset' : 'forgot');
const token = new URLSearchParams(window.location.hash.slice(1)).get('token') || '';
if (token) window.history.replaceState(window.history.state, '', window.location.pathname + window.location.search);
const email = ref('');
const password = ref('');
const confirmation = ref('');
const busy = ref(false);
const error = ref('');
const message = ref('');
const finished = ref(false);
const heading = computed(() => mode.value === 'verify' ? 'Verify your email.' : mode.value === 'reset' ? 'Choose a new password.' : 'Forgot your password?');
async function submit() {
  if (busy.value) return;
  error.value = '';
  if (mode.value !== 'forgot' && !/^[A-Za-z0-9_-]{43}$/.test(token)) { error.value = 'This link is invalid. Please request a new one.'; return; }
  if (mode.value === 'reset' && (password.value !== confirmation.value || password.value.length < 10 || new TextEncoder().encode(password.value).length > 72)) {
    error.value = 'Use matching passwords with at least 10 characters and at most 72 bytes.'; return;
  }
  busy.value = true;
  try {
    if (mode.value === 'forgot') {
      const result = await api<{ message: string }>('/auth/password/forgot', { method: 'POST', body: jsonBody({ email: email.value }) });
      message.value = result.message;
    } else if (mode.value === 'reset') {
      await api('/auth/password/reset', { method: 'POST', body: jsonBody({ token, password: password.value }) });
      auth.clear();
      password.value = confirmation.value = '';
      message.value = 'Your password has changed. Please sign in again.';
    } else {
      await api('/auth/email/verify', { method: 'POST', body: jsonBody({ token }) });
      if (auth.user) {
        try { auth.user = (await api<{ user: User }>('/auth/me')).user; }
        catch { /* The email is verified even when this browser session has expired. */ }
      }
      message.value = 'The email associated with this link is now verified.';
    }
    finished.value = true;
  } catch (cause) { error.value = cause instanceof Error ? cause.message : 'Please try again.'; }
  finally { busy.value = false; }
}
</script>
<template>
  <main class="container account-link-page">
    <section class="account-panel">
      <h1>{{ heading }}</h1>
      <p v-if="mode === 'forgot'">Enter your account email to request a reset link.</p>
      <p v-else-if="mode === 'verify'">Confirm below to verify the email associated with this link.</p>
      <p v-if="error" class="form-error" role="alert">{{ error }}</p>
      <p v-if="message" class="app-feedback success-feedback" role="status">{{ message }}</p>
      <form v-if="!finished" class="account-form" @submit.prevent="submit">
        <label v-if="mode === 'forgot'">Email address<input v-model="email" type="email" autocomplete="email" maxlength="254" required :disabled="busy" /></label>
        <template v-if="mode === 'reset'">
          <label>New password<input v-model="password" type="password" autocomplete="new-password" minlength="10" maxlength="72" required :disabled="busy" /></label>
          <label>Confirm new password<input v-model="confirmation" type="password" autocomplete="new-password" required :disabled="busy" /></label>
        </template>
        <button class="btn btn-primary-action" :disabled="busy">{{ busy ? 'Please wait…' : mode === 'verify' ? 'Verify email' : mode === 'reset' ? 'Save password' : 'Send reset link' }}</button>
      </form>
      <RouterLink v-if="finished && mode === 'verify' && auth.verified" :to="safeAuthRedirect(route.query.redirect)" class="btn btn-primary-action">Continue to AniTrack</RouterLink>
      <RouterLink v-else-if="mode === 'verify' && auth.authenticated" to="/check-email" class="text-action">Back to email verification</RouterLink>
      <RouterLink v-else to="/login" class="text-action">Back to sign in</RouterLink>
    </section>
  </main>
</template>
