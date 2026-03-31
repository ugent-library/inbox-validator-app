<script lang="ts">
    import { type PageObject } from '../inbox';
    export let object : PageObject;

    function cleanNS(term: string) {
        if (term) {
            return term.replaceAll(/.*[\/#]/g,'');
        }
        else {
            return "";
        }
    }
</script>

{#if object}
    <dl>
        <dt>Id</dt>
        <dd><a href={object.id}>{object.id}</a></dd>
        <dt>Type</dt>
        <dd>{object.type?.map(s => cleanNS(s)).join(" + ")}</dd>
        {#if object.citeAs}
            <dt>Cite-As</dt>
            <dd><a href={object.citeAs}>{object.citeAs}</a></dd>
        {/if}
        {#if object.item}
            <dt>Item</dt>
            <dd class="page-item">
                <dl>
                    <dt>Id</dt>
                    <dd><a href={object.item.id}>{object.item.id}</a></dd>
                    <dt>Type</dt>
                    <dd>{object.item.type?.map(s => cleanNS(s)).join(" + ")}</dd>
                    <dt>Media-Type</dt>
                    <dd>{object.item.mediaType}</dd>
                </dl>
            </dd>
        {/if}
    </dl>
{/if}

<style>
    .page-item {
        padding-left: 25px;
    }
</style>