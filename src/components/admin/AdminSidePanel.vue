<template>
    <div class="admin-side-panel">
        <div class="panel-header">
            <div class="logo-section">
                <ion-icon :icon="shieldCheckmarkIcon" class="admin-logo"></ion-icon>
                <h2>Admin Panel</h2>
            </div>
        </div>

        <div class="panel-content">
            <nav class="admin-nav">
                <ul class="nav-list">
                    <li class="nav-item">
                        <router-link to="/admin/dashboard" class="nav-link"
                            :class="{ active: activeTab === 'dashboard' }">
                            <ion-icon :icon="statsChartIcon" class="nav-icon"></ion-icon>
                            <span class="nav-text">Dashboard</span>
                        </router-link>
                    </li>

                    <li class="nav-item">
                        <router-link to="/admin/users" class="nav-link" :class="{ active: activeTab === 'users' }">
                            <ion-icon :icon="peopleIcon" class="nav-icon"></ion-icon>
                            <span class="nav-text">User RUD</span>
                        </router-link>
                    </li>

                    <li class="nav-item">
                        <router-link to="/admin/playlists" class="nav-link"
                            :class="{ active: activeTab === 'playlists' }">
                            <ion-icon :icon="listIcon" class="nav-icon"></ion-icon>
                            <span class="nav-text">Playlist RUD</span>
                        </router-link>
                    </li>

                    <li class="nav-item">
                        <router-link to="/admin/songs" class="nav-link" :class="{ active: activeTab === 'songs' }">
                            <ion-icon :icon="musicalNotesIcon" class="nav-icon"></ion-icon>
                            <span class="nav-text">Song RUD</span>
                        </router-link>
                    </li>

                    <li class="nav-item">
                        <router-link to="/admin/withdrawals" class="nav-link"
                            :class="{ active: activeTab === 'withdrawals' }">
                            <ion-icon :icon="cashIcon" class="nav-icon"></ion-icon>
                            <span class="nav-text">Withdrawal RUD</span>
                        </router-link>
                    </li>

                    <li class="nav-item">
                        <router-link to="/admin/transactions" class="nav-link"
                            :class="{ active: activeTab === 'transactions' }">
                            <ion-icon :icon="cardIcon" class="nav-icon"></ion-icon>
                            <span class="nav-text">Transaction RUD</span>
                        </router-link>
                    </li>
                    <li class="nav-item">
                        <router-link to="/admin/submissions" class="nav-link"
                            :class="{ active: activeTab === 'submissions' }">
                            <ion-icon :icon="documentTextIcon" class="nav-icon"></ion-icon>
                            <span class="nav-text">Submission RUD</span>
                        </router-link>
                    </li>                    <li class="nav-item">
                        <router-link to="/admin/actions" class="nav-link" :class="{ active: activeTab === 'actions' }">
                            <ion-icon :icon="clipboardIcon" class="nav-icon"></ion-icon>
                            <span class="nav-text">Admin Actions</span>
                        </router-link>
                    </li>

                    <li class="nav-item">
                        <router-link to="/admin/linked-accounts" class="nav-link" :class="{ active: activeTab === 'linked-accounts' }">
                            <ion-icon :icon="linkIcon" class="nav-icon"></ion-icon>
                            <span class="nav-text">Linked Accounts RUD</span>
                        </router-link>
                    </li>

                    <li class="nav-item">
                        <router-link to="/admin/payment-methods" class="nav-link" :class="{ active: activeTab === 'payment-methods' }">
                            <ion-icon :icon="walletIcon" class="nav-icon"></ion-icon>
                            <span class="nav-text">Payment Methods RUD</span>
                        </router-link>
                    </li>
                </ul>
            </nav>
        </div>
        <div class="panel-footer">
            <button class="user-info logout-button" @click="handleLogout">
                <ion-icon :icon="personCircleIcon" class="user-avatar"></ion-icon>
                <div class="user-details">
                    <div class="username">{{ user?.username }}</div>
                    <div class="user-role">Administrator</div>
                </div>
                <ion-icon :icon="logOutIcon" class="logout-icon"></ion-icon>
            </button>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';
import { IonIcon } from '@ionic/vue';
import {
    shieldCheckmark, statsChart, people, list, musicalNotes, cash, card,
    documentText, globe, clipboard, personCircle, logOut, link, wallet
} from 'ionicons/icons';
import { useAuthStore } from '@/store/auth';
import { useRouter } from 'vue-router';
import { alertController } from '@ionic/vue';

