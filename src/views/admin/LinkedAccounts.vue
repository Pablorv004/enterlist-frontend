<template>
    <ion-page>
        <div class="admin-layout">
            <!-- Side Panel -->
            <admin-side-panel :active-tab="'linked-accounts'"></admin-side-panel>

            <!-- Main Content -->
            <div class="main-content">
                <ion-content :fullscreen="true" class="admin-content">
                    <div class="admin-container">
                        <admin-table title="Linked Accounts Management" :columns="columns" :rows="linkedAccounts"
                            :loading="loading" empty-message="No linked accounts found in the system.">
                            <template #actions>
                                <ion-button @click="refreshLinkedAccounts" fill="outline" size="small">
                                    <ion-icon :icon="refreshIcon" slot="start"></ion-icon>
                                    Refresh
                                </ion-button>
                            </template>

                            <!-- Custom column templates -->
                            <template #table-row="props">
                                <span v-if="props.column.field === 'platform'">
                                    <ion-badge :color="getPlatformColor(props.row.platform?.name)">
                                        {{ props.row.platform?.name || 'Unknown' }}
                                    </ion-badge>
                                </span>
                                <span v-else-if="props.column.field === 'deleted'">
                                    <ion-badge :color="props.row.deleted ? 'danger' : 'success'">
                                        {{ props.row.deleted ? 'Deleted' : 'Active' }}
                                    </ion-badge>
                                </span>
                                <span
                                    v-else-if="props.column.field === 'created_at' || props.column.field === 'token_expires_at'">
                                    {{ formatDate(props.row[props.column.field]) }}
                                </span>
                                <span v-else-if="props.column.field === 'user'">
                                    {{ props.row.user?.username || 'Unknown' }}
                                </span>
                                <span v-else-if="props.column.field === 'actions'">
                                    <div class="action-buttons">
                                        <ion-button fill="clear" size="small" color="primary"
                                            @click="editLinkedAccount(props.row)">
                                            <ion-icon :icon="editIcon" slot="icon-only"></ion-icon>
                                        </ion-button>
                                        <ion-button fill="clear" size="small" color="danger"
                                            @click="confirmDeleteLinkedAccount(props.row)">
                                            <ion-icon :icon="trashIcon" slot="icon-only"></ion-icon>
                                        </ion-button>
                                    </div>
                                </span>
                                <span v-else>{{ props.formattedRow[props.column.field] }}</span>
                            </template>
                        </admin-table>
                    </div>
                </ion-content>
            </div>
        </div>

        <!-- Edit Linked Account Modal -->
        <ion-modal :is-open="isEditModalOpen" @didDismiss="closeEditModal">
            <ion-header>
                <ion-toolbar>
                    <ion-title>Edit Linked Account</ion-title>
                    <ion-buttons slot="end">
                        <ion-button @click="closeEditModal">
                            <ion-icon :icon="closeIcon" slot="icon-only"></ion-icon>
                        </ion-button>
                    </ion-buttons>
                </ion-toolbar>
            </ion-header>

            <ion-content class="ion-padding">
                <form @submit.prevent="saveLinkedAccount" v-if="selectedLinkedAccount">
                    <ion-item>
                        <ion-label position="stacked">External User ID *</ion-label>
                        <ion-input v-model="selectedLinkedAccount.external_user_id" required></ion-input>
                    </ion-item>

                    <ion-item>
                        <ion-label position="stacked">Token Expires At</ion-label>
                        <ion-input v-model="selectedLinkedAccount.token_expires_at" type="datetime-local"></ion-input>
                    </ion-item>

                    <ion-item>
                        <ion-label position="stacked">Status</ion-label>
                        <ion-select v-model="selectedLinkedAccount.deleted">
                            <ion-select-option :value="false">Active</ion-select-option>
                            <ion-select-option :value="true">Deleted</ion-select-option>
                        </ion-select>
                    </ion-item>

                    <div class="form-buttons">
                        <ion-button type="submit" expand="block" :disabled="saving">
                            {{ saving ? 'Saving...' : 'Save Changes' }}
                        </ion-button>
                        <ion-button expand="block" fill="outline" @click="closeEditModal" :disabled="saving">
                            Cancel
                        </ion-button>
                    </div>
                </form>
            </ion-content>
        </ion-modal>

        <!-- Delete Confirmation Alert -->
        <ion-alert :is-open="showDeleteAlert" header="Confirm Delete"
            :message="`Are you sure you want to delete the linked account for ${selectedLinkedAccount?.external_user_id}?`"
            :buttons="[
                { text: 'Cancel', role: 'cancel' },
                { text: 'Delete', role: 'destructive', handler: deleteLinkedAccount }
            ]" @didDismiss="showDeleteAlert = false"></ion-alert>
    </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import {
    IonPage,
    IonContent,
    IonButton,
    IonIcon,
    IonModal,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonItem,
    IonLabel,
    IonInput,
    IonSelect,
    IonSelectOption,
    IonAlert,
    IonBadge,
    alertController,
    toastController
} from '@ionic/vue';
import {
    refreshOutline as refreshIcon,
    pencilOutline as editIcon,
    trashOutline as trashIcon,
    closeOutline as closeIcon
} from 'ionicons/icons';
import AdminSidePanel from '@/components/admin/AdminSidePanel.vue';
import AdminTable from '@/components/admin/AdminTable.vue';
import { AdminService } from '@/services/AdminService';
import type { AdminLinkedAccount, Column } from '@/types/admin';
import { formatDate } from '@/utils/date';
import { useAuthStore } from '@/store/auth';

