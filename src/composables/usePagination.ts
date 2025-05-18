import { ref, onMounted, watch } from 'vue';

export function usePagination(totalItemsRef: any = ref(0), defaultItemsPerPage = 10) {
  const currentPage = ref(1);
  const itemsPerPage = ref(defaultItemsPerPage);
  const totalPages = ref(0);

  // Calculate skip value for API pagination
  const skip = ref(0);

  // Calculate total pages
  const calculateTotalPages = () => {
    totalPages.value = Math.ceil(totalItemsRef.value / itemsPerPage.value) || 1;
  };

  // Handle page change
  const changePage = (page: number) => {
    if (page < 1) page = 1;
    if (page > totalPages.value) page = totalPages.value;
    
    currentPage.value = page;
    skip.value = (page - 1) * itemsPerPage.value;
  };

  // Go to previous page
  const prevPage = () => {
    changePage(currentPage.value - 1);
  };

  // Go to next page
  const nextPage = () => {
    changePage(currentPage.value + 1);
  };

  // Change items per page
  const changeItemsPerPage = (count: number) => {
    itemsPerPage.value = count;
    changePage(1); // Reset to first page when changing items per page
  };

  // Watch totalItems for changes
  watch(totalItemsRef, () => {
    calculateTotalPages();
    
    // If currentPage is now invalid (greater than totalPages), adjust it
    if (currentPage.value > totalPages.value) {
      changePage(totalPages.value);
    }
  });

  // Initialize total pages on mount
  onMounted(() => {
    calculateTotalPages();
  });

  return {
    currentPage,
    itemsPerPage,
    totalPages,
    skip,
    changePage,
    prevPage,
    nextPage,
    changeItemsPerPage
  };
}
