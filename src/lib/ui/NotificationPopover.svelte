<script lang="ts">
	import { Popover } from "$lib/generic";
	import type { Notification } from "$lib/generic/types";
	import { Bell } from "phosphor-svelte";

	type Props = {
		notifications: Notification[];
	};

	let { notifications = [] }: Props = $props();

	let unreadCount = $derived(notifications.filter((notification) => !notification.read).length);

	let open = $state(false);

	function getAge(date: Date) {
		const today = new Date();
		const timePassed = Math.floor((today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
		return timePassed;
	}

	function onOpenChange() {
		if (open) {
			fetch("/?/markNotificationsRead", { method: "POST", body: "" });
		}
	}
</script>

{#snippet notificationLine(notification: Notification)}
	{@const daysOld = getAge(notification.date)}
	<div class="notification-line-body">
		<div class="notification-summary-line">
			<p class="notification-summary-text">{notification.summary}</p>
			<p class="italic muted notification-date">
				{#if daysOld == 0}
					Today
				{:else}
					{daysOld >= 7 ? `${Math.floor(daysOld / 7)}w` : `${daysOld}d`}
				{/if}
			</p>
		</div>
		<div class="notification-message-line"><p>{notification.message}</p></div>
	</div>
{/snippet}

<Popover {onOpenChange} bind:open>
	{#snippet trigger()}
		<div class={{ "notification-trigger": true, "notification-shake": unreadCount }}>
			<Bell />
			{#if unreadCount}
				<div class="notification-unread"></div>
			{/if}
		</div>
	{/snippet}
	{#snippet title()}
		<div class="notification-popover-title"><h3 class="notification-popover-title-header">Notifications</h3></div>
	{/snippet}
	<div class="notification-body">
		{#each notifications as notification}
			{@render notificationLine(notification)}
		{/each}
	</div>
</Popover>

<style>
	.notification-popover-title {
		padding: 16px;
		border-bottom: 1px solid var(--border);
		margin: 0;
	}
	.notification-popover-title-header {
		margin: 0;
	}
	.notification-unread {
		position: absolute;
		height: 8px;
		width: 8px;
		background-color: red;
		border-radius: 50%;
		top: 2px;
		right: 2px;
	}
	.notification-body {
		padding: 8px;
		max-height: 50dvh;
		overflow: auto;
		scrollbar-gutter: stable;
	}
	.notification-trigger {
		position: relative;
	}
	.notification-shake {
		animation: tilt-shake 10s ease-out infinite;
	}

	.notification-line-body {
		display: flex;
		flex-direction: column;
		border-bottom: 1px solid var(--border);
		padding: 8px;
		gap: 4px;
	}
	.notification-summary-line {
		display: flex;
		justify-content: space-between;
		border-bottom: 1px solid var(--surface-color-light-border);
	}
	.notification-summary-text {
		font-size: 1.1em;
		color: var(--primary);
	}
	.notification-date {
		font-size: 0.95em;
	}
	.notification-message-line {
		& p {
			color: var(--surface-color-light-text-color);
			font-size: 0.95em;
		}
	}
</style>
