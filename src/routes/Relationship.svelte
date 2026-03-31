<script lang="ts">
    import { type RelationshipObject } from '../inbox';
    export let object : RelationshipObject;
</script>

{#if object}
    <dl>
        <dt>Subject</dt>
        <dd><a href={object.relSubject}>{object.relSubject}</a></dd>
        <dt>Predicate</dt>
        <dd><a href={object.relPredicate}>{object.relPredicate}</a></dd>
        <dt>Object</dt>
        <dd><a href={object.relObject}>{object.relObject}</a></dd>
    </dl>
{/if}