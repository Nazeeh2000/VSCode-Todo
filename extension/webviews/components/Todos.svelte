<script lang="ts">
  import { onMount } from 'svelte';
  import type { User } from '../types';

  export let user: User;
  export let accessToken: string;

  let text = '';
  let todos: Array<{ text: string; completed: boolean }> = [];

  onMount(async () => {
    window.addEventListener('message', async (event) => {
      const message = event.data;
      switch (message.type) {
        case 'new-todo':
          todos = [{ text: message.value, completed: false }, ...todos];
      }
    });

    const response = await fetch(`${apiBaseUrl}/todo`, {
      headers: {
        authorization: `Bearer ${accessToken}`,
      },
    });

    const payload = await response.json();
    todos = payload.todos;
  });
</script>

<div>Hello: {user.name}</div>

<form
  on:submit|preventDefault={async (e) => {
    const response = await fetch(`${apiBaseUrl}/todo`, {
      method: 'POST',
      body: JSON.stringify({
        text,
      }),
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${accessToken}`,
      },
    });

    const { todo } = await response.json();
    todos = [todo, ...todos];
    text = '';
  }}
>
  <input bind:value={text} />
</form>

<ul>
  {#each todos as todo (todo.text)}
    <li
      class:complete={todo.completed}
      on:click={() => {
        todo.completed = !todo.completed;
      }}
    >
      {todo.text}
    </li>
  {/each}
</ul>

<style>
  .complete {
    text-decoration: line-through;
  }
</style>
