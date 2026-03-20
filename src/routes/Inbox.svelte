<script lang="ts">
  //import 'bootstrap/dist/css/bootstrap.min.css';
  //import 'bootstrap/dist/js/bootstrap.bundle.min.js';
  import { INBOX_URL } from "../globals";
	import { listInbox , type Member } from "../inbox";

	let inbox = INBOX_URL;
</script>

{#await listInbox(inbox)}
  <p>Loading {inbox}...</p>
{:then notifications} 
<h3>{inbox}</h3>
<table class="table table-hover table-sm mb-0">
  <thead class="text-muted small text-uppercase">
    <tr>
      <th class="type-width">Type</th>
      <th>Name</th>
      <th class="text-end">Size</th>
      <th>Modified</th>
    </tr>
  </thead>

  {#if notifications}
  <tbody>
    {#each notifications as member}
      <tr>
        <td>
          <span class="member-icon icon-txt">
            {#if member.mimeType}
              {#if member.mimeType === 'application/ld+json'}
              JSON-LD
              {:else if member.mimeType === 'application/json'}
              JSON
              {:else if member.mimeType === 'text/turtle'}
              TURTLE
              {:else}
              OTHER
              {/if}
            {:else}
              OTHER
            {/if}
          </span>
        </td>
        <td><a href="#/notification/{member.name}">{member.name}</a></td>
        <td class="text-end text-muted">{ member.size ?? "--"}</td>
        <td class="text-muted">{ member.date ?? "--"}</td>
      </tr>
    {/each}
  </tbody>
  {/if}
</table>
{:catch error}
  <p class="error">Failed to load {inbox}</p>
{/await}

<style>
.type-width {
    width: 80px;
}
.table {
    margin-top: 30px;
}
.error {
    color: #dc3545;          /* Bootstrap's danger red */
    background-color: #f8d7da;
    border: 1px solid #f5c2c7;
    border-radius: 0.375rem;
    padding: 0.75rem 1rem;
    margin-top: 1rem;
}
</style>