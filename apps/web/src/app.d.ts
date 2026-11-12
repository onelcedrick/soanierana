declare global {
  namespace App {
    interface Locals {
      user: { sub: string; churchId: string; role: string; memberId: string | null } | null;
      token: string | null;
    }
    interface PageData {
      user?: App.Locals['user'];
    }
  }
}
export {};
