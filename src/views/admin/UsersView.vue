<template>
    <ion-page>
        <page-header title="User Management" :showBackButton="true" backHref="/tabs/admin"></page-header>

        <ion-content :fullscreen="true">
            <ion-header collapse="condense">
                <ion-toolbar>
                    <ion-title size="large">User Management</ion-title>
                    <ion-buttons slot="end">
                        <ion-button @click="showAddUserModal = true">
                            <ion-icon :icon="personAdd" slot="icon-only"></ion-icon>
                        </ion-button>
                    </ion-buttons>
                </ion-toolbar>
            </ion-header>

            <div class="ion-padding">
                <!-- Filter and Search -->
                <div class="filters">
                    <ion-searchbar v-model="searchTerm" placeholder="Search by name or email" @ionInput="handleSearch"
                        :debounce="500"></ion-searchbar>

                    <ion-item>
                        <ion-label>Role</ion-label>
                        <ion-select v-model="roleFilter" @ionChange="handleFilterChange">
                            <ion-select-option value="all">All Roles</ion-select-option>
                            <ion-select-option value="artist">Artists</ion-select-option>
                            <ion-select-option value="playlist_maker">Playlist Makers</ion-select-option>
                            <ion-select-option value="admin">Admins</ion-select-option>
                        </ion-select>
                    </ion-item>

                    <ion-item>
                        <ion-label>Status</ion-label>
                        <ion-select v-model="statusFilter" @ionChange="handleFilterChange">
                            <ion-select-option value="all">All Status</ion-select-option>
                            <ion-select-option value="active">Active</ion-select-option>
                            <ion-select-option value="inactive">Inactive</ion-select-option>
                        </ion-select>
                    </ion-item>
                </div>

                <div v-if="loading" class="ion-padding ion-text-center">
                    <ion-spinner></ion-spinner>
                    <p>Loading users...</p>
                </div>

                <div v-else-if="error" class="ion-padding ion-text-center error-message">
                    <p>{{ error }}</p>
                    <ion-button @click="loadUsers">Retry</ion-button>
                </div>

                <div v-else-if="users.length === 0" class="ion-padding ion-text-center">
                    <ion-icon :icon="people" size="large" color="medium"></ion-icon>
                    <h4>No users found</h4>
                    <p>Try adjusting your search or filters.</p>
                    <ion-button @click="showAddUserModal = true">Add New User</ion-button>
                </div>

                <div v-else>
                    <!-- User List -->
                    <ion-card>
                        <ion-card-header class="list-header">
                            <ion-card-title>Users ({{ totalItems }})</ion-card-title>
                            <ion-button fill="clear" @click="showAddUserModal = true">
                                <ion-icon :icon="personAdd" slot="start"></ion-icon>
                                Add User
                            </ion-button>
                        </ion-card-header>

                        <ion-list>
                            <ion-item-sliding v-for="user in users" :key="user.user_id">
                                <ion-item button @click="selectUser(user)">
                                    <ion-avatar slot="start">
                                        <img v-if="user.avatar_url" :src="user.avatar_url" alt="Avatar" />
                                        <ion-icon v-else :icon="personCircle" size="large"></ion-icon>
                                    </ion-avatar>
                                    <ion-label>
                                        <h2>{{ user.username }}</h2>
                                        <p>{{ user.email }}</p>
                                        <p>
                                            <ion-badge :color="getRoleBadgeColor(user.role)">{{ formatRole(user.role)
                                                }}</ion-badge>
                                            <ion-badge :color="user.active ? 'success' : 'medium'"
                                                class="status-badge">{{ user.active ? 'Active' : 'Inactive'
                                                }}</ion-badge>
                                        </p>
                                    </ion-label>
                                </ion-item>
                                <ion-item-options side="end">
                                    <ion-item-option color="primary" @click="editUser(user)">
                                        <ion-icon :icon="create" slot="icon-only"></ion-icon>
                                    </ion-item-option>
                                    <ion-item-option :color="user.active ? 'warning' : 'success'"
                                        @click="toggleUserStatus(user)">
                                        <ion-icon :icon="user.active ? 'ban' : 'checkmark'" slot="icon-only"></ion-icon>
                                    </ion-item-option>
                                    <ion-item-option color="danger" @click="confirmDeleteUser(user)">
                                        <ion-icon :icon="trash" slot="icon-only"></ion-icon>
                                    </ion-item-option>
                                </ion-item-options>
                            </ion-item-sliding>
                        </ion-list>
                    </ion-card>

                    <!-- Pagination -->
                    <div class="ion-padding ion-text-center" v-if="totalItems > pageSize">
                        <ion-button fill="clear" size="small" :disabled="currentPage === 1"
                            @click="goToPage(currentPage - 1)">
                            <ion-icon :icon="chevronBack" slot="icon-only"></ion-icon>
                        </ion-button>
                        <span>Page {{ currentPage }} of {{ totalPages }}</span>
                        <ion-button fill="clear" size="small" :disabled="currentPage === totalPages"
                            @click="goToPage(currentPage + 1)">
                            <ion-icon :icon="chevronForward" slot="icon-only"></ion-icon>
                        </ion-button>
                    </div>
                </div>
            </div>
        </ion-content>

        <!-- Add User Modal -->
        <ion-modal :is-open="showAddUserModal" @didDismiss="showAddUserModal = false">
            <ion-header>
                <ion-toolbar>
                    <ion-title>Add New User</ion-title>
                    <ion-buttons slot="end">
                        <ion-button @click="showAddUserModal = false">Cancel</ion-button>
                    </ion-buttons>
                </ion-toolbar>
            </ion-header>
            <ion-content class="ion-padding">
                <form @submit.prevent="addNewUser">
                    <ion-list>
                        <ion-item>
                            <ion-label position="floating">Username</ion-label>
                            <ion-input v-model="newUser.username" required></ion-input>
                        </ion-item>
                        <div v-if="errors.username" class="error-message">{{ errors.username }}</div>

                        <ion-item>
                            <ion-label position="floating">Email</ion-label>
                            <ion-input v-model="newUser.email" type="email" required></ion-input>
                        </ion-item>
                        <div v-if="errors.email" class="error-message">{{ errors.email }}</div>

                        <ion-item>
                            <ion-label position="floating">Password</ion-label>
                            <ion-input v-model="newUser.password" type="password" required></ion-input>
                        </ion-item>
                        <div v-if="errors.password" class="error-message">{{ errors.password }}</div>

                        <ion-item>
                            <ion-label>Role</ion-label>
                            <ion-select v-model="newUser.role">
                                <ion-select-option value="artist">Artist</ion-select-option>
                                <ion-select-option value="playlist_maker">Playlist Maker</ion-select-option>
                                <ion-select-option value="admin">Admin</ion-select-option>
                            </ion-select>
                        </ion-item>
                        <div v-if="errors.role" class="error-message">{{ errors.role }}</div>

                        <div v-if="userError" class="ion-padding error-message">
                            {{ userError }}
                        </div>

                        <div class="ion-padding ion-margin-top">
                            <ion-button expand="block" type="submit" :disabled="addingUser">
                                <ion-spinner v-if="addingUser" name="dots"></ion-spinner>
                                <span v-else>Create User</span>
                            </ion-button>
                        </div>
                    </ion-list>
                </form>
            </ion-content>
        </ion-modal>

        <!-- Edit User Modal -->
        <ion-modal :is-open="showEditModal" @didDismiss="showEditModal = false">
            <ion-header>
                <ion-toolbar>
                    <ion-title>Edit User</ion-title>
                    <ion-buttons slot="end">
                        <ion-button @click="showEditModal = false">Cancel</ion-button>
                    </ion-buttons>
                </ion-toolbar>
            </ion-header>
            <ion-content class="ion-padding">
                <form @submit.prevent="updateUser">
                    <ion-list>
                        <ion-item>
                            <ion-label position="floating">Username</ion-label>
                            <ion-input v-model="editForm.username" required></ion-input>
                        </ion-item>
                        <div v-if="errors.username" class="error-message">{{ errors.username }}</div>

                        <ion-item>
                            <ion-label position="floating">Email</ion-label>
                            <ion-input v-model="editForm.email" type="email" required></ion-input>
                        </ion-item>
                        <div v-if="errors.email" class="error-message">{{ errors.email }}</div>

                        <ion-item>
                            <ion-label>Role</ion-label>
                            <ion-select v-model="editForm.role">
                                <ion-select-option value="artist">Artist</ion-select-option>
                                <ion-select-option value="playlist_maker">Playlist Maker</ion-select-option>
                                <ion-select-option value="admin">Admin</ion-select-option>
                            </ion-select>
                        </ion-item>

                        <ion-item>
                            <ion-label>Status</ion-label>
                            <ion-toggle v-model="editForm.active"></ion-toggle>
                        </ion-item>

                        <div v-if="editError" class="ion-padding error-message">
                            {{ editError }}
                        </div>

                        <div class="ion-padding ion-margin-top">
                            <ion-button expand="block" type="submit" :disabled="updating">
                                <ion-spinner v-if="updating" name="dots"></ion-spinner>
                                <span v-else>Save Changes</span>
                            </ion-button>
                            <ion-button expand="block" fill="outline" color="danger" @click="resetPassword"
                                :disabled="updating">
                                <ion-icon :icon="lockOpen" slot="start"></ion-icon>
                                Reset Password
                            </ion-button>
                        </div>
                    </ion-list>
                </form>
            </ion-content>
        </ion-modal>

        <!-- User Detail Modal -->
        <ion-modal :is-open="showDetailModal" @didDismiss="showDetailModal = false">
            <ion-header>
                <ion-toolbar>
                    <ion-title>User Details</ion-title>
                    <ion-buttons slot="end">
                        <ion-button @click="showDetailModal = false">Close</ion-button>
                    </ion-buttons>
                </ion-toolbar>
            </ion-header>
            <ion-content class="ion-padding">
                <div v-if="selectedUser">
                    <div class="user-header">
                        <ion-avatar class="detail-avatar">
                            <img v-if="selectedUser.avatar_url" :src="selectedUser.avatar_url" alt="Avatar" />
                            <ion-icon v-else :icon="personCircle" size="large"></ion-icon>
                        </ion-avatar>
                        <h1>{{ selectedUser.username }}</h1>
                        <ion-badge :color="getRoleBadgeColor(selectedUser.role)">{{ formatRole(selectedUser.role)
                            }}</ion-badge>
                    </div>

                    <ion-list lines="full">
                        <ion-item>
                            <ion-label>
                                <h3>Email</h3>
                                <p>{{ selectedUser.email }}</p>
                            </ion-label>
                        </ion-item>
                        <ion-item>
                            <ion-label>
                                <h3>Status</h3>
                                <p>{{ selectedUser.active ? 'Active' : 'Inactive' }}</p>
                            </ion-label>
                        </ion-item>
                        <ion-item>
                            <ion-label>
                                <h3>Member Since</h3>
                                <p>{{ formatDate(selectedUser.created_at) }}</p>
                            </ion-label>
                        </ion-item>
                        <ion-item>
                            <ion-label>
                                <h3>Last Login</h3>
                                <p>{{ selectedUser.last_login ? formatDate(selectedUser.last_login) : 'Never' }}</p>
                            </ion-label>
                        </ion-item>
                    </ion-list>

                    <div class="ion-padding ion-margin-top">
                        <ion-button expand="block" @click="editUser(selectedUser)">
                            <ion-icon :icon="create" slot="start"></ion-icon>
                            Edit User
                        </ion-button>
                        <ion-button expand="block" fill="outline" :color="selectedUser.active ? 'warning' : 'success'"
                            @click="toggleUserStatus(selectedUser)">
                            <ion-icon :icon="selectedUser.active ? 'ban' : 'checkmark'" slot="start"></ion-icon>
                            {{ selectedUser.active ? 'Deactivate User' : 'Activate User' }}
                        </ion-button>
                        <ion-button expand="block" fill="outline" color="danger"
                            @click="confirmDeleteUser(selectedUser)">
                            <ion-icon :icon="trash" slot="start"></ion-icon>
                            Delete User
                        </ion-button>
                    </div>
                </div>
            </ion-content>
        </ion-modal>

        <!-- Delete User Confirmation Modal -->
        <ion-modal :is-open="showDeleteModal" @didDismiss="showDeleteModal = false">
            <div class="ion-padding">
                <h2>Delete User</h2>
                <p>Are you sure you want to delete the user "{{ selectedUser?.username }}"? This cannot be undone and
                    will remove all data associated with this user.</p>
                <div class="ion-text-right">
                    <ion-button fill="clear" @click="showDeleteModal = false">Cancel</ion-button>
                    <ion-button color="danger" @click="deleteUser">Delete</ion-button>
                </div>
            </div>
        </ion-modal>
    </ion-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import {
    IonPage,
    IonContent,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonSearchbar,
    IonItem,
    IonLabel,
    IonSelect,
    IonSelectOption,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonList,
    IonItemSliding,
    IonItemOptions,
    IonItemOption,
    IonAvatar,
    IonBadge,
    IonButton,
    IonIcon,
    IonSpinner,
    IonModal,
    IonButtons,
    IonInput,
    IonToggle,
    toastController,
    alertController,
    modalController
} from '@ionic/vue';
import {
    people,
    personCircle,
    personAdd,
    create,
    trash,
    chevronBack,
    chevronForward,
    lockOpen
} from 'ionicons/icons';
import { useApiStatus, usePagination, useFormValidation } from '@/composables/useUtils';
import PageHeader from '@/components/layout/PageHeader.vue';
import userService from '@/services/user.service';
import type { User, UserRole, UserUpdate, UserCreate } from '@/types';

