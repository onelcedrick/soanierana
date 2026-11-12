export interface Church { id: string; name: string; city: string; country: string; createdAt?: string; }
export interface Member {
  id: string; churchId: string; firstName: string; lastName: string;
  email: string; phone: string; membershipStatus: string; responsibilityLevel: string;
}
export interface Program { id: string; churchId: string; name: string; frequency: string; }
export interface Poll { id: string; churchId: string; status: string; optionCount: number; title?: string; }

export interface Publication { 
  id: string; 
  title: string; 
  content: string; 
  audience: string; 
  coverImageUrl: string | null; 
  publishedAt: string | null; 
}

export interface AuthResponse { token: string; user: { id: string; churchId: string; email: string; role: string; memberId: string | null } }
