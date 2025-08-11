import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AlertTriangle, BarChart, UserCheck } from "lucide-react";

export type NotificationItem = {
  id: string;
  type: "registration" | "security" | "milestone";
  title: string;
  description: string;
  time: string;
  isRead: boolean;
  icon: any;
  iconColor: string;
  iconBgColor: string;
};

function toTime(ts?: string | null) {
  const d = ts ? new Date(ts) : new Date();
  return d.toLocaleString();
}

export function useRealtimeNotifications() {
  const [items, setItems] = useState<NotificationItem[]>([]);
  const readRef = useRef<Set<string>>(new Set());
  const fetchingRef = useRef(false);

  const upsert = (list: NotificationItem[]) => {
    // preserve read state
    const next = list.map((n) => ({ ...n, isRead: readRef.current.has(n.id) || n.isRead }));
    setItems(next);
  };

  const fetchInitial = async () => {
    if (fetchingRef.current) return;
    fetchingRef.current = true;
    try {
      // Recent security alerts
      const { data: alerts } = await supabase
        .from("security_alerts")
        .select("id, type, details, user_email, user_phone, timestamp")
        .order("timestamp", { ascending: false })
        .limit(50);

      // Recent registrations (users)
      const { data: users } = await supabase
        .from("users")
        .select("id, email, phone_number, created_at")
        .order("created_at", { ascending: false })
        .limit(50);

      const alertItems: NotificationItem[] =
        alerts?.map((a) => ({
          id: `sec-${a.id}`,
          type: "security",
          title: "Security Alert",
          description:
            (a.details && typeof a.details === "object" && (a.details as any).message) ||
            `Alert for ${a.user_email || a.user_phone || "Unknown user"}`,
          time: toTime(a.timestamp as any),
          isRead: false,
          icon: AlertTriangle,
          iconColor: "text-amber-500",
          iconBgColor: "bg-amber-100",
        })) || [];

      const userItems: NotificationItem[] =
        users?.map((u) => ({
          id: `reg-${u.id}`,
          type: "registration",
          title: "New Voter Registered",
          description: u.email || u.phone_number || "New registration",
          time: toTime(u.created_at as any),
          isRead: false,
          icon: UserCheck,
          iconColor: "text-green-500",
          iconBgColor: "bg-green-100",
        })) || [];

      // No milestone persistence in DB; we keep it simple and omit auto milestones
      upsert([...alertItems, ...userItems].sort((a, b) => +new Date(b.time) - +new Date(a.time)));
    } catch (e) {
      console.error("[useRealtimeNotifications] fetch error", e);
    } finally {
      fetchingRef.current = false;
    }
  };

  useEffect(() => {
    fetchInitial();

    const channel = supabase
      .channel("realtime-notifications")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "security_alerts" }, (payload) => {
        const a: any = payload.new;
        const item: NotificationItem = {
          id: `sec-${a.id}`,
          type: "security",
          title: "Security Alert",
          description:
            (a.details && typeof a.details === "object" && (a.details as any).message) ||
            `Alert for ${a.user_email || a.user_phone || "Unknown user"}`,
          time: toTime(a.timestamp),
          isRead: false,
          icon: AlertTriangle,
          iconColor: "text-amber-500",
          iconBgColor: "bg-amber-100",
        };
        setItems((prev) => [item, ...prev]);
      })
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "users" }, (payload) => {
        const u: any = payload.new;
        const item: NotificationItem = {
          id: `reg-${u.id}`,
          type: "registration",
          title: "New Voter Registered",
          description: u.email || u.phone_number || "New registration",
          time: toTime(u.created_at),
          isRead: false,
          icon: UserCheck,
          iconColor: "text-green-500",
          iconBgColor: "bg-green-100",
        };
        setItems((prev) => [item, ...prev]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const markAsRead = (id: string) => {
    readRef.current.add(id);
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
  };

  const deleteItem = (id: string) => {
    readRef.current.delete(id);
    setItems((prev) => prev.filter((n) => n.id !== id));
  };

  return useMemo(
    () => ({
      notifications: items,
      markAsRead,
      deleteNotification: deleteItem,
    }),
    [items]
  );
}
