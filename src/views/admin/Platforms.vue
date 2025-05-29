<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-title>Platform Management</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <div class="admin-content">
        <AdminSidePanel />
        
        <div class="main-content">
          <div class="page-header">
            <h1>Platform Management</h1>
            <ion-button @click="openCreateModal" color="primary">
              <ion-icon :icon="addIcon" slot="start"></ion-icon>
              Add Platform
            </ion-button>
          </div>

          <!-- Search and filters -->
          <div class="filters-section">
            <ion-searchbar
              v-model="searchTerm"
              placeholder="Search platforms..."
              @ionInput="handleSearch"
              show-clear-button="focus"
            ></ion-searchbar>
          </div>

          <!-- Platforms table -->
          <div class="table-container">
            <ion-card>
              <ion-card-content>
                <div v-if="loading" class="loading-container">
                  <ion-spinner></ion-spinner>
                  <p>Loading platforms...</p>
                </div>

                <div v-else-if="error" class="error-container">
                  <ion-icon :icon="alertCircleIcon" color="danger"></ion-icon>
                  <p>{{ error }}</p>
                  <ion-button @click="loadPlatforms" fill="outline">Retry</ion-button>
                </div>

                <div v-else>
                  <table class="data-table">
                    <thead>
                      <tr>
                        <th @click="sort('platform_id')" class="sortable">
                          ID
                          <ion-icon :icon="getSortIcon('platform_id')" class="sort-icon"></ion-icon>
                        </th>
                        <th @click="sort('name')" class="sortable">
                          Name
                          <ion-icon :icon="getSortIcon('name')" class="sort-icon"></ion-icon>
                        </th>
                        <th @click="sort('display_name')" class="sortable">
                          Display Name
                          <ion-icon :icon="getSortIcon('display_name')" class="sort-icon"></ion-icon>
                        </th>
                        <th @click="sort('icon_url')" class="sortable">
                          Icon
                          <ion-icon :icon="getSortIcon('icon_url')" class="sort-icon"></ion-icon>
                        </th>
                        <th @click="sort('is_active')" class="sortable">
                          Status
                          <ion-icon :icon="getSortIcon('is_active')" class="sort-icon"></ion-icon>
                        </th>
                        <th @click="sort('created_at')" class="sortable">
                          Created
                          <ion-icon :icon="getSortIcon('created_at')" class="sort-icon"></ion-icon>
                        </th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="platform in paginatedPlatforms" :key="platform.platform_id">
                        <td>{{ platform.platform_id }}</td>
                        <td>{{ platform.name }}</td>
                        <td>{{ platform.display_name }}</td>
                        <td>
                          <img v-if="platform.icon_url" :src="platform.icon_url" alt="Platform icon" class="platform-icon">
                          <span v-else>No icon</span>
                        </td>
                        <td>
                          <ion-badge :color="platform.is_active ? 'success' : 'medium'">
                            {{ platform.is_active ? 'Active' : 'Inactive' }}
                          </ion-badge>
                        </td>
                        <td>{{ formatDate(platform.created_at) }}</td>
                        <td>
                          <div class="action-buttons">
                            <ion-button fill="clear" size="small" @click="viewPlatform(platform)" color="primary">
                              <ion-icon :icon="eyeIcon"></ion-icon>
                            </ion-button>
                            <ion-button fill="clear" size="small" @click="editPlatform(platform)" color="warning">
                              <ion-icon :icon="createIcon"></ion-icon>
                            </ion-button>
                            <ion-button fill="clear" size="small" @click="deletePlatform(platform)" color="danger">
                              <ion-icon :icon="trashIcon"></ion-icon>
                            </ion-button>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>

                  <!-- Pagination -->
                  <div class="pagination-container">
                    <div class="pagination-info">
                      Showing {{ ((currentPage - 1) * itemsPerPage) + 1 }} - {{ Math.min(currentPage * itemsPerPage, filteredPlatforms.length) }} of {{ filteredPlatforms.length }} platforms
                    </div>
                    <div class="pagination-controls">
                      <ion-button 
                        fill="outline" 
                        size="small" 
                        @click="currentPage--" 
                        :disabled="currentPage === 1"
                      >
                        Previous
                      </ion-button>
                      <span class="page-indicator">Page {{ currentPage }} of {{ totalPages }}</span>
                      <ion-button 
                        fill="outline" 
                        size="small" 
                        @click="currentPage++" 
                        :disabled="currentPage === totalPages"
                      >
                        Next
                      </ion-button>
                    </div>
                  </div>
                </div>
              </ion-card-content>
            </ion-card>
          </div>
        </div>
      </div>

      <!-- View/Edit/Create Modal -->
      <ion-modal :is-open="modalOpen" @didDismiss="closeModal">
        <ion-header>
          <ion-toolbar>
            <ion-title>{{ modalMode === 'create' ? 'Add Platform' : modalMode === 'edit' ? 'Edit Platform' : 'Platform Details' }}</ion-title>
            <ion-buttons slot="end">
              <ion-button @click="closeModal">
                <ion-icon :icon="closeIcon"></ion-icon>
              </ion-button>
            </ion-buttons>
          </ion-toolbar>
        </ion-header>
        <ion-content class="ion-padding">
          <form @submit.prevent="savePlatform" v-if="modalMode !== 'view'">
            <ion-item>
              <ion-label position="stacked">Name *</ion-label>
              <ion-input v-model="platformForm.name" placeholder="Platform name" required></ion-input>
            </ion-item>
            
            <ion-item>
              <ion-label position="stacked">Display Name *</ion-label>
              <ion-input v-model="platformForm.display_name" placeholder="Display name" required></ion-input>
            </ion-item>
            
            <ion-item>
              <ion-label position="stacked">Icon URL</ion-label>
              <ion-input v-model="platformForm.icon_url" placeholder="https://..."></ion-input>
            </ion-item>
            
            <ion-item>
              <ion-label>Status</ion-label>
              <ion-select v-model="platformForm.is_active">
                <ion-select-option :value="true">Active</ion-select-option>
                <ion-select-option :value="false">Inactive</ion-select-option>
              </ion-select>
            </ion-item>

            <div class="form-actions">
              <ion-button type="submit" color="primary" :disabled="saving">
                <ion-spinner v-if="saving" slot="start"></ion-spinner>
                {{ modalMode === 'create' ? 'Create Platform' : 'Update Platform' }}
              </ion-button>
              <ion-button fill="outline" @click="closeModal">Cancel</ion-button>
            </div>
          </form>

          <!-- View mode -->
          <div v-else class="platform-details">
            <ion-item>
              <ion-label>
                <h3>Platform ID</h3>
                <p>{{ selectedPlatform?.platform_id }}</p>
              </ion-label>
            </ion-item>
            
            <ion-item>
              <ion-label>
                <h3>Name</h3>
                <p>{{ selectedPlatform?.name }}</p>
              </ion-label>
            </ion-item>
            
            <ion-item>
              <ion-label>
                <h3>Display Name</h3>
                <p>{{ selectedPlatform?.display_name }}</p>
              </ion-label>
            </ion-item>
            
            <ion-item>
              <ion-label>
                <h3>Icon</h3>
                <img v-if="selectedPlatform?.icon_url" :src="selectedPlatform.icon_url" alt="Platform icon" class="platform-icon-large">
                <p v-else>No icon</p>
              </ion-label>
            </ion-item>
            
            <ion-item>
              <ion-label>
                <h3>Status</h3>
                <ion-badge :color="selectedPlatform?.is_active ? 'success' : 'medium'">
                  {{ selectedPlatform?.is_active ? 'Active' : 'Inactive' }}
                </ion-badge>
              </ion-label>
            </ion-item>
              <ion-item>
              <ion-label>
                <h3>Created</h3>
                <p>{{ formatDate(selectedPlatform?.created_at || '') }}</p>
              </ion-label>
            </ion-item>
            
            <ion-item>
              <ion-label>
                <h3>Updated</h3>
                <p>{{ formatDate(selectedPlatform?.updated_at || '') }}</p>
              </ion-label>
            </ion-item>
          </div>
        </ion-content>
      </ion-modal>
    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted } from 'vue';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonCard,
  IonCardContent,
  IonButton,
  IonIcon,
  IonSpinner,
  IonSearchbar,
  IonBadge,
  IonModal,
  IonButtons,
  IonItem,
  IonLabel,
  IonInput,
  IonSelect,
  IonSelectOption,
  alertController
} from '@ionic/vue';
import {
  add,
  eye,
  create,
  trash,
  close,
  alertCircle,
  chevronUp,
  chevronDown,
  remove
} from 'ionicons/icons';
import AdminSidePanel from '@/components/admin/AdminSidePanel.vue';
import { AdminService } from '@/services/AdminService';

