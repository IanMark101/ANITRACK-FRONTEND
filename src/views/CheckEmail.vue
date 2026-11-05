<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { api, ApiError } from '../api';
import { safeAuthRedirect } from '../auth-redirect';
import { useAuthStore } from '../stores/auth';

const auth = useAuthStore();
const route = useRoute();
const router = useRouter();
const busy = ref(false);
const error = ref('');
const message = ref('');
const now = ref(Date.now());
const seconds = computed(() => Math.max(0, Math.ceil((auth.verificationRetryAt - now.value) / 1000)));
const timer = setInterval(() => { now.value = Date.now(); }, 1000);
onBeforeUnmount(() => clearInterval(timer));

async function run(action: () => Promise<void>) {
  if (busy.value) return;
  busy.value = true;
  error.value = message.value = '';
  try { await action(); }
  catch (cause) {
    if (cause instanceof ApiError && cause.status === 401) {
      auth.clear();
      await router.replace('/login');
    } else error.value = cause instanceof Error ? cause.message : 'Please try again.';
  } finally { busy.value = false; }
}
function resend() {
  return run(async () => {
    try {
      const result = await api<{ verificationEmailSent?: boolean }>('/auth/email/request', { method: 'POST' });
      if (result.verificationEmailSent === false && await auth.checkVerification()) {
        await router.replace(safeAuthRedirect(route.query.redirect));
        return;
      }
    } catch (cause) {
      if (cause instanceof ApiError && cause.code === 'VERIFICATION_COOLDOWN')
        auth.verificationRetryAt = Date.now() + 60_000;
      throw cause;
    }
    auth.verificationEmailSent = true;
    auth.verificationRetryAt = Date.now() + 60_000;
    now.value = Date.now();
    message.value = 'A new verification link has been sent. Check your inbox and spam folder.';
  });
}
function continueToApp() {
  return run(async () => {
    if (!await auth.checkVerification()) {
      error.value = 'Your email is not verified yet. Open the link in your email and confirm verification first.';
      return;
    }
    await router.replace(safeAuthRedirect(route.query.redirect));
  });
}
async function switchAccount() {
  await run(async () => { await auth.logout(); await router.replace('/register'); });
}
</script>

<template>
  <main class="verification-page container">
    <section class="verification-card" aria-labelledby="verification-heading" :aria-busy="busy">
      <h1 id="verification-heading">Check your email.</h1>
      <p class="verification-intro">Verify your email to open your AniTrack workspace.</p>
      <p class="verification-address">{{ auth.user?.email }}</p>
      <p v-if="auth.verificationEmailSent === true">We sent a verification link to this address. Open the email and confirm verification, then continue below.</p>
      <p v-else-if="auth.verificationEmailSent === false">Your account is saved, but we could not send the verification email. Request a new link below.</p>
      <p v-else>Request a verification link below. If you already received one, open it and confirm verification.</p>
      <p v-if="error" class="verification-feedback verification-error" role="alert">{{ error }}</p>
      <p v-if="message" class="verification-feedback" role="status">{{ message }}</p>
      <div class="verification-actions">
        <button class="btn btn-primary-action" :disabled="busy" @click="continueToApp">{{ busy ? 'Please wait…' : "I've verified my email" }}</button>
        <button class="verification-secondary" :disabled="busy || seconds > 0" @click="resend">{{ seconds > 0 ? `Resend available in ${seconds}s` : 'Resend verification email' }}</button>
      </div>
      <p class="verification-help">The link expires after 24 hours. Check your spam folder if you cannot find the email.</p>
      <button class="verification-switch" :disabled="busy" @click="switchAccount">Use another account</button>
    </section>
  </main>
</template>
