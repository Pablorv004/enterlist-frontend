<template>
  <div class="admin-users">
    <AdminSidePanel />
    <div class="admin-content">
      <div class="admin-header">
        <h1>User Management</h1>
        <p>Manage all users in the system</p>
      </div>

      <div class="admin-table-container">
        <div class="table-controls">
          <ion-searchbar
            v-model="searchQuery"
            placeholder="Search users..."
            @ionInput="handleSearch"
            show-clear-button="focus"
          />
          <ion-select
            v-model="roleFilter"
            placeholder="Filter by role"
            @ionChange="handleRoleFilter"
          >
            <ion-select-option value="">All Roles</ion-select-option>
            <ion-select-option value="artist">Artist</ion-select-option>
            <ion-select-option value="playlist_maker">Playlist Maker</ion-select-option>
            <ion-select-option value="admin">Admin</ion-select-option>
          </ion-select>
        </div>

        <div class="table-wrapper" v-if="!loading">
          <table class="admin-table">
            <thead>
              <tr>
                <th @click="handleSort('id')">
                  ID
                  <ion-icon :icon="getArrowIcon('id')" v-if="sortColumn === 'id'" />
                </th>
                <th @click="handleSort('email')">
                  Email
                  <ion-icon :icon="getArrowIcon('email')" v-if="sortColumn === 'email'" />
                </th>
                <th @click="handleSort('firstName')">
                  First Name
                  <ion-icon :icon="getArrowIcon('firstName')" v-if="sortColumn === 'firstName'" />
                </th>
                <th @click="handleSort('lastName')">
                  Last Name
                  <ion-icon :icon="getArrowIcon('lastName')" v-if="sortColumn === 'lastName'" />
                </th>
                <th @click="handleSort('role')">
                  Role
                  <ion-icon :icon="getArrowIcon('role')" v-if="sortColumn === 'role'" />
                </th>
                <th @click="handleSort('isEmailConfirmed')">
                  Email Confirmed
                  <ion-icon :icon="getArrowIcon('isEmailConfirmed')" v-if="sortColumn === 'isEmailConfirmed'" />
                </th>
                <th @click="handleSort('createdAt')">
                  Created At
                  <ion-icon :icon="getArrowIcon('createdAt')" v-if="sortColumn === 'createdAt'" />
                </th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="user in paginatedUsers" :key="user.id">
                <td>{{ user.id }}</td>
                <td>{{ user.email }}</td>
                <td>{{ user.firstName }}</td>
                <td>{{ user.lastName }}</td>
                <td>
                  <span class="role-badge" :class="user.role">
                    {{ formatRole(user.role) }}
                  </span>
                </td>
                <td>
                  <ion-icon 
                    :icon="user.isEmailConfirmed ? checkmarkCircle : closeCircle"
                    :color="user.isEmailConfirmed ? 'success' : 'danger'"
                  />
                </td>
                <td>{{ formatDate(user.createdAt) }}</td>
                <td>
                  <div class="action-buttons">
                    <ion-button
                      fill="clear"
                      size="small"
                      @click="viewUser(user)"
                      title="View User"
                    >
                      <ion-icon :icon="eye" />
                    </ion-button>
                    <ion-button
                      fill="clear"
                      size="small"
                      @click="editUser(user)"
                      title="Edit User"
                    >
                      <ion-icon :icon="create" />
                    </ion-button>
                    <ion-button
                      fill="clear"
                      size="small"
                      color="danger"
                      @click="deleteUser(user)"
                      title="Delete User"
                    >
                      <ion-icon :icon="trash" />
                    </ion-button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-if="loading" class="loading-container">
          <ion-spinner name="circular" />
          <p>Loading users...</p>
        </div>

        <div v-if="error" class="error-container">
          <ion-icon :icon="alertCircle" color="danger" />
          <p>{{ error }}</p>
          <ion-button @click="loadUsers" fill="outline">Retry</ion-button>
        </div>

        <!-- Pagination -->
        <div class="pagination" v-if="!loading && filteredUsers.length > 0">
          <ion-button
            fill="outline"
            :disabled="currentPage === 1"
            @click="goToPage(currentPage - 1)"
          >
            <ion-icon :icon="chevronBack" />
            Previous
          </ion-button>
          
          <span class="pagination-info">
            Page {{ currentPage }} of {{ totalPages }} 
            ({{ filteredUsers.length }} total users)
          </span>
          
          <ion-button
            fill="outline"
            :disabled="currentPage === totalPages"
            @click="goToPage(currentPage + 1)"
          >
            Next
            <ion-icon :icon="chevronForward" />
          </ion-button>
        </div>
      </div>
    </div>

    <!-- User Detail Modal -->
    <ion-modal :is-open="isModalOpen" @did-dismiss="closeModal">
      <ion-header>
        <ion-toolbar>
          <ion-title>{{ modalMode === 'view' ? 'User Details' : 'Edit User' }}</ion-title>
          <ion-buttons slot="end">
            <ion-button @click="closeModal">Close</ion-button>
          </ion-buttons>
        </ion-toolbar>
      </ion-header>
      <ion-content class="ion-padding">
        <div v-if="selectedUser">
          <div class="user-detail-section">
            <h3>Basic Information</h3>
            <ion-item>
              <ion-label position="stacked">Email</ion-label>
              <ion-input
                v-model="selectedUser.email"
                :readonly="modalMode === 'view'"
              />
            </ion-item>
            <ion-item>
              <ion-label position="stacked">First Name</ion-label>
              <ion-input
                v-model="selectedUser.firstName"
                :readonly="modalMode === 'view'"
              />
            </ion-item>
            <ion-item>
              <ion-label position="stacked">Last Name</ion-label>
              <ion-input
                v-model="selectedUser.lastName"
                :readonly="modalMode === 'view'"
              />
            </ion-item>
            <ion-item>
              <ion-label position="stacked">Role</ion-label>
              <ion-select
                v-model="selectedUser.role"
                :disabled="modalMode === 'view'"
              >
                <ion-select-option value="artist">Artist</ion-select-option>
                <ion-select-option value="playlist_maker">Playlist Maker</ion-select-option>
                <ion-select-option value="admin">Admin</ion-select-option>
              </ion-select>
            </ion-item>
          </div>

          <div class="user-detail-section" v-if="modalMode === 'edit'">
            <ion-button
              expand="block"
              @click="saveUser"
              :disabled="saving"
            >
              <ion-spinner v-if="saving" name="circular" />
              {{ saving ? 'Saving...' : 'Save Changes' }}
            </ion-button>
          </div>
        </div>
      </ion-content>
    </ion-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import {
  IonSearchbar,
  IonSelect,
  IonSelectOption,
  IonButton,
  IonIcon,
  IonSpinner,
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonContent,
  IonItem,
  IonLabel,
  IonInput,
  alertController
} from '@ionic/vue';
import {
  eye,
  create,
  trash,
  chevronBack,
  chevronForward,
  arrowUp,
  arrowDown,
  checkmarkCircle,
  closeCircle,
  alertCircle
} from 'ionicons/icons';
import AdminSidePanel from '@/components/admin/AdminSidePanel.vue';
import { AdminService } from '@/services/AdminService';

interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isEmailConfirmed: boolean;
  createdAt: string;
}

// Reactive data
const users = ref<User[]>([]);
const loading = ref(true);
const error = ref('');
const searchQuery = ref('');
const roleFilter = ref('');
const currentPage = ref(1);
const itemsPerPage = 10;
const sortColumn = ref('id');
const sortDirection = ref<'asc' | 'desc'>('desc');

// Modal state
const isModalOpen = ref(false);
const modalMode = ref<'view' | 'edit'>('view');
const selectedUser = ref<User | null>(null);
const saving = ref(false);

// Computed properties
const filteredUsers = computed(() => {
  // Ensure users.value is an array before processing
  if (!Array.isArray(users.value)) {
    return [];
  }
  
  let filtered = [...users.value];

  // Apply search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(user =>
      user.email.toLowerCase().includes(query) ||
      user.firstName.toLowerCase().includes(query) ||
      user.lastName.toLowerCase().includes(query)
    );
  }

  // Apply role filter
  if (roleFilter.value) {
    filtered = filtered.filter(user => user.role === roleFilter.value);
  }
  // Apply sorting
  filtered.sort((a, b) => {
    const aVal = a[sortColumn.value as keyof User];
    const bVal = b[sortColumn.value as keyof User];
    
    // Handle undefined values
    if (aVal === undefined && bVal === undefined) return 0;
    if (aVal === undefined) return 1;
    if (bVal === undefined) return -1;
    
    let comparison = 0;
    if (aVal < bVal) comparison = -1;
    if (aVal > bVal) comparison = 1;
    
    return sortDirection.value === 'desc' ? -comparison : comparison;
  });

  return filtered;
});

const totalPages = computed(() => Math.ceil(filteredUsers.value.length / itemsPerPage));

const paginatedUsers = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return filteredUsers.value.slice(start, end);
});

// Methods
const loadUsers = async () => {
  try {
    loading.value = true;
    error.value = '';
    users.value = await AdminService.getUsers();
  } catch (err) {
    error.value = 'Failed to load users';
    console.error('Error loading users:', err);
  } finally {
    loading.value = false;
  }
};

