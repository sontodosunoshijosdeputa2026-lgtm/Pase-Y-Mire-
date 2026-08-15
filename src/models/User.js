export class User {
  constructor(data) {
    this.id = data.id;
    this.email = data.email;
    this.password = data.password;
    this.username = data.username;
    this.role = data.role || 'player'; // super_admin, sub_admin, player
    this.credits = data.credits || 0;
    this.is_active = data.is_active !== false;
    this.created_at = data.created_at || new Date().toISOString();
    this.updated_at = data.updated_at || new Date().toISOString();
  }

  toJSON() {
    const { password, ...userWithoutPassword } = this;
    return userWithoutPassword;
  }
}
