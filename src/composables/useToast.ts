import { toastController } from '@ionic/vue';

export function useToast() {
    const showToast = async (
        message: string,
        color: 'success' | 'warning' | 'danger' | 'primary' = 'primary',
        duration: number = 2000
    ) => {
        const toast = await toastController.create({
            message,
            color,
            duration,
            position: 'bottom'
        });

        await toast.present();
    };

    return { showToast };
}