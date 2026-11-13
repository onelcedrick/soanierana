import { PUBLIC_API_URL } from '$env/static/public';

export const API_BASE_URL = PUBLIC_API_URL || `${PUBLIC_API_URL}`;
export const API_ROOT_URL = API_BASE_URL.replace('/api', '');