// API and pagination
const { loading, error, startLoading, stopLoading, setError, clearError } = useApiStatus();
const { page: currentPage, pageSize, total: totalItems, skip, totalPages, goToPage, setTotal, updateTotalPages } = usePagination(10);
const { errors, validateEmail, validateRequired, validateMinLength, clearErrors, setError: setFormError } = useFormValidation();

// User list
const users = ref<User[]>([]);
const searchTerm = ref('');
const roleFilter = ref<string>('all');
const statusFilter = ref<string>('all');

// Selected user
const selectedUser = ref<User | null>(null);
const showDetailModal = ref(false);

// Add user
const showAddUserModal = ref(false);
const addingUser = ref(false);
const userError = ref('');
const newUser = ref<UserCreate>({
    username: '',
    email: '',
    password: '',
    role: 'artist',
    active: true
});

// Edit user
const showEditModal = ref(false);
const updating = ref(false);
const editError = ref('');
const editForm = ref<UserUpdate>({
    username: '',
    email: '',
    role: 'artist',
    active: true
});

// Delete user
const showDeleteModal = ref(false);

onMounted(() => {
    loadUsers();
});

async function loadUsers() {
    try {
        startLoading();
        clearError();

        // Get users with pagination
        const response = await userService.getUsers(
            skip.value,
            pageSize.value
        );

        // Apply filters if needed
        let filteredUsers = response.data;

        if (roleFilter.value !== 'all') {
            filteredUsers = filteredUsers.filter(u => u.role === roleFilter.value);
        }

        if (statusFilter.value !== 'all') {
            const isActive = statusFilter.value === 'active';
            filteredUsers = filteredUsers.filter(u => u.active === isActive);
        }

        if (searchTerm.value) {
            const term = searchTerm.value.toLowerCase();
            filteredUsers = filteredUsers.filter(u =>
                u.username.toLowerCase().includes(term) ||
                u.email.toLowerCase().includes(term)
            );
        }

        users.value = filteredUsers;
        setTotal(response.total);
        updateTotalPages();
    } catch (err: any) {
        setError(err.message || 'Failed to load users');
        console.error('Error loading users:', err);
    } finally {
        stopLoading();
    }
}