// Data
const authStore = useAuthStore();
const linkedAccounts = ref<AdminLinkedAccount[]>([]);
const loading = ref(false);
const isEditModalOpen = ref(false);
const selectedLinkedAccount = ref<AdminLinkedAccount | null>(null);
const saving = ref(false);
const showDeleteAlert = ref(false);

// Table columns
const columns = ref<Column[]>([
    { field: 'linked_account_id', label: 'ID', sortable: true },
    { field: 'user', label: 'User', sortable: true },
    { field: 'platform', label: 'Platform', sortable: true },
    { field: 'external_user_id', label: 'External User ID', sortable: true },
    { field: 'token_expires_at', label: 'Token Expires', sortable: true },
    { field: 'deleted', label: 'Status', sortable: true },
    { field: 'created_at', label: 'Created', sortable: true },
    { field: 'actions', label: 'Actions', sortable: false }
]);

// Computed
const getPlatformColor = (platform: string) => {
    const colorMap: { [key: string]: string } = {
        'Spotify': 'success',
        'Apple Music': 'primary',
        'YouTube Music': 'danger',
        'SoundCloud': 'warning'
    };
    return colorMap[platform] || 'medium';
};

// Methods
const loadLinkedAccounts = async () => {
    loading.value = true;
    try {
        const response = await AdminService.getLinkedAccounts();
        linkedAccounts.value = response.data || response;
    } catch (error) {
        console.error('Error loading linked accounts:', error);
        const toast = await toastController.create({
            message: 'Error loading linked accounts',
            duration: 3000,
            color: 'danger'
        });
        await toast.present();
    } finally {
        loading.value = false;
    }
};

const refreshLinkedAccounts = async () => {
    await loadLinkedAccounts();
    const toast = await toastController.create({
        message: 'Linked accounts refreshed',
        duration: 2000,
        color: 'success'
    });
    await toast.present();
};

const editLinkedAccount = (linkedAccount: AdminLinkedAccount) => {
    selectedLinkedAccount.value = { ...linkedAccount };
    isEditModalOpen.value = true;
};

const closeEditModal = () => {
    isEditModalOpen.value = false;
    selectedLinkedAccount.value = null;
    saving.value = false;
};

const saveLinkedAccount = async () => {
    if (!selectedLinkedAccount.value) return;

    saving.value = true;
    try {
        await AdminService.updateLinkedAccount(
            selectedLinkedAccount.value.linked_account_id,
            selectedLinkedAccount.value
        );        // Record admin action
        await AdminService.createAdminAction({
            admin_user_id: authStore.user?.user_id || '',
            action_type: 'update_linked_account',
            target_user_id: selectedLinkedAccount.value.user_id,
            reason: 'Linked account updated via admin panel'
        });

        const toast = await toastController.create({
            message: 'Linked account updated successfully',
            duration: 3000,
            color: 'success'
        });
        await toast.present();

        closeEditModal();
        await loadLinkedAccounts();
    } catch (error) {
        console.error('Error updating linked account:', error);
        const toast = await toastController.create({
            message: 'Error updating linked account',
            duration: 3000,
            color: 'danger'
        });
        await toast.present();
    } finally {
        saving.value = false;
    }
};

const confirmDeleteLinkedAccount = (linkedAccount: AdminLinkedAccount) => {
    selectedLinkedAccount.value = linkedAccount;
    showDeleteAlert.value = true;
};

const deleteLinkedAccount = async () => {
    if (!selectedLinkedAccount.value) return;

    try {
        await AdminService.deleteLinkedAccount(selectedLinkedAccount.value.linked_account_id);        // Record admin action
        await AdminService.createAdminAction({
            admin_user_id: authStore.user?.user_id || '',
            action_type: 'delete_linked_account',
            target_user_id: selectedLinkedAccount.value.user_id,
            reason: 'Linked account deleted via admin panel'
        });

        const toast = await toastController.create({
            message: 'Linked account deleted successfully',
            duration: 3000,
            color: 'success'
        });
        await toast.present();

        await loadLinkedAccounts();
    } catch (error) {
        console.error('Error deleting linked account:', error);
        const toast = await toastController.create({
            message: 'Error deleting linked account',
            duration: 3000,
            color: 'danger'
        });
        await toast.present();
    }

    selectedLinkedAccount.value = null;
    showDeleteAlert.value = false;
};

// Lifecycle
onMounted(() => {
    loadLinkedAccounts();
});
</script>

<style scoped>
.admin-layout {
    display: flex;
    height: 100vh;
}

.main-content {
    flex: 1;
    overflow: hidden;
}

.admin-content {
    --background: #f8f9fa;
}

.admin-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
}

.action-buttons {
    display: flex;
    gap: 4px;
}

.form-buttons {
    margin-top: 20px;
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.form-buttons ion-button {
    margin: 0;
}
</style>
