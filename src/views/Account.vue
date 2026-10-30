<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { QDialog } from 'quasar';
import { api, jsonBody } from '../api';
import { useAuthStore } from '../stores/auth';
import type { User } from '../types';
const auth = useAuthStore();
const router = useRouter();
const name = ref(auth.user?.name || '');
const currentPassword = ref('');
const password = ref('');
const confirmation = ref('');
const deleteOpen = ref(false);
const deletePassword = ref('');
const deleteConfirmation = ref('');
const busy = ref(false);
const error = ref('');
const message = ref('');
async function perform(action: () => Promise<void>) {
  if (busy.value) return;
  busy.value = true; error.value = message.value = '';
  try { await action(); }
  catch (cause) { error.value = cause instanceof Error ? cause.message : 'Could not save your change.'; }
  finally { busy.value = false; }
}
const profile = () => perform(async () => {
  const result = await api<{ user: User }>('/account', { method: 'PATCH', body: jsonBody({ name: name.value }) });
  auth.user = result.user; message.value = 'Your name has been updated.';
});
const verify = () => perform(async () => {
  const result = await api<{ message: string }>('/auth/email/request', { method: 'POST' });
  message.value = result.message;
});
const changePassword = () => perform(async () => {
  if (password.value !== confirmation.value) throw new Error('Your new passwords do not match.');
  await api('/account/password', { method: 'PUT', body: jsonBody({ currentPassword: currentPassword.value, password: password.value }) });
  auth.clear();
  await router.replace('/login');
});
const remove = () => perform(async () => {
  await api('/account', { method: 'DELETE', body: jsonBody({ password: deletePassword.value, confirmation: deleteConfirmation.value }) });
  deleteOpen.value = false; auth.clear(); await router.replace('/');
});
</script>
<template>
  <main class="workspace-page account-page">
    <header class="page-heading"><div><h1>Your account.</h1><p>Manage your profile and account security.</p></div></header>
    <p v-if="error" class="form-error" role="alert">{{ error }}</p>
    <p v-if="message" class="app-feedback success-feedback" role="status">{{ message }}</p>
    <section class="account-panel">
      <h2>Profile</h2>
      <form class="account-form" @submit.prevent="profile"><label>Your name<input v-model="name" autocomplete="name" minlength="2" maxlength="80" required :disabled="busy" /></label><button class="btn btn-primary-action" :disabled="busy">Save profile</button></form>
      <p>{{ auth.user?.email }}</p>
      <p>{{ auth.user?.emailVerifiedAt ? 'Email verified' : 'Your email is not verified yet.' }}</p>
      <button v-if="!auth.user?.emailVerifiedAt" class="btn btn-glass" :disabled="busy" @click="verify">Send verification email</button>
    </section>
    <section class="account-panel">
      <h2>Change password</h2><p>Changing your password signs you out on all devices.</p>
      <form class="account-form" @submit.prevent="changePassword">
        <label>Current password<input v-model="currentPassword" type="password" autocomplete="current-password" required :disabled="busy" /></label>
        <label>New password<input v-model="password" type="password" autocomplete="new-password" minlength="10" maxlength="72" required :disabled="busy" /></label>
        <label>Confirm new password<input v-model="confirmation" type="password" autocomplete="new-password" required :disabled="busy" /></label>
        <button class="btn btn-primary-action" :disabled="busy">Change password</button>
      </form>
    </section>
    <section class="account-panel"><h2>Delete account</h2><p>Permanently delete your account, private watchlist, and custom titles.</p><button class="btn btn-glass" :disabled="busy" @click="deleteOpen = true">Delete my account</button></section>
    <QDialog v-model="deleteOpen" :persistent="busy"><section class="app-dialog account-panel" aria-labelledby="delete-account-heading">
      <h2 id="delete-account-heading">Permanently delete your account?</h2><p>This cannot be undone. Enter your password and type DELETE to confirm.</p>
      <p v-if="error" class="form-error" role="alert">{{ error }}</p>
      <form class="account-form" @submit.prevent="remove"><label>Password<input v-model="deletePassword" type="password" autocomplete="current-password" required :disabled="busy" /></label><label>Type DELETE<input v-model="deleteConfirmation" autocomplete="off" pattern="DELETE" required :disabled="busy" /></label><button class="btn btn-primary-action" :disabled="busy || deleteConfirmation !== 'DELETE'">Permanently delete account</button><button class="btn btn-glass" type="button" :disabled="busy" @click="deleteOpen = false">Cancel</button></form>
    </section></QDialog>
  </main>
</template>
