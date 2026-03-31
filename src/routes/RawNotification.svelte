<script lang="ts">
    import { type Notification } from "../inbox";
    export let notification : Notification;
    
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
</script>

{#if notification}
    <pre class="json-viewer border rounded p-3 bg-dark">{@html highlight(notification.data)}</pre>
{/if}

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
</style>