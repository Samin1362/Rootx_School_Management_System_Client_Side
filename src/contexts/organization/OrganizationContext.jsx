import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import useAuth from "../../hooks/useAuth";
import useAxiosSecure from "../../hooks/useAxiosSecure";

const OrganizationContext = createContext();

const POLLING_INTERVAL = 60000;

export const OrganizationProvider = ({ children }) => {
  const { user, dbUser, isSuperAdmin, organizationId, dbUserLoading } =
    useAuth();
  const axiosSecure = useAxiosSecure();

  const [organization, setOrganization] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const pollingRef = useRef(null);
  const previousSubscriptionRef = useRef(null);

  const detectSubscriptionChanges = useCallback(
    (newSubscription) => {
      const prev = previousSubscriptionRef.current;
      if (!prev || !newSubscription) {
        previousSubscriptionRef.current = newSubscription;
        return;
      }

      const changes = {};
      if (prev.tier !== newSubscription.tier)
        changes.tier = {
          from: prev.tier,
          to: newSubscription.tier,
        };
      if (prev.status !== newSubscription.status)
        changes.status = {
          from: prev.status,
          to: newSubscription.status,
        };

      if (Object.keys(changes).length > 0) {
        window.dispatchEvent(
          new CustomEvent("subscription-updated", {
            detail: { changes, subscription: newSubscription },
          })
        );
      }

      previousSubscriptionRef.current = newSubscription;
    },
    []
  );

  const fetchOrganizationData = useCallback(
    async (orgId, isBackgroundRefresh = false) => {
      if (!orgId) return;

      try {
        if (!isBackgroundRefresh) {
          setLoading(true);
        } else {
          setIsRefreshing(true);
        }
        setError(null);

        const [orgResponse, subResponse] = await Promise.allSettled([
          axiosSecure.get(`/organizations/${orgId}`),
          axiosSecure.get(`/subscriptions/organization/${orgId}`),
        ]);

        if (orgResponse.status === "fulfilled" && orgResponse.value.data.success) {
          setOrganization(orgResponse.value.data.data);
        }

        if (subResponse.status === "fulfilled" && subResponse.value.data.success) {
          const newSub = subResponse.value.data.data;
          setSubscription(newSub);
          if (isBackgroundRefresh) {
            detectSubscriptionChanges(newSub);
          } else {
            previousSubscriptionRef.current = newSub;
          }
        }

        setLastUpdate(new Date());
      } catch (err) {
        if (!isBackgroundRefresh) {
          setError(err.message);
        }
      } finally {
        setLoading(false);
        setIsRefreshing(false);
      }
    },
    [axiosSecure, detectSubscriptionChanges]
  );

  const startPolling = useCallback(() => {
    if (pollingRef.current) clearInterval(pollingRef.current);

    pollingRef.current = setInterval(() => {
      if (document.visibilityState === "visible" && organizationId) {
        fetchOrganizationData(organizationId, true);
      }
    }, POLLING_INTERVAL);
  }, [organizationId, fetchOrganizationData]);

  const stopPolling = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (dbUserLoading) return;

    if (!user || !dbUser || isSuperAdmin) {
      setOrganization(null);
      setSubscription(null);
      setLoading(false);
      stopPolling();
      return;
    }

    if (organizationId) {
      fetchOrganizationData(organizationId);
      startPolling();
    } else {
      setLoading(false);
    }

    return () => stopPolling();
  }, [
    user,
    dbUser,
    organizationId,
    isSuperAdmin,
    dbUserLoading,
    fetchOrganizationData,
    startPolling,
    stopPolling,
  ]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (
        document.visibilityState === "visible" &&
        organizationId &&
        !isSuperAdmin
      ) {
        fetchOrganizationData(organizationId, true);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange
      );
  }, [organizationId, isSuperAdmin, fetchOrganizationData]);

  const refreshOrganization = useCallback(() => {
    if (organizationId) {
      return fetchOrganizationData(organizationId, true);
    }
  }, [organizationId, fetchOrganizationData]);

  const value = {
    organization,
    subscription,
    loading,
    error,
    refreshOrganization,
    organizationId,
    lastUpdate,
    isRefreshing,
  };

  return (
    <OrganizationContext.Provider value={value}>
      {children}
    </OrganizationContext.Provider>
  );
};

export const useOrganization = () => {
  const context = useContext(OrganizationContext);
  if (!context) {
    throw new Error(
      "useOrganization must be used within an OrganizationProvider"
    );
  }
  return context;
};

export default OrganizationContext;
