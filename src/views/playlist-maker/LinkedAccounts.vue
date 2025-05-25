<template>
    <linked-accounts-component user-type="playlist_maker" />
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import LinkedAccountsComponent from '@/components/LinkedAccountsComponent.vue';

export default defineComponent({
    name: 'PlaylistMakerLinkedAccounts',
    components: {
        LinkedAccountsComponent
    }
});
</script>