interface Platform {
  platform_id: number;
  name: string;
  display_name: string;
  icon_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export default defineComponent({
  name: 'AdminPlatforms',
  components: {
    IonPage,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonCard,
    IonCardContent,
    IonButton,
    IonIcon,
    IonSpinner,
    IonSearchbar,
    IonBadge,
    IonModal,
    IonButtons,
    IonItem,
    IonLabel,
    IonInput,
    IonSelect,
    IonSelectOption,
    AdminSidePanel
  },
  setup() {
    const platforms = ref<Platform[]>([]);
    const loading = ref(true);
    const error = ref('');
    const searchTerm = ref('');
    const sortField = ref('platform_id');
    const sortDirection = ref<'asc' | 'desc'>('asc');
    const currentPage = ref(1);
    const itemsPerPage = 10;

    // Modal state
    const modalOpen = ref(false);
    const modalMode = ref<'view' | 'edit' | 'create'>('view');
    const selectedPlatform = ref<Platform | null>(null);
    const saving = ref(false);

    // Form state
    const platformForm = ref({
      name: '',
      display_name: '',
      icon_url: '',
      is_active: true
    });

    const filteredPlatforms = computed(() => {
      let result = platforms.value;

      // Apply search filter
      if (searchTerm.value.trim()) {
        const search = searchTerm.value.toLowerCase();
        result = result.filter(platform =>
          platform.name.toLowerCase().includes(search) ||
          platform.display_name.toLowerCase().includes(search)
        );
      }      // Apply sorting
      result.sort((a, b) => {
        const aVal = a[sortField.value as keyof Platform] ?? '';
        const bVal = b[sortField.value as keyof Platform] ?? '';
        
        let comparison = 0;
        if (aVal < bVal) comparison = -1;
        if (aVal > bVal) comparison = 1;
        
        return sortDirection.value === 'desc' ? -comparison : comparison;
      });

      return result;
    });

    const paginatedPlatforms = computed(() => {
      const start = (currentPage.value - 1) * itemsPerPage;
      const end = start + itemsPerPage;
      return filteredPlatforms.value.slice(start, end);
    });

    const totalPages = computed(() => {
      return Math.ceil(filteredPlatforms.value.length / itemsPerPage);
    });

    const loadPlatforms = async () => {
      try {
        loading.value = true;
        error.value = '';
        platforms.value = await AdminService.getPlatforms();
      } catch (err: any) {
        error.value = err.message || 'Failed to load platforms';
      } finally {
        loading.value = false;
      }
    };

    const handleSearch = () => {
      currentPage.value = 1; // Reset to first page when searching
    };

    const sort = (field: string) => {
      if (sortField.value === field) {
        sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc';
      } else {
        sortField.value = field;
        sortDirection.value = 'asc';
      }
    };

    const getSortIcon = (field: string) => {
      if (sortField.value !== field) return remove;
      return sortDirection.value === 'asc' ? chevronUp : chevronDown;
    };

    const viewPlatform = (platform: Platform) => {
      selectedPlatform.value = platform;
      modalMode.value = 'view';
      modalOpen.value = true;
    };

    const editPlatform = (platform: Platform) => {
      selectedPlatform.value = platform;
      modalMode.value = 'edit';
      platformForm.value = {
        name: platform.name,
        display_name: platform.display_name,
        icon_url: platform.icon_url || '',
        is_active: platform.is_active
      };
      modalOpen.value = true;
    };

    const openCreateModal = () => {
      selectedPlatform.value = null;
      modalMode.value = 'create';
      platformForm.value = {
        name: '',
        display_name: '',
        icon_url: '',
        is_active: true
      };
      modalOpen.value = true;
    };

    const closeModal = () => {
      modalOpen.value = false;
      selectedPlatform.value = null;
      platformForm.value = {
        name: '',
        display_name: '',
        icon_url: '',
        is_active: true
      };
    };

    const savePlatform = async () => {
      try {
        saving.value = true;
        
        if (modalMode.value === 'create') {
          await AdminService.createPlatform(platformForm.value);
        } else {
          await AdminService.updatePlatform(selectedPlatform.value!.platform_id, platformForm.value);
        }
        
        await loadPlatforms();
        closeModal();
      } catch (err: any) {
        error.value = err.message || 'Failed to save platform';
      } finally {
        saving.value = false;
      }
    };

    const deletePlatform = async (platform: Platform) => {
      const alert = await alertController.create({
        header: 'Confirm Delete',
        message: `Are you sure you want to delete platform "${platform.display_name}"?`,
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
                await AdminService.deletePlatform(platform.platform_id);
                await loadPlatforms();
              } catch (err: any) {
                error.value = err.message || 'Failed to delete platform';
              }
            }
          }
        ]
      });
      
