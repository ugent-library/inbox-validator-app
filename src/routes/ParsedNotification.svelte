<script lang="ts">
    import { type Notification } from "../inbox";
    import Agent from "./Agent.svelte";
    import Relationship from "./Relationship.svelte";
    import Page from "./Page.svelte";
    export let notification : Notification;
    
    function cleanNS(term: string) {
        if (term) {
            return term.replaceAll(/.*[\/#]/g,'');
        }
        else {
            return "";
        }
    }
</script>

{#if notification}
    <dl class="parsed-head">
    {#if notification.object?.actor}
        <dt>From</dt>
        <dd><Agent actor={notification.object?.actor}/></dd>
    {/if}
    {#if notification.object?.target}
        <dt>To</dt>
        <dd><Agent actor={notification.object?.target}/></dd>
    {/if}
    {#if notification.object?.origin}
        <dt>Via</dt>
        <dd><Agent actor={notification.object?.origin}/></dd>
    {/if}
    </dl>
    <dl>
        <dt>{notification.object?.type?.map(s => cleanNS(s)).join(" + ")}</dt>
    </dl>
    <dd class="parsed-body">
        {#if notification.object?.object?.kind === 'relationship' }
            <Relationship object={notification.object.object}/>
        {:else if notification.object?.object?.kind === 'page'}
            <Page object={notification.object.object}/>
        {:else}
            {notification.object?.object?.kind}
        {/if}
    </dd>
{/if}

<style>
  .parsed-head {
    background-color: #EEEEEE;
    padding: 4px;
  }
  .parsed-body {
    background-color: #FFFFE0;
    padding: 4px;
  }
</style>