const handleSearch = () => {
  currentPage.value = 1; // Reset to first page when searching
};

const handleRoleFilter = () => {
  currentPage.value = 1; // Reset to first page when filtering
};

const handleSort = (column: string) => {
  if (sortColumn.value === column) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortColumn.value = column;
    sortDirection.value = 'asc';
  }
  currentPage.value = 1; // Reset to first page when sorting
};

const getArrowIcon = (column: string) => {
  if (sortColumn.value === column) {
    return sortDirection.value === 'asc' ? arrowUp : arrowDown;
  }
  return undefined;
};

const goToPage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
  }
};

const viewUser = (user: User) => {
  selectedUser.value = { ...user };
  modalMode.value = 'view';
  isModalOpen.value = true;
};

const editUser = (user: User) => {
  selectedUser.value = { ...user };
  modalMode.value = 'edit';
  isModalOpen.value = true;
};

const saveUser = async () => {
  if (!selectedUser.value) return;

  try {
    saving.value = true;
    await AdminService.updateUser(selectedUser.value.id, {
      email: selectedUser.value.email,
      firstName: selectedUser.value.firstName,
      lastName: selectedUser.value.lastName,
      role: selectedUser.value.role
    });
    
    // Update local data
    const index = users.value.findIndex(u => u.id === selectedUser.value!.id);
    if (index !== -1) {
      users.value[index] = { ...selectedUser.value };
    }
    
    closeModal();
  } catch (err) {
    console.error('Error saving user:', err);
    // Handle error
  } finally {
    saving.value = false;
  }
};

const deleteUser = async (user: User) => {
  const alert = await alertController.create({
    header: 'Confirm Deletion',
    message: `Are you sure you want to delete user "${user.firstName} ${user.lastName}"? This action cannot be undone.`,
    buttons: [
      {
        text: 'Cancel',
        role: 'cancel'
      },
      {
        text: 'Delete',
        role: 'destructive',
        handler: async () => {
          try {
            await AdminService.deleteUser(user.id);
            users.value = users.value.filter(u => u.id !== user.id);
          } catch (err) {
            console.error('Error deleting user:', err);
          }
        }
      }
    ]
  });

  await alert.present();
};

const closeModal = () => {
  isModalOpen.value = false;
  selectedUser.value = null;
  modalMode.value = 'view';
  saving.value = false;
};

const formatRole = (role: string) => {
  return role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString();
};

// Lifecycle
onMounted(() => {
  loadUsers();
});
</script>

<style scoped>
.admin-users {
  display: flex;
  height: 100vh;
}

.admin-content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

.admin-header {
  margin-bottom: 30px;
}

.admin-header h1 {
  margin: 0 0 5px 0;
  color: var(--ion-color-primary);
}

.admin-header p {
  margin: 0;
  color: var(--ion-color-medium);
}

.admin-table-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.table-controls {
  display: flex;
  gap: 16px;
  padding: 20px;
  border-bottom: 1px solid var(--ion-color-light);
}

.table-controls ion-searchbar {
  flex: 1;
}

.table-controls ion-select {
  min-width: 150px;
}

.table-wrapper {
  overflow-x: auto;
}

.admin-table {
  width: 100%;
  border-collapse: collapse;
}

.admin-table th {
  background-color: var(--ion-color-light);
  padding: 16px 12px;
  text-align: left;
  font-weight: 600;
  cursor: pointer;
  user-select: none;
  white-space: nowrap;
}

.admin-table th:hover {
  background-color: var(--ion-color-light-shade);
}

.admin-table td {
  padding: 16px 12px;
  border-bottom: 1px solid var(--ion-color-light);
}

.role-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.8em;
  font-weight: 500;
  text-transform: uppercase;
}

.role-badge.artist {
  background-color: var(--ion-color-primary-tint);
  color: var(--ion-color-primary);
}

.role-badge.playlist_maker {
  background-color: var(--ion-color-secondary-tint);
  color: var(--ion-color-secondary);
}

.role-badge.admin {
  background-color: var(--ion-color-tertiary-tint);
  color: var(--ion-color-tertiary);
}

.action-buttons {
  display: flex;
  gap: 4px;
}

.loading-container,
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px;
  color: var(--ion-color-medium);
}

.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-top: 1px solid var(--ion-color-light);
}

.pagination-info {
  color: var(--ion-color-medium);
  font-size: 0.9em;
}

.user-detail-section {
  margin-bottom: 24px;
}

.user-detail-section h3 {
  margin: 0 0 16px 0;
  color: var(--ion-color-primary);
}
</style>
