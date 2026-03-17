<script lang="ts">
	import { onMount } from 'svelte';
	import { listInbox , type Member } from "../inbox";

	let inbox = "http://localhost:3001/inbox/";

	let inboxContents : Member[];

	onMount( async () => {
        inboxContents = await listInbox(inbox);
    });
</script>

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

  {#if inboxContents}
  <tbody>
    {#each inboxContents as member}
      <tr>
        <td><span class="member-icon icon-txt">{ member.mimeType ?? 'JSON-LD'}</span></td>
        <td><a href="#/notification/{member.name}">{member.name}</a></td>
        <td class="text-end text-muted">{ member.size ?? "--"}</td>
        <td class="text-muted">{ member.date ?? "--"}</td>
      </tr>
    {/each}
  </tbody>
  {/if}
</table>

<style>
.type-width {
    width: 80px;
}
.table {
    margin-top: 30px;
}
</style>