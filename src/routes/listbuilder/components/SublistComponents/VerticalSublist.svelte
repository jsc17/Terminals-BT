<script lang="ts">
  import type { List } from "../../types/list.svelte";
  import { getRules } from "$lib/types/options";
  import type { SublistStats, SublistV2 } from "../../types/sublist";
  import EditSublistModal from "./EditSublistModal.svelte";
  import ExportSublistModal from "./ExportSublistModal.svelte";
  import type { UnitV2 } from "$lib/types/unit";

  type componentProps = {
    sublist: SublistV2;
    list: List;
    editSublistModal: EditSublistModal | undefined;
    exportSublistModal: ExportSublistModal | undefined;
    stats: SublistStats;
    sublistMaxPv?: number;
    sublistMaxUnits?: number;
    sortedUnits: UnitV2[];
  };

  const {
    sublist = $bindable(),
    list,
    editSublistModal,
    exportSublistModal,
    stats,
    sublistMaxPv,
    sublistMaxUnits,
    sortedUnits,
  }: componentProps = $props();
</script>

<main>
  <div class="space-between">
    <select id={`scenario${sublist.id}`} bind:value={sublist.scenario}>
      {#each ["-", "Bunkers", "Capture the Flag", "Domination", "Headhunter", "Hold the Line", "King of the Hill", "Overrun", "Stand Up Fight"] as scenario}
        <option value={scenario}>{scenario}</option>
      {/each}
    </select>
    <button
      onclick={() => {
        editSublistModal?.show(sublist.id);
      }}>Edit</button
    >
  </div>
  <div class="sublist-body">
    <div class="unit-container">
      {#each sortedUnits as unit}
        <div>{unit.baseUnit.name}</div>
        <div>{unit.skill}</div>
      {/each}
    </div>
  </div>
  <div class="sublist-stats">
    <p>PV:</p>
    <p class:error={sublistMaxPv && stats.pv > sublistMaxPv}>
      {`${stats.pv ?? 0}`}{sublistMaxPv ? `/${sublistMaxPv}` : ``}
    </p>
    <p>Units:</p>
    <p class:error={sublistMaxUnits && sublist.checked?.length > sublistMaxUnits}>
      {`${sublist.checked?.length ?? 0}`}{sublistMaxUnits ? `/${sublistMaxUnits}` : ``}
    </p>
    <p>Total Health:</p>
    <p>{stats.health ?? 0}</p>
    <p>Total Short:</p>
    <p>{stats.short ?? 0}</p>
    <p>Total Medium:</p>
    <p>{stats.medium ?? 0}</p>
    <p>Total Long:</p>
    <p>{stats.long ?? 0}</p>
    <p>Total Size:</p>
    <p>{stats.size ?? 0}</p>
  </div>
  <div class="space-between">
    <button
      onclick={() => {
        exportSublistModal?.show(sublist.id);
      }}>Print/Export</button
    >
    <button onclick={() => list.copySublist(sublist.id)}>Copy</button>
    <button onclick={() => list.deleteSublist(sublist.id)}>Delete</button>
  </div>
</main>

<style>
  main {
    display: flex;
    flex-direction: column;
    background-color: var(--card);
    color: var(--card-foreground);
    border: 1px solid var(--border);
    padding: 8px;
    gap: 16px;
    height: 100%;
    width: 100%;
  }
  .sublist-body {
    flex: 1;
    overflow: auto;
  }
  .unit-container {
    div {
      border-bottom: 1px solid var(--border);
      padding: 4px 0px;
    }
    padding: 0px 0px;
    display: grid;
    grid-template-columns: auto max-content;
    row-gap: 4px;
  }
  .sublist-stats {
    display: grid;
    grid-template-columns: max-content 1fr;
    flex-direction: column;
    justify-content: end;
    column-gap: 16px;
    row-gap: 4px;
  }
  .sublist-stats > p:nth-child(odd) {
    text-align: end;
  }
  .error {
    color: var(--error);
  }
</style>