      await alert.present();
    };

    const formatDate = (dateString: string) => {
      if (!dateString) return 'N/A';
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    };

    onMounted(() => {
      loadPlatforms();
    });

    return {
      platforms,
      loading,
      error,
      searchTerm,
      currentPage,
      itemsPerPage,
      filteredPlatforms,
      paginatedPlatforms,
      totalPages,
      modalOpen,
      modalMode,
      selectedPlatform,
      platformForm,
      saving,
      loadPlatforms,
      handleSearch,
      sort,
      getSortIcon,
      viewPlatform,
      editPlatform,
      openCreateModal,
      closeModal,
      savePlatform,
      deletePlatform,
      formatDate,
      // Icons
      addIcon: add,
      eyeIcon: eye,
      createIcon: create,
      trashIcon: trash,
      closeIcon: close,
      alertCircleIcon: alertCircle
    };
  }
});
</script>

<style scoped>
.admin-content {
  display: flex;
  height: 100%;
}

.main-content {
  flex: 1;
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-header h1 {
  margin: 0;
  font-size: 28px;
  font-weight: 600;
}

.filters-section {
  margin-bottom: 20px;
}

.table-container {
  width: 100%;
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th,
.data-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid var(--ion-color-light);
}

.data-table th {
  background-color: var(--ion-color-light);
  font-weight: 600;
  position: sticky;
  top: 0;
  z-index: 1;
}

.data-table th.sortable {
  cursor: pointer;
  user-select: none;
  transition: background-color 0.2s;
}

.data-table th.sortable:hover {
  background-color: var(--ion-color-medium);
}

.sort-icon {
  margin-left: 4px;
  font-size: 14px;
}

.action-buttons {
  display: flex;
  gap: 4px;
}

.platform-icon {
  width: 24px;
  height: 24px;
  object-fit: contain;
}

.platform-icon-large {
  width: 64px;
  height: 64px;
  object-fit: contain;
}

.pagination-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
  border-top: 1px solid var(--ion-color-light);
  margin-top: 16px;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 12px;
}

.page-indicator {
  font-size: 14px;
  color: var(--ion-color-medium);
}

.loading-container,
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  text-align: center;
}

.loading-container ion-spinner {
  margin-bottom: 16px;
}

.error-container ion-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.form-actions {
  display: flex;
  gap: 12px;
  margin-top: 20px;
}

.platform-details {
  max-width: 500px;
}

@media (max-width: 768px) {
  .admin-content {
    flex-direction: column;
  }

  .main-content {
    padding: 16px;
  }

  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .page-header h1 {
    font-size: 24px;
  }

  .pagination-container {
    flex-direction: column;
    gap: 12px;
  }

  .data-table {
    font-size: 14px;
  }
  
  .data-table th,
  .data-table td {
    padding: 8px;
  }
}
</style>
