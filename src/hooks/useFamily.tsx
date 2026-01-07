import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface Family {
  id: string;
  name: string;
  invite_code: string;
  created_at: string;
  created_by: string;
}

export interface FamilyMember {
  id: string;
  family_id: string;
  user_id: string;
  name: string;
  role: "admin" | "member" | "pet";
  email: string | null;
  phone: string | null;
  avatar_url: string | null;
  created_at: string;
}

export interface JoinRequest {
  id: string;
  family_id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  responded_at: string | null;
  responded_by: string | null;
}

export function useFamily() {
  const { user } = useAuth();
  const [family, setFamily] = useState<Family | null>(null);
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [joinRequests, setJoinRequests] = useState<JoinRequest[]>([]);
  const [pendingRequest, setPendingRequest] = useState<JoinRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasFamily, setHasFamily] = useState<boolean | null>(null);

  useEffect(() => {
    if (user) {
      fetchFamily();
    } else {
      setLoading(false);
      setHasFamily(null);
    }
  }, [user]);

  const fetchFamily = async () => {
    if (!user) return;

    try {
      // Check if user is member of any family
      const { data: memberData, error: memberError } = await supabase
        .from("family_members")
        .select("family_id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (memberError) throw memberError;

      if (memberData) {
        // User is in a family
        const { data: familyData, error: familyError } = await supabase
          .from("families")
          .select("*")
          .eq("id", memberData.family_id)
          .single();

        if (familyError) throw familyError;

        setFamily(familyData as Family);
        setHasFamily(true);

        // Get family members
        const { data: membersData, error: membersError } = await supabase
          .from("family_members")
          .select("*")
          .eq("family_id", memberData.family_id);

        if (membersError) throw membersError;
        setMembers((membersData as FamilyMember[]) || []);

        // Get pending join requests (for admins)
        const { data: requestsData } = await supabase
          .from("join_requests")
          .select("*")
          .eq("family_id", memberData.family_id)
          .eq("status", "pending");

        setJoinRequests((requestsData as JoinRequest[]) || []);
      } else {
        // Check for pending requests
        const { data: pendingData } = await supabase
          .from("join_requests")
          .select("*")
          .eq("user_id", user.id)
          .eq("status", "pending")
          .maybeSingle();

        if (pendingData) {
          setPendingRequest(pendingData as JoinRequest);
          setHasFamily(null); // Keep in limbo state
        } else {
          setHasFamily(false);
        }

        setFamily(null);
        setMembers([]);
      }
    } catch (error) {
      console.error("Error fetching family:", error);
      setHasFamily(false);
    } finally {
      setLoading(false);
    }
  };

  const searchFamilyByCode = async (inviteCode: string) => {
    const { data, error } = await supabase
      .from("families")
      .select("id, name, invite_code")
      .eq("invite_code", inviteCode.toUpperCase().trim())
      .maybeSingle();

    if (error) throw error;
    return data as Pick<Family, "id" | "name" | "invite_code"> | null;
  };

  const requestToJoin = async (familyId: string, userName: string) => {
    if (!user) throw new Error("User not authenticated");

    const { data, error } = await supabase
      .from("join_requests")
      .insert({
        family_id: familyId,
        user_id: user.id,
        user_name: userName,
        user_email: user.email || "",
      })
      .select()
      .single();

    if (error) throw error;
    setPendingRequest(data as JoinRequest);
    return data;
  };

  const cancelRequest = async () => {
    if (!pendingRequest) return;

    const { error } = await supabase
      .from("join_requests")
      .delete()
      .eq("id", pendingRequest.id);

    if (error) throw error;
    setPendingRequest(null);
    setHasFamily(false);
  };

  const approveRequest = async (requestId: string) => {
    if (!user || !family) throw new Error("Not authorized");

    // Get the request
    const request = joinRequests.find((r) => r.id === requestId);
    if (!request) throw new Error("Request not found");

    // Update request status
    const { error: updateError } = await supabase
      .from("join_requests")
      .update({
        status: "approved",
        responded_at: new Date().toISOString(),
        responded_by: user.id,
      })
      .eq("id", requestId);

    if (updateError) throw updateError;

    // Add user as family member
    const { error: memberError } = await supabase
      .from("family_members")
      .insert({
        family_id: family.id,
        user_id: request.user_id,
        name: request.user_name,
        role: "member",
        email: request.user_email,
      });

    if (memberError) throw memberError;

    // Refresh data
    await fetchFamily();
  };

  const rejectRequest = async (requestId: string) => {
    if (!user) throw new Error("Not authorized");

    const { error } = await supabase
      .from("join_requests")
      .update({
        status: "rejected",
        responded_at: new Date().toISOString(),
        responded_by: user.id,
      })
      .eq("id", requestId);

    if (error) throw error;

    setJoinRequests((prev) => prev.filter((r) => r.id !== requestId));
  };

  const createFamily = async (familyName: string, memberName: string) => {
    if (!user) throw new Error("User not authenticated");

    // Create family
    const { data: newFamily, error: familyError } = await supabase
      .from("families")
      .insert({ name: familyName, created_by: user.id })
      .select()
      .single();

    if (familyError) throw familyError;

    // Add creator as admin member
    const { error: memberError } = await supabase
      .from("family_members")
      .insert({
        family_id: newFamily.id,
        user_id: user.id,
        name: memberName,
        role: "admin",
        email: user.email,
      });

    if (memberError) throw memberError;

    // Update profile with current family
    await supabase
      .from("profiles")
      .update({ current_family_id: newFamily.id })
      .eq("user_id", user.id);

    await fetchFamily();
    return newFamily;
  };

  const addMember = async (
    name: string,
    role: "admin" | "member" | "pet",
    email?: string,
    phone?: string
  ) => {
    if (!family) throw new Error("No family selected");

    const { data, error } = await supabase
      .from("family_members")
      .insert({
        family_id: family.id,
        user_id: crypto.randomUUID(), // Placeholder for non-user members
        name,
        role,
        email,
        phone,
      })
      .select()
      .single();

    if (error) throw error;

    setMembers((prev) => [...prev, data as FamilyMember]);
    return data;
  };

  const updateMember = async (memberId: string, updates: Partial<FamilyMember>) => {
    const { error } = await supabase
      .from("family_members")
      .update(updates)
      .eq("id", memberId);

    if (error) throw error;

    setMembers((prev) =>
      prev.map((m) => (m.id === memberId ? { ...m, ...updates } : m))
    );
  };

  const removeMember = async (memberId: string) => {
    const { error } = await supabase
      .from("family_members")
      .delete()
      .eq("id", memberId);

    if (error) throw error;

    setMembers((prev) => prev.filter((m) => m.id !== memberId));
  };

  const refetch = () => {
    setLoading(true);
    fetchFamily();
  };

  return {
    family,
    members,
    joinRequests,
    pendingRequest,
    loading,
    hasFamily,
    searchFamilyByCode,
    requestToJoin,
    cancelRequest,
    approveRequest,
    rejectRequest,
    createFamily,
    addMember,
    updateMember,
    removeMember,
    refetch,
    currentMember: members.find((m) => m.user_id === user?.id),
    isAdmin: members.find((m) => m.user_id === user?.id)?.role === "admin",
  };
}
