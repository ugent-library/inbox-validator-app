<script>
  export let enabled = true;
</script>

<div style="display:flex; align-items:center; gap:10px;">
  <label class="switch">
    <input type="checkbox" bind:checked={enabled} />
    <span class="slider"></span>
  </label>
  <span>View source: {enabled ? 'ON' : 'OFF'}</span>
</div>

<style>
  .switch {
    position: relative;
    display: inline-block;
    width: 52px;
    height: 28px;
    flex-shrink: 0;
    margin-bottom: 10px;
  }

  .switch input {
    opacity: 0;
    width: 0;
    height: 0;
  }

  .slider {
    position: absolute;
    inset: 0;
    background-color: #ccc;
    border-radius: 28px;
    cursor: pointer;
    transition: background-color 0.2s;
  }

  .slider::before {
    content: '';
    position: absolute;
    height: 20px;
    width: 20px;
    left: 4px;
    bottom: 4px;
    background-color: white;
    border-radius: 50%;
    transition: transform 0.2s;
  }

  input:checked + .slider {
    background-color: #4caf50;
  }

  input:checked + .slider::before {
    transform: translateX(24px);
  }
</style>