function handleSearch() {
    goToPage(1);
    loadUsers();
}

function handleFilterChange() {
    goToPage(1);
    loadUsers();
}

function selectUser(user: User) {
    selectedUser.value = user;
    showDetailModal.value = true;
}

function editUser(user: User) {
    selectedUser.value = user;
    editForm.value = {
        username: user.username,
        email: user.email,
        role: user.role,
        active: user.active
    };
    showDetailModal.value = false;
    showEditModal.value = true;
}

async function updateUser() {
    clearErrors();
    editError.value = '';

    // Form validation
    let isValid = true;

    if (!validateRequired(editForm.value.username, 'username')) {
        isValid = false;
    } else if (!validateMinLength(editForm.value.username, 'username', 3)) {
        isValid = false;
    }

    if (!validateRequired(editForm.value.email, 'email')) {
        isValid = false;
    } else if (!validateEmail(editForm.value.email, 'email')) {
        isValid = false;
    }

    if (!isValid) return;

    updating.value = true;

    try {
        if (!selectedUser.value?.user_id) throw new Error('User ID not found');

        await userService.updateUser(selectedUser.value.user_id, editForm.value);

        // Update local user data
        const updatedUser = await userService.getUserById(selectedUser.value.user_id);

        // Update in users array
        const index = users.value.findIndex(u => u.user_id === selectedUser.value?.user_id);
        if (index !== -1) {
            users.value[index] = updatedUser;
        }

        // Update selected user
        selectedUser.value = updatedUser;

        // Close modal
        showEditModal.value = false;

        // Show success toast
        const toast = await toastController.create({
            message: 'User updated successfully',
            duration: 2000,
            color: 'success'
        });
        await toast.present();
    } catch (err: any) {
        editError.value = err.message || 'Failed to update user';
        console.error('Error updating user:', err);

        const toast = await toastController.create({
            message: 'Failed to update user',
            duration: 2000,
            color: 'danger'
        });
        await toast.present();
    } finally {
        updating.value = false;
    }
}

