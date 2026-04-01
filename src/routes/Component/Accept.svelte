<script lang="ts">
    import { appData } from '../../store';
    import { get } from 'svelte/store'; // Import store getter
    import { 
        type Notification, 
        type Agent,
        genUUID,
        sendNotification } from '../../inbox';
    import { createEventDispatcher } from 'svelte';
    import whooshUrl from '../../assets/woosh.mp3';
    import { THIS_ORIGIN } from '../../globals';
    const dispatch = createEventDispatcher();

    let isTentative = false;
    let summary = "";

    let notification : Notification = get(appData) as Notification;

    const actorInit : Agent = notification.object?.target ?
        notification.object?.target : {
            id: genUUID(),
            type: "https://www.w3.org/ns/activitystreams#Person",
            name: undefined,
            inbox: undefined
        };

    const inboxInit : string | undefined = notification.object?.origin?.inbox ?
            notification.object?.origin?.inbox :
            notification.object?.actor?.inbox;

    let actor: Agent = { ...actorInit };
    let inbox: string | undefined = inboxInit;

    interface Category {
        iri: string;
        label: string;
    }

    const AS    = 'https://www.w3.org/ns/activitystreams#';

    const categories : Category[] = [
        { iri: `${AS}Person`, label: 'Person' },
        { iri: `${AS}Organization`, label: 'Organization' },
        { iri: `${AS}Service`, label: 'Service' }
    ];

    function  handleReset() {
        actor = {...actorInit };
        inbox = inboxInit;
    }

    const playWhoosh = () => {
        const audio = new Audio(whooshUrl);
        audio.volume = 0.5; // Optional: set volume between 0 and 1
        audio.play().catch(error => {
            // Browsers often block audio if the user hasn't interacted with the page yet
            console.error("Audio playback failed:", error);
        });
    };
    
    let showToast = false;
    let errorMessage = "";

    async function handleSubmit() {
        if (!inbox) {
            return;
        }

        let payload : any = {
            '@context': [
                "https://www.w3.org/ns/activitystreams",
                "https://coar-notify.net"
            ],
            'id': genUUID(),
            'type': 'Accept',
            'actor': actor,
            'origin': THIS_ORIGIN,
            'object': notification.object,
            'target': notification.object?.actor
        }

        if (isTentative) {
            payload['type'] = 'TentativeAccept';
            payload['summary'] = summary;
        }

        try {
            await sendNotification(inbox,payload); 
            dispatch('changeTab','Successfully Sent Notification!');
            playWhoosh();
        }
        catch (e: any) {
            showToast = true;
            errorMessage = e.message;
        }
    }
</script>

{#if showToast}
  <div class="toast-container position-fixed bottom-0 end-0 p-3">
    <div class="toast show align-items-center text-white bg-danger border-0" role="alert">
      <div class="d-flex">
        <div class="toast-body">
          {errorMessage}
        </div>
        <button 
          type="button" 
          class="btn-close btn-close-white me-2 m-auto" 
          on:click={() => showToast = false}>
        </button>
      </div>
    </div>
  </div>
{/if}

<h3>Send Accept Notification</h3>

<div class="mb-3">
    <input class="form-check-input" type="checkbox" id="tentativeAccept" bind:checked={isTentative}>
    <label class="form-check-label" for="tentativeAccept">
        Tentative Accept
    </label>
</div>

<form on:submit|preventDefault={handleSubmit}>
    <h3>To</h3>
    <div class="mb-3">
        <label for="notifInbox" class="form-label">Inbox</label>
        <input 
            type="text" 
            class="form-control" 
            id="notifId" 
            placeholder="e.g. NOTIF-001"
            bind:value={inbox} 
            required
        />
    </div>

    <h3>Your Details</h3>

    <div class="mb-3">
        <label for="notifId" class="form-label">Id</label>
        <input 
            type="text" 
            class="form-control" 
            id="notifId" 
            placeholder="e.g. A unique id for your organization"
            bind:value={actor.id} 
            required
        />
    </div>

    <div class="mb-3">
        <label for="notifName" class="form-label">Name</label>
        <input 
            type="text" 
            class="form-control" 
            id="notifName"
            placeholder="e.g. Name of your organization"
            bind:value={actor.name} 
        />
    </div>

    <div class="mb-3">
    <label for="typeSelect" class="form-label">Type</label>
    <select 
        id="typeSelect" 
        class="form-select" 
        bind:value={actor.type}
    >
        <option disabled value="">Choose a type...</option>
        {#each categories as category}
            <option value={category.iri}>
                {category.label}
            </option>
        {/each}
        </select>
    </div>

    {#if isTentative}
        <div class="mb-3">
            <label class="form-label" for="summary"><b>Summary</b></label>
            <input 
                class="form-control" 
                type="text" 
                id="summary" 
                bind:value={summary}
                placeholder="Write a short summary why you tentative accept this notification."
                required>
        </div> 
    {/if}

    <div class="d-grid gap-2 d-md-flex justify-content-md-end">
        <button type="button" 
            class="btn btn-outline-secondary"
            on:click={handleReset}>Reset</button>
        <button type="submit" class="btn btn-primary">Send</button>
    </div>
</form>

<style>
    label {
        font-weight: bold;
    }
</style>