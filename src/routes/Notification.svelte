<script lang="ts">
    export let params: { name?: string } = {};

    let data = {
        foo: "bar",
    };
</script>

<div class="mb-3">
    <label class="form-label fw-bold">{ params.name }</label>
    <div class="editor-wrapper">
        <textarea
        >{JSON.stringify(data,null,2)}</textarea>
    </div>
</div>
