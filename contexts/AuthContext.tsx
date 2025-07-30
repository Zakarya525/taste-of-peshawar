import React, { createContext, useContext, useEffect, useState } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase, Branch, BranchUser } from "../lib/supabase";
import * as Haptics from "expo-haptics";

interface AuthContextType {
  session: Session | null;
  user: User | null;
  branchUser: BranchUser | null;
  branch: Branch | null;
  loading: boolean;
  signIn: (
    email: string,
    password: string,
    branchName: "Cardiff" | "Wembley"
  ) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  refreshBranchUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [branchUser, setBranchUser] = useState<BranchUser | null>(null);
  const [branch, setBranch] = useState<Branch | null>(null);
  const [loading, setLoading] = useState(true);

  // Remove development mode bypass - always use real authentication
  const bypassAuth = false;

  useEffect(() => {
    // Always use real authentication
    if (bypassAuth) {
      console.log("Authentication bypass disabled - using real auth");
      setLoading(false);
      return;
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        await fetchBranchUser(session.user.id);
      } else {
        setBranchUser(null);
        setBranch(null);
      }

      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [bypassAuth]);

  const fetchBranchUser = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("branch_users")
        .select(
          `
          *,
          branches (*)
        `
        )
        .eq("id", userId)
        .eq("is_active", true)
        .single();

      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }

      if (data) {
        setBranchUser(data);
        setBranch(data.branches);
      }
    } catch (error) {
      console.error("Error fetching branch user:", error);
      setBranchUser(null);
      setBranch(null);
    }
  };

  const signIn = async (
    email: string,
    password: string,
    branchName: "Cardiff" | "Wembley"
  ) => {
    try {
      setLoading(true);

      // Always use real authentication - no bypass
      if (bypassAuth) {
        throw new Error(
          "Authentication bypass is disabled. Please configure Supabase properly."
        );
      }

      // First, sign in the user
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;

      if (!user) {
        throw new Error("No user returned from authentication");
      }

      // Fetch branch user data
      await fetchBranchUser(user.id);

      // Verify user belongs to the selected branch
      if (branchUser && branch?.name !== branchName) {
        await supabase.auth.signOut();
        throw new Error(`User is not authorized for ${branchName} branch`);
      }

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      return { error: null };
    } catch (error: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      await supabase.auth.signOut();
      setBranchUser(null);
      setBranch(null);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error("Error signing out:", error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setLoading(false);
    }
  };

  const refreshBranchUser = async () => {
    if (user) {
      await fetchBranchUser(user.id);
    }
  };

  const value: AuthContextType = {
    session,
    user,
    branchUser,
    branch,
    loading,
    signIn,
    signOut,
    refreshBranchUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
