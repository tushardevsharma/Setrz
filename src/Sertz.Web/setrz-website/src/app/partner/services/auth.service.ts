import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, BehaviorSubject, from } from 'rxjs';
import { map, catchError } from 'rxjs/operators'; // Import RxJS operators
import { createClient, SupabaseClient, User, AuthChangeEvent, Session } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment'; // Corrected path

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private supabase: SupabaseClient;
  private _isAuthenticated = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this._isAuthenticated.asObservable();
  private authToken: string | null = null;

  constructor(private http: HttpClient) {
    const supabaseUrl = environment.supabaseUrl;
    const supabaseAnonKey = environment.supabaseAnonKey;

    console.log('AuthService: Initializing Supabase client...');
    console.log('AuthService: Supabase URL:', supabaseUrl ? 'Provided' : 'MISSING');
    console.log('AuthService: Supabase Anon Key:', supabaseAnonKey ? 'Provided' : 'MISSING');

    if (!supabaseUrl || !supabaseAnonKey || supabaseUrl === 'YOUR_SUPABASE_URL' || supabaseAnonKey === 'YOUR_SUPABASE_ANON_KEY') {
      console.error('AuthService: Supabase credentials are not configured. Please update src/environments/environment.ts');
      this._isAuthenticated.next(false);
      // Initialize with a dummy client to satisfy TypeScript, though it won't be functional
      this.supabase = createClient('http://dummy.url', 'dummy_key');
      return;
    }

    this.supabase = createClient(supabaseUrl, supabaseAnonKey);

    this.supabase.auth.onAuthStateChange((event: AuthChangeEvent, session: Session | null) => {
      console.log('AuthService: Auth state change event:', event);
      console.log('AuthService: Session:', session);
      if (session) {
        this.authToken = session.access_token;
        this._isAuthenticated.next(true);
      } else {
        this.authToken = null;
        this._isAuthenticated.next(false);
      }
    });

    // Check initial auth state
    from(this.supabase.auth.getSession()).subscribe(
      ({ data: { session } }) => {
        console.log('AuthService: Initial getSession result:', session);
        if (session) {
          this.authToken = session.access_token;
          this._isAuthenticated.next(true);
        } else {
          this.authToken = null;
          this._isAuthenticated.next(false);
        }
      },
      (error) => {
        console.error('AuthService: Error getting initial session:', error);
        this._isAuthenticated.next(false);
      }
    );
  }

  async login(credentials: { email: string; password: string }): Promise<{ success: boolean; error: string | null }> {
    console.log('AuthService: Attempting login for email:', credentials.email);
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    });

    if (error) {
      console.error('AuthService: Supabase login error:', error.message);
      return { success: false, error: error.message };
    }

    if (data.session) {
      this.authToken = data.session.access_token;
      this._isAuthenticated.next(true);
      console.log('AuthService: Login successful.');
      return { success: true, error: null };
    }
    console.error('AuthService: Unknown login error, no session data.');
    return { success: false, error: 'Unknown login error' };
  }

  async logout(): Promise<void> {
    console.log('AuthService: Attempting logout.');
    const { error } = await this.supabase.auth.signOut();
    if (error) {
      console.error('AuthService: Supabase logout error:', error.message);
    } else {
      this.authToken = null;
      this._isAuthenticated.next(false);
      console.log('AuthService: Logout successful.');
    }
  }

  getToken(): string | null {
    return this.authToken;
  }

  getCurrentUser(): Observable<User | null> {
    return from(this.supabase.auth.getUser()).pipe(
      map((response: { data: { user: User | null } }) => response.data.user), // Explicitly type response
      catchError((err: any) => { // Explicitly type err
        console.error('Error getting current user:', err);
        return of(null);
      })
    );
  }
}