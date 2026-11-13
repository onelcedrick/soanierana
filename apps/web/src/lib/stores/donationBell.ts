import { writable } from 'svelte/store';
import { browser } from '$app/environment';

// Cette fonction ne s'exécute qu'UNE SEULE FOIS au chargement de la page
function createDonationBell() {
    let initialVisible = true;

    if (browser) {
        // Détecter si la page a été rafraîchie (F5)
        const navEntry = performance.getEntriesByType("navigation")[0];
        const isReload = navEntry && (navEntry as PerformanceNavigationTiming).type === "reload";

        if (isReload) {
            // Si c'est un F5, on efface la mémoire et on affiche la cloche
            sessionStorage.removeItem('hide_donation_bell');
            initialVisible = true;
        } else {
            // Sinon, on regarde si elle a déjà été cliquée
            initialVisible = sessionStorage.getItem('hide_donation_bell') !== 'true';
        }
    }

    const { subscribe, set } = writable(initialVisible);

    return {
        subscribe,
        hide: () => {
            set(false);
            if (browser) {
                sessionStorage.setItem('hide_donation_bell', 'true');
            }
        }
    };
}

export const donationBell = createDonationBell();
