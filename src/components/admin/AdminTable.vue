<template>
  <div class="admin-table-container">
    <div class="table-header">
      <h2>{{ title }}</h2>
      <div class="table-actions" v-if="$slots.actions">
        <slot name="actions"></slot>
      </div>
    </div>

    <v-data-table :headers="vuetifyHeaders" :items="rows" :loading="loading" :search="search"
      :items-per-page="itemsPerPage" :items-per-page-options="itemsPerPageOptions" :show-current-page="true"
      class="admin-data-table" hover>
      <!-- Search slot -->
      <template v-slot:top>
        <div class="table-controls" v-if="searchEnabled">
          <v-text-field v-model="search" :placeholder="`Search ${title.toLowerCase()}...`"
            prepend-inner-icon="mdi-magnify" variant="outlined" hide-details clearable
            class="search-field"></v-text-field>
        </div>
      </template> <!-- Custom column slots -->
      <template v-for="(column, index) in columns" :key="column.field" v-slot:[`item.${column.field}`]="{ item }">
        <slot name="table-row" :row="item" :column="column" :value="(item as any)[column.field]" :formattedRow="item">
          {{ formatCellValue((item as any)[column.field], column) }}
        </slot>
      </template>

      <!-- Empty state -->
      <template v-slot:no-data>
        <div class="empty-state">
          <ion-icon :icon="folderOpenIcon" class="empty-icon"></ion-icon>
          <h3>No {{ title.toLowerCase() }} found</h3>
          <p>{{ emptyMessage || `There are no ${title.toLowerCase()} to display.` }}</p>
        </div>
      </template>

      <!-- Loading state -->
      <template v-slot:loading>
        <div class="loading-state">
          <ion-spinner name="crescent"></ion-spinner>
          <p>Loading {{ title.toLowerCase() }}...</p>
        </div>
      </template>
    </v-data-table>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, computed, ref } from 'vue';
import { IonIcon, IonSpinner } from '@ionic/vue';
import { folderOpen } from 'ionicons/icons';
import type { Column } from '@/types/admin';

interface VuetifyHeader {
  title: string;
  key: string;
  sortable?: boolean;
  width?: string;
  align?: 'start' | 'center' | 'end';
}

export default defineComponent({
  name: 'AdminTable',
  components: {
    IonIcon,
    IonSpinner
  },
  props: {
    title: {
      type: String,
      required: true
    },
    columns: {
      type: Array as PropType<Column[]>,
      required: true
    },
    rows: {
      type: Array,
      required: true
    },
    loading: {
      type: Boolean,
      default: false
    },
    emptyMessage: {
      type: String,
      default: ''
    },
    searchEnabled: {
      type: Boolean,
      default: true
    },
    paginationEnabled: {
      type: Boolean,
      default: true
    },
    perPage: {
      type: Number,
      default: 25
    }
  },
  setup(props) {
    const search = ref('');
    const itemsPerPage = ref(props.perPage);
    const itemsPerPageOptions = [
      { value: 10, title: '10' },
      { value: 25, title: '25' },
      { value: 50, title: '50' },
      { value: 100, title: '100' }
    ];

    // Convert columns to Vuetify headers format
    const vuetifyHeaders = computed((): VuetifyHeader[] => {
      return props.columns.map((column: Column) => ({
        title: column.label,
        key: column.field,
        sortable: column.sortable !== false,
        width: column.width,
        align: 'start' as const
      }));
    });

    const formatCellValue = (value: any, column: Column): string => {
      if (value === null || value === undefined) {
        return '';
      }

      switch (column.type) {
        case 'date':
          return new Date(value).toLocaleDateString();
        case 'datetime':
          return new Date(value).toLocaleString();
        case 'boolean':
          return value ? 'Yes' : 'No';
        default:
          return String(value);
      }
    };

    return {
      search,
      itemsPerPage,
      itemsPerPageOptions,
      vuetifyHeaders,
      formatCellValue,
      folderOpenIcon: folderOpen
    };
  }
});
</script>

<style scoped>
.admin-table-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  margin-bottom: 24px;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e5e7eb;
  background: #f8fafc;
}

.table-header h2 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: #1f2937;
}

.table-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

.table-controls {
  padding: 16px 24px;
  border-bottom: 1px solid #e5e7eb;
  background: #fafbfc;
}

.search-field {
  max-width: 400px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  text-align: center;
}

.empty-icon {
  font-size: 3rem;
  color: #9ca3af;
  margin-bottom: 16px;
}

.empty-state h3 {
  margin: 0 0 8px 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #374151;
}

.empty-state p {
  margin: 0;
  color: #6b7280;
  font-size: 0.95rem;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  text-align: center;
}

.loading-state p {
  margin-top: 16px;
  color: #6b7280;
  font-size: 0.95rem;
}

/* Vuetify Data Table customizations */
:deep(.v-data-table) {
  border: none !important;
}

:deep(.v-data-table__thead) {
  background: #f1f5f9 !important;
}

:deep(.v-data-table-header__content) {
  color: #374151 !important;
  font-weight: 600 !important;
  font-size: 0.875rem !important;
  text-transform: uppercase !important;
  letter-spacing: 0.05em !important;
}

:deep(.v-data-table__tr:hover) {
  background-color: #f8fafc !important;
}

:deep(.v-data-table__td) {
  padding: 16px 12px !important;
  border-bottom: 1px solid #f3f4f6 !important;
  font-size: 0.9rem !important;
}

:deep(.v-data-table__th) {
  padding: 16px 12px !important;
  border-bottom: 2px solid #e5e7eb !important;
}

/* Pagination styling */
:deep(.v-data-table-footer) {
  padding: 16px 24px !important;
  border-top: 1px solid #e5e7eb !important;
  background: #fafbfc !important;
}

:deep(.v-btn--variant-text) {
  color: #374151 !important;
}

:deep(.v-btn--variant-text:hover) {
  background-color: #f3f4f6 !important;
}

:deep(.v-btn--variant-text.v-btn--active) {
  background-color: #3b82f6 !important;
  color: white !important;
}

/* Mobile responsiveness */
@media (max-width: 768px) {
  .table-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
    padding: 16px 20px;
  }

  .table-header h2 {
    font-size: 1.25rem;
  }

  .table-actions {
    width: 100%;
    justify-content: flex-end;
  }

  .table-controls {
    padding: 16px 20px;
  }

  .search-field {
    max-width: 100%;
  }

  :deep(.v-data-table__td),
  :deep(.v-data-table__th) {
    padding: 12px 8px !important;
    font-size: 0.8rem !important;
  }

  :deep(.v-data-table-footer) {
    padding: 16px 20px !important;
  }
}
</style>
