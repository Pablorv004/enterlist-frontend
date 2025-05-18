<template>
    <div class="empty-state">
        <ion-icon :icon="icon" class="empty-icon"></ion-icon>
        <h3>{{ title }}</h3>
        <p>{{ message }}</p>
        <div v-if="$slots.actions" class="empty-actions">
            <slot name="actions"></slot>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { IonIcon } from '@ionic/vue';
import { alertCircleOutline } from 'ionicons/icons';

export default defineComponent({
    name: 'EmptyStateDisplay',
    components: {
        IonIcon
    },
    props: {
        icon: {
            type: String,
            default: alertCircleOutline
        },
        title: {
            type: String,
            default: 'No Data Found'
        },
        message: {
            type: String,
            default: 'There is no data to display at this time.'
        },
        resourceType: {
            type: String,
            default: ''
        }
    },
    computed: {
        /**
         * Get a specific message based on resource type if no message was provided
         */
        displayMessage() {
            if (this.message !== 'There is no data to display at this time.') {
                return this.message;
            }

            const messages: Record<string, string> = {
                songs: "No songs found. Try importing songs from your linked accounts.",
                playlists: "No playlists found. Try importing playlists from your linked accounts.",
                submissions: "No submissions found. You haven't submitted any songs yet.",
                "playlist-submissions": "No submissions found for your playlists.",
                "payment-methods": "No payment methods found. Add a payment method to start submitting songs.",
                "linked-accounts": "No linked accounts found. Connect your music platform accounts to import your content.",
                transactions: "No transactions found.",
                default: "No data found."
            };

            return messages[this.resourceType] || messages.default;
        }
    }
});
</script>

<style scoped>
.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 64px 0;
    text-align: center;
    background-color: white;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.empty-icon {
    font-size: 48px;
    color: var(--ion-color-medium);
    margin-bottom: 16px;
}

h3 {
    margin: 0 0 8px;
    font-size: 20px;
    font-weight: 600;
}

p {
    margin: 0 0 20px;
    color: var(--ion-color-medium);
    max-width: 320px;
}

.empty-actions {
    display: flex;
    gap: 12px;
    margin-top: 16px;
}
</style>
