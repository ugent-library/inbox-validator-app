<script lang="ts">
    export let params: {name?: string} = {};

    let data = {
        "foo": "bar"
    };
</script>

<h1>{params.name}</h1>

