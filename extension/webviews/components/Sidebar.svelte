<script lang="ts">
  import { onMount } from 'svelte';
  import type { User } from '../types';
  import Todos from './Todos.svelte';

  let todos: Array<{ text: String; completed: boolean }> = [];
  let text: string = tsvscode.getState()?.text || '';
  let user: User | null = null;
  let loading = true;
  let page: 'todos' | 'contact' = tsvscode.getState()?.page || 'todos';

  $: {
    tsvscode.setState({ page, ...tsvscode.getState()?.text });
  }

  $: {
    tsvscode.setState({ text, ...tsvscode.getState()?.page });
  }


  // $: {
  //   tsvscode.setState({ ...tsvscode.getState(), text });
  // }

  let accessToken = '';

  onMount(async () => {
    window.addEventListener('message', async (event) => {
      const message = event.data;

      switch (message.type) {
        case 'token':
          accessToken = message.value;
          const response = await fetch(`${apiBaseUrl}/me`, {
            headers: {
              authorization: `Bearer ${accessToken}`,
            },
          });
          const data = await response.json();
          user = data.user;
          loading = false;
          break;
        default:
          break;
      }
    });

    tsvscode.postMessage({ type: 'get-token', value: undefined });
  });
</script>

{#if loading}
  <div>loading...</div>
{:else if user}
  {#if page === 'todos'}
    <Todos {user} {accessToken} />
    <button
      on:click={() => {
        page = 'contact';
      }}>Go to Contact</button
    >
  {:else}
    <div>
      Contact me:
      <button
        on:click={() => {
          page = 'todos';
        }}>Go back</button
      >
    </div>
  {/if}
  <button
    on:click={() => {
      accessToken = '';
      user = null;
      tsvscode.postMessage({ type: 'logout', value: undefined });
      console.log('Logout clicked');
    }}>logout</button
  >
{:else}
  <div>no user is logged in</div>
  <button
    on:click={() => {
      tsvscode.postMessage({ type: 'authenticate', value: undefined });
    }}>Login with Gitub</button
  >
{/if}
