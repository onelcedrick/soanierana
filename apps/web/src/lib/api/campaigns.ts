import { apiFetch } from './client';

export function getActiveCampaign(): Promise<any> {
  return apiFetch('/campaigns/active');
}

export function updateCampaign(input: { 
  churchId: string, title: string, description: string, goalAmount: number, initialAmount: number, coverImageUrl: string | null 
}, token: string): Promise<any> {
  return apiFetch('/campaigns', { method: 'PUT', body: input, token });
}

export function donate(input: { 
  campaignId: string, amount: number, donorName: string, 
  isAnonymous: boolean, paymentMethod: string,
  proofImageUrl?: string, referenceCode?: string
}): Promise<any> {
  return apiFetch('/campaigns/donate', { method: 'POST', body: input });
}

export function getAdminDonations(token: string): Promise<any[]> {
  return apiFetch('/campaigns/donations', { token });
}

export function validateDonation(id: string, token: string): Promise<void> {
  return apiFetch(`/campaigns/donations/${id}/validate`, { method: 'PATCH', token });
}