export default defineComponent({
    name: 'AdminSidePanel',
    components: {
        IonIcon
    },
    props: {
        activeTab: {
            type: String,
            required: false,
            default: ''
        }
    }, setup() {
        const authStore = useAuthStore();
        const router = useRouter();
        const user = computed(() => authStore.user);

        const handleLogout = async () => {
            const alert = await alertController.create({
                header: 'Logout',
                message: 'Are you sure you want to logout?',
                buttons: [
                    {
                        text: 'Cancel',
                        role: 'cancel'
                    },
                    {
                        text: 'Logout',
                        role: 'destructive',
                        handler: async () => {
                            await authStore.logout();
                            router.replace('/login');
                        }
                    }
                ]
            });
            await alert.present();
        };        return {
            user,
            handleLogout,
            // Icons
            shieldCheckmarkIcon: shieldCheckmark,
            statsChartIcon: statsChart,
            peopleIcon: people,
            listIcon: list,
            musicalNotesIcon: musicalNotes,
            cashIcon: cash,
            cardIcon: card,
            documentTextIcon: documentText,
            globeIcon: globe,
            clipboardIcon: clipboard,
            linkIcon: link,
            walletIcon: wallet,
            personCircleIcon: personCircle,
            logOutIcon: logOut
        };
    }
});
</script>

<style scoped>
.admin-side-panel {
    width: 260px;
    min-width: 260px;
    background: linear-gradient(180deg, #2c3e50 0%, #34495e 100%);
    color: white;
    display: flex;
    flex-direction: column;
    box-shadow: 2px 0 8px rgba(0, 0, 0, 0.15);
    position: relative;
    z-index: 100;
}

.panel-header {
    padding: 24px 20px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.logo-section {
    display: flex;
    align-items: center;
    gap: 12px;
}

.admin-logo {
    font-size: 2rem;
    color: #3498db;
}

.logo-section h2 {
    margin: 0;
    font-size: 1.3rem;
    font-weight: 600;
    color: white;
}

.panel-content {
    flex: 1;
    padding: 16px 0;
    overflow-y: auto;
}

.admin-nav {
    width: 100%;
}

.nav-list {
    list-style: none;
    margin: 0;
    padding: 0;
}

.nav-item {
    margin-bottom: 4px;
}

.nav-link {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 14px 20px;
    color: rgba(255, 255, 255, 0.8);
    text-decoration: none;
    transition: all 0.2s ease;
    border-left: 3px solid transparent;
    position: relative;
}

.nav-link:hover {
    background: rgba(255, 255, 255, 0.1);
    color: white;
    border-left-color: #3498db;
}

.nav-link.active {
    background: rgba(52, 152, 219, 0.2);
    color: white;
    border-left-color: #3498db;
    font-weight: 600;
}

.nav-link.active::before {
    content: '';
    position: absolute;
    right: 0;
    top: 0;
    bottom: 0;
    width: 3px;
    background: #3498db;
}

.nav-icon {
    font-size: 1.2rem;
    min-width: 20px;
}

.nav-text {
    font-size: 0.95rem;
    font-weight: 500;
}

.panel-footer {
    padding: 20px;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    background: rgba(0, 0, 0, 0.1);
}

.logout-button {
    width: 100%;
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;
    transition: all 0.2s ease;
    border-radius: 8px;
}

.logout-button:hover {
    background: rgba(255, 255, 255, 0.1);
}

.user-info {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 8px;
}

.user-avatar {
    font-size: 2rem;
    color: #3498db;
}

.user-details {
    flex: 1;
}

.logout-icon {
    font-size: 1.2rem;
    color: rgba(255, 255, 255, 0.7);
    transition: color 0.2s ease;
}

.logout-button:hover .logout-icon {
    color: #e74c3c;
}

.username {
    font-size: 0.9rem;
    font-weight: 600;
    color: white;
    margin-bottom: 2px;
}

.user-role {
    font-size: 0.8rem;
    color: rgba(255, 255, 255, 0.7);
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

/* Mobile responsive */
@media (max-width: 768px) {
    .admin-side-panel {
        width: 100%;
        min-width: unset;
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        height: auto;
        flex-direction: row;
        z-index: 1000;
    }

    .panel-header {
        padding: 12px 16px;
        border-bottom: none;
        border-right: 1px solid rgba(255, 255, 255, 0.1);
    }

    .logo-section h2 {
        font-size: 1.1rem;
    }

    .admin-logo {
        font-size: 1.5rem;
    }

    .panel-content {
        flex: 1;
        padding: 0;
        overflow-x: auto;
        overflow-y: hidden;
    }

    .nav-list {
        display: flex;
        gap: 4px;
        padding: 12px 16px;
    }

    .nav-item {
        margin-bottom: 0;
        white-space: nowrap;
    }

    .nav-link {
        padding: 8px 12px;
        border-left: none;
        border-bottom: 3px solid transparent;
        border-radius: 6px;
        min-width: fit-content;
    }

    .nav-link:hover,
    .nav-link.active {
        border-left: none;
        border-bottom-color: #3498db;
    }

    .nav-link.active::before {
        display: none;
    }

    .nav-text {
        font-size: 0.85rem;
    }

    .panel-footer {
        padding: 12px 16px;
        border-top: none;
        border-left: 1px solid rgba(255, 255, 255, 0.1);
    }

    .user-details {
        display: none;
    }
}

/* Hide text on very small screens */
@media (max-width: 480px) {
    .nav-text {
        display: none;
    }

    .nav-link {
        padding: 8px;
        justify-content: center;
    }
}
</style>
