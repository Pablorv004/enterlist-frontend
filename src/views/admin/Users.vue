<template>
    <ion-page>
        <div class="admin-layout">
            <!-- Side Panel -->
            <admin-side-panel :active-tab="'users'"></admin-side-panel>

            <!-- Main Content -->
            <div class="main-content">
                <ion-content :fullscreen="true" class="admin-content">
                    <div class="admin-container">
                        <admin-table title="User Management" :columns="columns" :rows="users" :loading="loading"
                            empty-message="No users found in the system.">
                            <template #actions>
                                <ion-button @click="refreshUsers" fill="outline" size="small">
                                    <ion-icon :icon="refreshIcon" slot="start"></ion-icon>
                                    Refresh
                                </ion-button>
                            </template>

                            <!-- User Status Column -->
                            <template #table-row="props">
                                <span v-if="props.column.field === 'is_active'">
                                    <ion-badge :color="props.row.is_active ? 'success' : 'danger'">
                                        {{ props.row.is_active ? 'Active' : 'Inactive' }}
                                    </ion-badge>
                                </span>
                                <span v-else-if="props.column.field === 'role'">
                                    <ion-badge :color="getRoleColor(props.row.role)">
                                        {{ formatRole(props.row.role) }}
                                    </ion-badge>
                                </span>
                                <span v-else-if="props.column.field === 'created_at'">
                                    {{ formatDate(props.row.created_at) }}
                                </span>
                                <span v-else-if="props.column.field === 'actions'">
                                    <div class="action-buttons">
                                        <ion-button fill="clear" size="small" color="primary"
                                            @click="editUser(props.row)">
                                            <ion-icon :icon="editIcon" slot="icon-only"></ion-icon>
                                        </ion-button>
                                        <ion-button fill="clear" size="small"
                                            :color="props.row.is_active ? 'warning' : 'success'"
                                            @click="toggleUserStatus(props.row)">
                                            <ion-icon :icon="props.row.is_active ? lockClosedIcon : lockOpenIcon"
                                                slot="icon-only"></ion-icon>
                                        </ion-button>
                                        <ion-button fill="clear" size="small" color="danger"
                                            @click="confirmDeleteUser(props.row)">
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

        <!-- Edit User Modal -->
        <ion-modal :is-open="isEditModalOpen" @didDismiss="closeEditModal">
            <ion-header>
                <ion-toolbar>
                    <ion-title>Edit User</ion-title>
                    <ion-buttons slot="end">
                        <ion-button @click="closeEditModal">
                            <ion-icon :icon="closeIcon" slot="icon-only"></ion-icon>
                        </ion-button>
                    </ion-buttons>
                </ion-toolbar>
            </ion-header>
            <ion-content class="ion-padding">                <form @submit.prevent="saveUser" v-if="selectedUser">
                    <ion-item>
                        <ion-label position="stacked">User ID</ion-label>
                        <ion-input :value="selectedUser.user_id" readonly></ion-input>
                    </ion-item>

                    <ion-item>
                        <ion-label position="stacked">Username</ion-label>
                        <ion-input v-model="selectedUser.username" required></ion-input>
                    </ion-item>

                    <ion-item>
                        <ion-label position="stacked">Email</ion-label>
                        <ion-input v-model="selectedUser.email" type="email" required></ion-input>
                    </ion-item>

                    <ion-item>
                        <ion-label position="stacked">Role</ion-label>
                        <ion-select v-model="selectedUser.role" interface="popover">
                            <ion-select-option value="artist">Artist</ion-select-option>
                            <ion-select-option value="playlist_maker">Playlist Maker</ion-select-option>
                            <ion-select-option value="admin">Admin</ion-select-option>
                        </ion-select>
                    </ion-item>

                    <ion-item>
                        <ion-label position="stacked">OAuth Provider</ion-label>
                        <ion-input v-model="selectedUser.oauth_provider" placeholder="OAuth provider"></ion-input>
                    </ion-item>

                    <ion-item>
                        <ion-label position="stacked">OAuth ID</ion-label>
                        <ion-input v-model="selectedUser.oauth_id" placeholder="OAuth ID"></ion-input>
                    </ion-item>

                    <ion-item>
                        <ion-checkbox v-model="selectedUser.is_active"></ion-checkbox>
                        <ion-label class="ion-margin-start">Active User</ion-label>
                    </ion-item>

                    <ion-item>
                        <ion-checkbox v-model="selectedUser.email_confirmed"></ion-checkbox>
                        <ion-label class="ion-margin-start">Email Confirmed</ion-label>
                    </ion-item>

                    <div class="modal-actions">
                        <ion-button @click="closeEditModal" fill="outline" color="medium">
                            Cancel
                        </ion-button>
                        <ion-button type="submit" :disabled="saving">
                            <ion-spinner v-if="saving" name="crescent"></ion-spinner>
                            <span v-else>Save Changes</span>
                        </ion-button>
                    </div>
                </form>
            </ion-content>
        </ion-modal>
    </ion-page>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from 'vue';