async function toggleUserStatus(user: User) {
    try {
        const newStatus = !user.active;

        // Show confirmation dialog
        const alert = await alertController.create({
            header: `${newStatus ? 'Activate' : 'Deactivate'} User`,
            message: `Are you sure you want to ${newStatus ? 'activate' : 'deactivate'} "${user.username}"?`,
            buttons: [
                {
                    text: 'Cancel',
                    role: 'cancel',
                },
                {
                    text: 'Confirm',
                    role: 'confirm',
                    handler: async () => {
                        await userService.updateUser(user.user_id, { active: newStatus });

                        // Update local user data
                        const index = users.value.findIndex(u => u.user_id === user.user_id);
                        if (index !== -1) {
                            users.value[index].active = newStatus;
                        }

                        if (selectedUser.value?.user_id === user.user_id) {
                            selectedUser.value.active = newStatus;
                        }

                        // Show success toast
                        const toast = await toastController.create({
                            message: `User ${newStatus ? 'activated' : 'deactivated'} successfully`,
                            duration: 2000,
                            color: 'success'
                        });
                        await toast.present();
                    }
                }
            ]
        });

        await alert.present();
    } catch (err: any) {
        console.error('Error toggling user status:', err);

        const toast = await toastController.create({
            message: 'Failed to update user status',
            duration: 2000,
            color: 'danger'
        });
        await toast.present();
    }
}

