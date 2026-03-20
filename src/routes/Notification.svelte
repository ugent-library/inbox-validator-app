<script lang="ts">
    import { INBOX_URL } from "../globals";
	import { getNotification , type Notification } from "../inbox";
    import { validateNotification } from "../validate";

    export let params: { name?: string } = {};

    let inbox = INBOX_URL;
    let notificationUrl = inbox + params.name;

    function highlight(json: string) : string {
        return json
            .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
            .replace(
                /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
                m => {
                    if (/^"/.test(m)) return /:$/.test(m) ? `<span class="json-key">${m}</span>` : `<span class="json-str">${m}</span>`;
                    if (/true|false/.test(m)) return `<span class="json-bool">${m}</span>`;
                    if (/null/.test(m)) return `<span class="json-null">${m}</span>`;
                return `<span class="json-num">${m}</span>`;
            }
      );
    }

    // The p-element holds the source for the notification
    let p : HTMLPreElement;

    // Status defines which sub menus to show for validation and sending responses
    enum Status {
        DEFAULT,
        VALIDATE,
        ACCEPT,
        REJECT,
        ANNOUNCE,
        PREVIEW
    }

    let status: Status = Status.DEFAULT;

    // Start with validation reports
    interface Report {
        data: string;
        isError: boolean;
    }

    let validationReport: Report;

    async function handleValidate() {
        status = Status.VALIDATE;
        try {
            const result = await validateNotification(p.textContent);
            validationReport = {
                data: result.data,
                isError: false
            };
        }
        catch (error: unknown) {
            if (error instanceof Error) {
                validationReport = {
                    data: error.message,
                    isError: true
                };
            }
            else {
                validationReport = {
                    data: "Unknown error",
                    isError: true
                };
            }
        }
    }

    // Tentative accepts?
    let isTentative = false;

    // Start accept
    async function handleAccept() { 
        isTentative = false;
        status = Status.ACCEPT;
    }

    // Start reject
    async function handleReject() { 
        isTentative = false;
        status = Status.REJECT;
    }

    // Start announce
    async function handleAnnounce() { 
        status = Status.ANNOUNCE;
    }

    // Start preview
    async function handlePreview() {
        status = Status.PREVIEW;
    }

    // Start cancel
    async function handleCancel() {
        status = Status.DEFAULT;
    }
</script>

<nav class="navbar">
    <a href="/" class="btn btn-light text-decoration-none">INBOX</a>
</nav>

{#await getNotification(notificationUrl)}
    <p>Loading {notificationUrl}</p>
{:then notification} 
    <div class="card-body">
      <h3>Incoming</h3>
      <h6>{inbox}{params.name}</h6>
      <pre bind:this={p} class="json-viewer border rounded p-3 bg-dark">
        {@html highlight(notification.data)}
      </pre>
      <button class="btn btn-primary" on:click={handleValidate}>Validate</button>
      <button class="btn btn-info" on:click={handleAccept}>Accept</button>
      <button class="btn btn-danger" on:click={handleReject}>Reject</button>
      <button class="btn btn-success" on:click={handleAnnounce}>Announce</button>
    </div>
    <hr>

    {#if status == Status.VALIDATE && validationReport}
    <div class="card-body">
        <h3>Validation Report</h3>
      {#if validationReport.isError }
        <p class="error">{@html validationReport.data}</p>
      {:else}
        <p>{@html validationReport.data}</p>
      {/if}
    </div>
    {:else if status == Status.ACCEPT}
    <div class="card-body">
        <h3>Accept Notification</h3>
        <div class="mb-3">
            <input class="form-check-input" type="checkbox" id="tentativeAccept" bind:checked={isTentative}>
            <label class="form-check-label" for="tentativeAccept">
                Tentative Accept
            </label>
        </div>
        {#if isTentative}
        <div class="mb-3">
            <label class="form-label" for="summary"><b>Summary</b></label>
            <input class="form-control" type="text" id="summary" placeholder="Write a short summary why you tentative accept this notification.">
        </div> 
        {/if}
        <button class="btn btn-success" on:click={handlePreview}>Preview</button>
        <button class="btn btn-light" on:click={handleCancel}>Cancel</button>
    </div>
    {:else if status == Status.REJECT}
    <div class="card-body">
        <h3>Reject Notification</h3>
        <div class="mb-3">
            <input class="form-check-input" type="checkbox" id="tentativeReject" bind:checked={isTentative}>
            <label class="form-check-label" for="tentativeReject">
                Tentative Reject
            </label>
        </div>
        {#if isTentative}
        <div class="mb-3">
            <label class="form-label" for="summary"><b>Summary</b></label>
            <input class="form-control" type="text" id="summary" placeholder="Write a short summary why you tentative reject this notification.">
        </div> 
        {/if}
        <button class="btn btn-success" on:click={handlePreview}>Preview</button>
        <button class="btn btn-light" on:click={handleCancel}>Cancel</button>
    </div>
    {:else if status == Status.ANNOUNCE}
    <div class="card-body">
        <h3>Announce Service Result</h3>
        <button class="btn btn-success" on:click={handlePreview}>Preview</button>
        <button class="btn btn-light" on:click={handleCancel}>Cancel</button>
    </div>
    {:else if status == Status.PREVIEW}
    <div class="card-body">
        <h3>Preview Notification</h3>
    </div>
    {/if}
{:catch error}
    <p class="error">Failed to load {notificationUrl}</p>
{/await}

<style>
  .json-viewer {
    font-size: 0.85rem;
    line-height: 1.6;
    max-height: 500px;
    overflow: auto;
    background-color: #1e1e1e;
    color: #d4d4d4;
  }

  :global(.json-key)  { color: #9cdcfe; }
  :global(.json-str)  { color: #ce9178; }
  :global(.json-num)  { color: #b5cea8; }
  :global(.json-bool) { color: #569cd6; }
  :global(.json-null) { color: #808080; }

  .error {
    color: #dc3545;          /* Bootstrap's danger red */
    background-color: #f8d7da;
    border: 1px solid #f5c2c7;
    border-radius: 0.375rem;
    padding: 0.75rem 1rem;
    margin-top: 1rem;
  }
</style>