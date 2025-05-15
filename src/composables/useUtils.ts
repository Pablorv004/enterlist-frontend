import { ref, onMounted, onUnmounted } from 'vue';

// Composable to handle loading states and errors for API calls
export function useApiStatus() {
    const loading = ref(false);
    const error = ref<string | null>(null);

    function startLoading() {
        loading.value = true;
        error.value = null;
    }

    function stopLoading() {
        loading.value = false;
    }

    function setError(message: string) {
        error.value = message;
    }

    function clearError() {
        error.value = null;
    }

    return {
        loading,
        error,
        startLoading,
        stopLoading,
        setError,
        clearError
    };
}

// Composable to handle pagination
export function usePagination(defaultSize = 10) {
    const page = ref(1);
    const pageSize = ref(defaultSize);
    const total = ref(0);

    const skip = ref(0);

    function goToPage(newPage: number) {
        page.value = newPage;
        skip.value = (page.value - 1) * pageSize.value;
    }

    function setPageSize(size: number) {
        pageSize.value = size;
        goToPage(1); // Reset to first page when changing page size
    }

    function setTotal(totalItems: number) {
        total.value = totalItems;
    }

    const totalPages = ref(0);

    function updateTotalPages() {
        totalPages.value = Math.ceil(total.value / pageSize.value);
    }

    return {
        page,
        pageSize,
        total,
        skip,
        totalPages,
        goToPage,
        setPageSize,
        setTotal,
        updateTotalPages
    };
}

// Composable to handle form validation
export function useFormValidation() {
    const errors = ref<Record<string, string>>({});

    function validateEmail(email: string): boolean {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    function validateRequired(value: any, fieldName: string): boolean {
        if (!value || (typeof value === 'string' && !value.trim())) {
            errors.value[fieldName] = `${fieldName} is required`;
            return false;
        }
        return true;
    }

    function validateMinLength(value: string, fieldName: string, minLength: number): boolean {
        if (value.length < minLength) {
            errors.value[fieldName] = `${fieldName} must be at least ${minLength} characters`;
            return false;
        }
        return true;
    }

    function clearErrors() {
        errors.value = {};
    }

    function setError(fieldName: string, message: string) {
        errors.value[fieldName] = message;
    }

    return {
        errors,
        validateEmail,
        validateRequired,
        validateMinLength,
        clearErrors,
        setError
    };
}

// Composable for screen size detection
export function useScreenSize() {
    const isMobile = ref(false);
    const isTablet = ref(false);
    const isDesktop = ref(false);

    function checkScreenSize() {
        const width = window.innerWidth;
        isMobile.value = width < 768;
        isTablet.value = width >= 768 && width < 1024;
        isDesktop.value = width >= 1024;
    }

    onMounted(() => {
        checkScreenSize();
        window.addEventListener('resize', checkScreenSize);
    });

    onUnmounted(() => {
        window.removeEventListener('resize', checkScreenSize);
    });

    return {
        isMobile,
        isTablet,
        isDesktop
    };
}