async function addNewUser() {
    clearErrors();
    userError.value = '';

    // Form validation
    let isValid = true;

    if (!validateRequired(newUser.value.username, 'username')) {
        isValid = false;
    } else if (!validateMinLength(newUser.value.username, 'username', 3)) {
        isValid = false;
    }

    if (!validateRequired(newUser.value.email, 'email')) {
        isValid = false;
    } else if (!validateEmail(newUser.value.email, 'email')) {
        isValid = false;
    }

    if (!validateRequired(newUser.value.password, 'password')) {
        isValid = false;
    } else if (!validateMinLength(newUser.value.password, 'password', 8)) {
        setFormError('password', 'Password must be at least 8 characters long');
        isValid = false;
    }

    if (!isValid) return;

    addingUser.value = true;

    try {
        await userService.createUser(newUser.value);

        // Close modal
        showAddUserModal.value = false;

        // Show success toast
        const toast = await toastController.create({
            message: 'User created successfully',
            duration: 2000,
            color: 'success'
        });
        await toast.present();

        // Refresh users list
        await loadUsers();
    } catch (err: any) {
        userError.value = err.message || 'Failed to create user';
        console.error('Error creating user:', err);

        const toast = await toastController.create({
            message: 'Failed to create user',
            duration: 2000,
            color: 'danger'
        });
        await toast.present();
    } finally {
        addingUser.value = false;
    }
}

