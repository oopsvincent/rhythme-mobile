import { supabase } from "@/lib/supabase";
import { AuthError, Provider, Session, User } from "@supabase/supabase-js";
import { makeRedirectUri } from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import React, {
    createContext,
    ReactNode,
    useContext,
    useEffect,
    useState,
} from "react";

// Complete any pending auth sessions
WebBrowser.maybeCompleteAuthSession();

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signInWithEmail: (
    email: string,
    password: string
  ) => Promise<{ error: AuthError | null }>;
  signUpWithEmail: (
    email: string,
    password: string
  ) => Promise<{ error: AuthError | null }>;
  signInWithOAuth: (provider: Provider) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signInWithEmail = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signUpWithEmail = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });
    return { error };
  };

  const signInWithOAuth = async (provider: Provider) => {
    try {
      // Create redirect URI
      // In Expo Go: uses exp:// scheme
      // In standalone/dev build: uses rhythme:// scheme
      const redirectUri = makeRedirectUri({
        scheme: "rhythme",
        path: "auth/callback",
        // This makes it work in Expo Go by using the proxy
        preferLocalhost: false,
      });

      console.log("OAuth redirect URI:", redirectUri);

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: redirectUri,
          skipBrowserRedirect: true,
        },
      });

      if (error) return { error };

      if (data?.url) {
        const result = await WebBrowser.openAuthSessionAsync(
          data.url,
          redirectUri
        );

        if (result.type === "success" && result.url) {
          // Parse the URL to extract tokens
          // The tokens can be in either the hash fragment or query params
          const url = result.url;
          
          let accessToken: string | null = null;
          let refreshToken: string | null = null;

          // Try hash fragment first (most common for OAuth)
          if (url.includes("#")) {
            const hashPart = url.split("#")[1];
            const params = new URLSearchParams(hashPart);
            accessToken = params.get("access_token");
            refreshToken = params.get("refresh_token");
          }

          // Fallback to query params
          if (!accessToken && url.includes("?")) {
            const queryPart = url.split("?")[1]?.split("#")[0];
            if (queryPart) {
              const params = new URLSearchParams(queryPart);
              accessToken = params.get("access_token");
              refreshToken = params.get("refresh_token");
            }
          }

          if (accessToken && refreshToken) {
            const { error: sessionError } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });
            if (sessionError) return { error: sessionError };
          } else {
            // If no tokens in URL, the session might already be set
            // Check if we have a session
            const { data: sessionData } = await supabase.auth.getSession();
            if (!sessionData.session) {
              return { error: { message: "Failed to get authentication tokens" } as AuthError };
            }
          }
        } else if (result.type === "cancel") {
          return { error: { message: "Authentication was cancelled" } as AuthError };
        }
      }

      return { error: null };
    } catch (error) {
      console.error("OAuth error:", error);
      return { error: error as AuthError };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isLoading,
        signInWithEmail,
        signUpWithEmail,
        signInWithOAuth,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