import {
    IonPage, IonContent, IonButton, IonIcon, IonBadge, IonModal, IonHeader,
    IonToolbar, IonTitle, IonButtons, IonItem, IonLabel, IonInput, IonSelect,
    IonSelectOption, IonCheckbox, IonSpinner, alertController, toastController
} from '@ionic/vue';
import {
    refresh, create, lockClosed, lockOpen, trash, close
} from 'ionicons/icons';
import { AdminUser } from '@/types/admin';
import AdminSidePanel from '@/components/admin/AdminSidePanel.vue';
import AdminTable from '@/components/admin/AdminTable.vue';
import { AdminService } from '@/services/AdminService';
import { formatDate } from '@/utils/date';
import { useAuthStore } from '@/store/auth';

export default defineComponent({
    name: 'AdminUsers',
    components: {
        IonPage, IonContent, IonButton, IonIcon, IonBadge, IonModal, IonHeader,
        IonToolbar, IonTitle, IonButtons, IonItem, IonLabel, IonInput, IonSelect,
        IonSelectOption, IonCheckbox, IonSpinner,
        AdminSidePanel, AdminTable    }, setup() {
        const users = ref<AdminUser[]>([]);
        const loading = ref(true);
        const saving = ref(false);
        const isEditModalOpen = ref(false);
        const selectedUser = ref<AdminUser | null>(null);
        const authStore = useAuthStore();const columns = [
            {
                label: 'User ID',
                field: 'user_id',
                sortable: true,
                width: '200px'
            },
            {
                label: 'Username',
                field: 'username',
                sortable: true
            },
            {
                label: 'Email',
                field: 'email',
                sortable: true
            },
            {
                label: 'Role',
                field: 'role',
                sortable: true,
                render: (value: string) => `<ion-badge color="${getRoleColor(value)}">${formatRole(value)}</ion-badge>`
            },
            {
                label: 'OAuth Provider',
                field: 'oauth_provider',
                sortable: true
            },
            {
                label: 'Status',
                field: 'is_active',
                sortable: true,
                render: (value: boolean) => `<ion-badge color="${value ? 'success' : 'danger'}">${value ? 'Active' : 'Inactive'}</ion-badge>`
            },
            {
                label: 'Email Confirmed',
                field: 'email_confirmed',
                sortable: true,
                render: (value: boolean) => `<ion-badge color="${value ? 'success' : 'warning'}">${value ? 'Yes' : 'No'}</ion-badge>`
            },
            {
                label: 'Created',
                field: 'created_at',
                sortable: true,
                render: (value: string) => formatDate(value)
            },
            {
                label: 'Updated',
                field: 'updated_at',
                sortable: true,
                render: (value: string) => formatDate(value)
            },
            {
                label: 'Actions',
                field: 'actions',
                sortable: false,
                width: '100px',
                render: (value: any, row: AdminUser) => `
                    <div class="action-buttons">
                        <ion-button fill="clear" size="small" color="primary" onclick="editUser('${row.user_id}')">
                            <ion-icon name="create" slot="icon-only"></ion-icon>
                        </ion-button>
                        <ion-button fill="clear" size="small" color="danger" onclick="deleteUser('${row.user_id}')">
                            <ion-icon name="trash" slot="icon-only"></ion-icon>
                        </ion-button>
                    </div>
                `
            }
        ];const loadUsers = async (skip = 0, take = 10) => {
            try {
                loading.value = true;
                const response = await AdminService.getUsers(skip, take);
                users.value = response.data || response; // Handle both paginated and simple array responses
            } catch (error) {
                console.error('Failed to load users:', error);
                const toast = await toastController.create({
                    message: 'Failed to load users',
                    duration: 3000,
                    color: 'danger'
                });
                await toast.present();
            } finally {
                loading.value = false;
            }
        };

        const refreshUsers = () => {
            loadUsers();
        }; const getRoleColor = (role: string) => {
            const colors: { [key: string]: string } = {
                admin: 'danger',
                playlist_maker: 'warning',
                artist: 'primary'
            };
            return colors[role] || 'medium';
        };

        const formatRole = (role: string) => {
            const roles: { [key: string]: string } = {
                admin: 'Admin',
                playlist_maker: 'Playlist Maker',
                artist: 'Artist'
            };
            return roles[role] || role;
        };

        const editUser = (user: any) => {
            selectedUser.value = { ...user };
            isEditModalOpen.value = true;
        };

        const closeEditModal = () => {
            isEditModalOpen.value = false;
            selectedUser.value = null;
        };

        const saveUser = async () => {
            if (!selectedUser.value) return;

            try {
                saving.value = true;
                await AdminService.updateUser(selectedUser.value.user_id, selectedUser.value);                // Record admin action
                await AdminService.createAdminAction({
                    admin_user_id: authStore.user?.user_id || '',
                    action_type: 'update_user',
                    target_user_id: selectedUser.value.user_id,
                    reason: 'User details updated via admin panel'
                });

                const toast = await toastController.create({
                    message: 'User updated successfully',
                    duration: 3000,
                    color: 'success'
                });
                await toast.present();

                closeEditModal();
                loadUsers();
            } catch (error) {
                console.error('Failed to update user:', error);
                const toast = await toastController.create({
                    message: 'Failed to update user',
                    duration: 3000,
                    color: 'danger'
                });
                await toast.present();
            } finally {
                saving.value = false;
            }
        };

        const toggleUserStatus = async (user: any) => {
            const action = user.is_active ? 'suspend' : 'reactivate';
            const newStatus = !user.is_active;

            try {
                if (action === 'suspend') {
                    await AdminService.suspendUser(user.user_id, 'Admin action via admin panel');
                } else {
                    await AdminService.reactivateUser(user.user_id);
                }                // Record admin action
                await AdminService.createAdminAction({
                    admin_user_id: authStore.user?.user_id || '',
                    action_type: action === 'suspend' ? 'suspend_user' : 'reactivate_user',
                    target_user_id: user.user_id,
                    reason: `User ${action}ed via admin panel`
                });

                const toast = await toastController.create({
                    message: `User ${action}ed successfully`,
                    duration: 3000,
                    color: 'success'
                });
                await toast.present();

                loadUsers();
            } catch (error) {
                console.error(`Failed to ${action} user:`, error);
                const toast = await toastController.create({
                    message: `Failed to ${action} user`,
                    duration: 3000,
                    color: 'danger'
                });
                await toast.present();
            }
        };

        const confirmDeleteUser = async (user: any) => {
            const alert = await alertController.create({
                header: 'Delete User',
                message: `Are you sure you want to delete user "${user.username}"? This action cannot be undone.`,
                buttons: [
                    {
                        text: 'Cancel',
                        role: 'cancel'
                    },
                    {
                        text: 'Delete',
                        role: 'destructive',
                        handler: () => deleteUser(user)
                    }
                ]
            });
            await alert.present();
        };

        const deleteUser = async (user: any) => {
            try {
                await AdminService.deleteUser(user.user_id);                // Record admin action
                await AdminService.createAdminAction({
                    admin_user_id: authStore.user?.user_id || '',
                    action_type: 'delete_user',
                    target_user_id: user.user_id,
                    reason: 'User deleted via admin panel'
                });

                const toast = await toastController.create({
                    message: 'User deleted successfully',
                    duration: 3000,
                    color: 'success'
                });
                await toast.present();

                loadUsers();
            } catch (error) {
                console.error('Failed to delete user:', error);
                const toast = await toastController.create({
                    message: 'Failed to delete user',
                    duration: 3000,
                    color: 'danger'
                });
                await toast.present();
            }
        };

        onMounted(() => {
            loadUsers();
        });

        return {
            users,
            loading,
            saving,
            columns,
            isEditModalOpen,
            selectedUser,
            loadUsers,
            refreshUsers,
            getRoleColor,
            formatRole,
            formatDate,
            editUser,
            closeEditModal,
            saveUser,
            toggleUserStatus,
            confirmDeleteUser,
            // Icons
            refreshIcon: refresh,
            editIcon: create,
            lockClosedIcon: lockClosed,
            lockOpenIcon: lockOpen,
            trashIcon: trash,
            closeIcon: close
        };
    }
});
</script>

<style scoped>
.admin-layout {
    display: flex;
    height: 100vh;
}

.main-content {
    flex: 1;
    display: flex;
    flex-direction: column;
}

.admin-content {
    --background: #f8f9fa;
}

.admin-container {
    padding: 24px;
    max-width: 1400px;
    margin: 0 auto;
}

.action-buttons {
    display: flex;
    gap: 4px;
    justify-content: center;
}

.modal-actions {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    margin-top: 24px;
}

@media (max-width: 768px) {
    .admin-layout {
        flex-direction: column;
    }

    .admin-container {
        padding: 16px;
    }
}
</style>