async function resetPassword() {
    if (!selectedUser.value) return;

    // Show confirmation dialog
    const alert = await alertController.create({
        header: 'Reset Password',
        message: `Are you sure you want to reset the password for "${selectedUser.value.username}"?`,
        buttons: [
            {
                text: 'Cancel',
                role: 'cancel',
            },
            {
                text: 'Reset',
                role: 'confirm',
                handler: async () => {
                    try {
                        // In a real app, this would generate a new password or send a reset link
                        const newPassword = Math.random().toString(36).slice(-8);
                        await userService.resetPassword(selectedUser.value!.user_id, newPassword);

                        // Show alert with new password
                        const passwordAlert = await alertController.create({
                            header: 'New Password',
                            message: `Temporary password for "${selectedUser.value!.username}": ${newPassword}`,
                            buttons: ['OK']
                        });

                        await passwordAlert.present();
                    } catch (err: any) {
                        console.error('Error resetting password:', err);

                        const toast = await toastController.create({
                            message: 'Failed to reset password',
                            duration: 2000,
                            color: 'danger'
                        });
                        await toast.present();
                    }
                }
            }
        ]
    });

    await alert.present();
}

function confirmDeleteUser(user: User) {
    selectedUser.value = user;
    showDetailModal.value = false;
    showDeleteModal.value = true;
}

async function deleteUser() {
    if (!selectedUser.value) return;

    try {
        await userService.deleteUser(selectedUser.value.user_id);

        // Remove from local array
        users.value = users.value.filter(u => u.user_id !== selectedUser.value?.user_id);

        // Close modals
        showDeleteModal.value = false;
        selectedUser.value = null;

        // Show success toast
        const toast = await toastController.create({
            message: 'User deleted successfully',
            duration: 2000,
            color: 'success'
        });
        await toast.present();
    } catch (err: any) {
        console.error('Error deleting user:', err);

        const toast = await toastController.create({
            message: 'Failed to delete user',
            duration: 2000,
            color: 'danger'
        });
        await toast.present();
    }
}

function formatRole(role: UserRole): string {
    switch (role) {
        case 'artist': return 'Artist';
        case 'playlist_maker': return 'Playlist Maker';
        case 'admin': return 'Admin';
        default: return 'User';
    }
}

function getRoleBadgeColor(role: UserRole): string {
    switch (role) {
        case 'artist': return 'primary';
        case 'playlist_maker': return 'tertiary';
        case 'admin': return 'danger';
        default: return 'medium';
    }
}

function formatDate(dateStr?: string): string {
    if (!dateStr) return 'N/A';

    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).format(date);
}
</script>

<style scoped>
.error-message {
    color: var(--ion-color-danger);
    font-size: 12px;
    margin: 4px 16px;
}

.filters {
    margin-bottom: 16px;
}

.list-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.status-badge {
    margin-left: 8px;
}

.user-header {
    text-align: center;
    margin-bottom: 24px;
}

.detail-avatar {
    width: 100px;
    height: 100px;
    margin: 0 auto 16px;
}

ion-badge {
    margin-top: 8px;
}
</style>
