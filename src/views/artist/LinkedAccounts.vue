<template>
    <linked-accounts-component user-type="artist" />
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import LinkedAccountsComponent from '@/components/LinkedAccountsComponent.vue';

export default defineComponent({
    name: 'ArtistLinkedAccounts',
    components: {
        LinkedAccountsComponent
    }
});
</script>
