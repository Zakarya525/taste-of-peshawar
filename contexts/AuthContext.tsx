import { Session, User } from "@supabase/supabase-js";
import * as Haptics from "expo-haptics";
import React, { createContext, useContext, useEffect, useState } from "react";
import { Branch, BranchUser, supabase } from "../lib/supabase";

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

    const initializeAuth = async () => {
      try {
        setLoading(true);

        // Get initial session
        const {
          data: { session },
        } = await supabase.auth.getSession();
        console.log(
          "Initial session check:",
          session ? "Found session" : "No session"
        );
        setSession(session);
        setUser(session?.user ?? null);

        // If we have a session, fetch branch user data
        if (session?.user) {
          console.log("Fetching branch user for:", session.user.email);
          await fetchBranchUser(session.user.id);
        } else {
          setBranchUser(null);
          setBranch(null);
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
        setSession(null);
        setUser(null);
        setBranchUser(null);
        setBranch(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state change:", event, session?.user?.email);

      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        console.log("Session user found, fetching branch user...");
        await fetchBranchUser(session.user.id);
      } else {
        console.log("No session user, clearing branch data");
        setBranchUser(null);
        setBranch(null);
      }
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
        console.log(
          "Branch user loaded:",
          data.full_name,
          "Branch:",
          data.branches.name
        );
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

      // Fetch branch user data directly to verify branch access
      const { data: branchUserData, error: branchError } = await supabase
        .from("branch_users")
        .select(
          `
          *,
          branches (*)
        `
        )
        .eq("id", user.id)
        .eq("is_active", true)
        .single();

      if (branchError) {
        await supabase.auth.signOut();
        throw new Error("User not found in branch system");
      }

      if (!branchUserData) {
        await supabase.auth.signOut();
        throw new Error("User not found in branch system");
      }

      // Verify user belongs to the selected branch
      if (branchUserData.branches.name !== branchName) {
        await supabase.auth.signOut();
        throw new Error(`User is not authorized for ${branchName} branch`);
      }

      // Update state with the fetched data
      setBranchUser(branchUserData);
      setBranch(branchUserData.branches);

      console.log("SignIn successful - Branch user set:", branchUserData.full_name);
      console.log("Branch set:", branchUserData.branches.name);

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
