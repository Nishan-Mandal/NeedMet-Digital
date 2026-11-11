import { useState, useEffect } from "react";
import ActionHeader from "../../../components/ActionHeader";
import CouponTableSection from "../Sections/CouponTableSection";
import CouponFormModal from "../Sections/CouponFormModal";
import CouponDetailsModal from "../Sections/CouponDetailsModal";
import CouponDeleteModal from "../Sections/CouponDeleteModal";
import {
  useCouponsQuery,
  useCouponCountsQuery,
  useCouponMutations,
} from "../../../hooks/queries/useCouponsQuery";
import { CheckCircle2, AlertCircle, X } from "lucide-react";

export default function Coupons() {
  // Query & Pagination states
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [pageIndex, setPageIndex] = useState(0);
  const [cursorStack, setCursorStack] = useState([null]); // cursorStack[0] is null (first page)

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
    }, 350);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Reset pagination on filter change
  const handleStatusChange = (newStatus) => {
    setStatusFilter(newStatus);
    setPageIndex(0);
    setCursorStack([null]);
  };

  const handleSearchChange = (val) => {
    setSearchQuery(val);
    setPageIndex(0);
    setCursorStack([null]);
  };

  const handlePageSizeChange = (newSize) => {
    setPageSize(newSize);
    setPageIndex(0);
    setCursorStack([null]);
  };

  const currentCursor = cursorStack[pageIndex] || null;

  // TanStack Query for cursor-paginated coupons
  const {
    data: queryResult,
    isLoading: isQueryLoading,
    isFetching,
    refetch,
    error: queryError,
  } = useCouponsQuery({
    status: statusFilter,
    search: debouncedSearch,
    pageSize,
    cursor: currentCursor,
  });

  const { data: countsData } = useCouponCountsQuery();
  const { createMutation, updateMutation, deleteMutation, toggleStatusMutation } =
    useCouponMutations();

  const coupons = queryResult?.coupons || [];
  const hasNextPage = Boolean(queryResult?.hasMore);
  const hasPreviousPage = pageIndex > 0;

  // Modals state
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [detailsCoupon, setDetailsCoupon] = useState(null);
  const [deleteCoupon, setDeleteCoupon] = useState(null);

  // Form & Feedback states
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [formData, setFormData] = useState({
    code: "",
    discountType: "percentage",
    discountValue: 10,
    minOrderAmount: 0,
    maxDiscountAmount: 0,
    usageLimit: 100,
    expiresAt: "",
    status: "active",
  });

  // Pagination navigation handlers
  const handleNextPage = () => {
    if (hasNextPage && queryResult?.lastDoc) {
      setCursorStack((prev) => {
        const next = [...prev];
        next[pageIndex + 1] = queryResult.lastDoc;
        return next;
      });
      setPageIndex((prev) => prev + 1);
    }
  };

  const handlePreviousPage = () => {
    if (pageIndex > 0) {
      setPageIndex((prev) => prev - 1);
    }
  };

  const handleOpenCreate = () => {
    setEditingCoupon(null);
    setFormData({
      code: "",
      discountType: "percentage",
      discountValue: 10,
      minOrderAmount: 0,
      maxDiscountAmount: 0,
      usageLimit: 100,
      expiresAt: "",
      status: "active",
    });
    setFormModalOpen(true);
  };

  const handleOpenEdit = (coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code || "",
      discountType: coupon.discountType || "percentage",
      discountValue: Number(coupon.discountValue || 0),
      minOrderAmount: Number(coupon.minOrderAmount || 0),
      maxDiscountAmount: Number(coupon.maxDiscountAmount || 0),
      usageLimit: Number(coupon.usageLimit || 100),
      expiresAt: coupon.expiresAt ? String(coupon.expiresAt).trim() : "",
      status: coupon.status || "active",
    });
    setFormModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    try {
      if (editingCoupon) {
        await updateMutation.mutateAsync({
          id: editingCoupon.id,
          data: formData,
        });
        setSuccessMsg(`Coupon "${formData.code}" updated successfully.`);
      } else {
        await createMutation.mutateAsync(formData);
        setSuccessMsg(`Coupon "${formData.code}" created and activated.`);
        setPageIndex(0);
        setCursorStack([null]);
      }
      setFormModalOpen(false);
    } catch (err) {
      console.error("Coupon submit error:", err);
      setErrorMsg(err.message || "Failed to save coupon.");
    }
  };

  const handleToggleStatus = async (coupon) => {
    setErrorMsg("");
    try {
      const res = await toggleStatusMutation.mutateAsync({
        id: coupon.id,
        currentStatus: coupon.status,
      });
      setSuccessMsg(`Coupon "${coupon.code}" is now ${res?.status || "updated"}.`);
    } catch (err) {
      console.error("Toggle error:", err);
      setErrorMsg(err.message || "Failed to update coupon status.");
    }
  };

  const handleOpenDelete = (coupon) => {
    setDeleteCoupon(coupon);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteCoupon) return;
    setErrorMsg("");

    try {
      await deleteMutation.mutateAsync(deleteCoupon.id);
      setSuccessMsg(`Coupon "${deleteCoupon.code}" deleted permanently.`);
      setDeleteCoupon(null);
    } catch (err) {
      console.error("Delete error:", err);
      setErrorMsg(err.message || "Failed to delete coupon.");
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setSuccessMsg(`Copied "${text}" to clipboard.`);
    setTimeout(() => setSuccessMsg(""), 2500);
  };

  // Filter tabs with server-side counts
  const filterTabs = [
    {
      label: "All Coupons",
      value: "all",
      count: countsData?.total ?? coupons.length,
    },
    {
      label: "Active",
      value: "active",
      count: countsData?.active ?? "-",
    },
    {
      label: "Inactive",
      value: "inactive",
      count: countsData?.inactive ?? "-",
    },
    {
      label: "Expired",
      value: "expired",
      count: "-",
    },
    {
      label: "Exhausted",
      value: "exhausted",
      count: "-",
    },
  ];

  const actionLoading =
    createMutation.isPending ||
    updateMutation.isPending ||
    deleteMutation.isPending ||
    toggleStatusMutation.isPending;

  return (
    <div className="space-y-6 w-full font-primary">
      {/* Unified Action & Filter Toolbar */}
      <ActionHeader
        filters={filterTabs}
        activeFilter={statusFilter}
        onFilterChange={handleStatusChange}
        searchPlaceholder="Search coupon code..."
        searchValue={searchQuery}
        onSearchChange={handleSearchChange}
        onRefresh={() => refetch()}
        refreshing={isFetching}
        actionLabel="Add Coupon"
        onActionClick={handleOpenCreate}
      />

      {/* Alerts */}
      {(errorMsg || queryError) && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200/60 text-red-700 text-sm flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2">
            <AlertCircle size={16} />
            <span>{errorMsg || queryError?.message || "Failed to load coupons."}</span>
          </div>
          <button
            type="button"
            onClick={() => setErrorMsg("")}
            className="text-red-700 hover:text-red-900 cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {successMsg && (
        <div className="p-4 rounded-xl bg-[#e8f5ee] border border-[#d1fae5]/70 text-[#0f5c3e] text-sm flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} />
            <span>{successMsg}</span>
          </div>
          <button
            type="button"
            onClick={() => setSuccessMsg("")}
            className="text-[#0f5c3e] hover:opacity-75 cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Coupon Table Section with Server-Side Pagination */}
      <CouponTableSection
        loading={isQueryLoading}
        coupons={coupons}
        searchQuery={debouncedSearch}
        onCopy={copyToClipboard}
        onOpenDetails={(coupon) => setDetailsCoupon(coupon)}
        onOpenEdit={handleOpenEdit}
        onToggleStatus={handleToggleStatus}
        onOpenDelete={handleOpenDelete}
        currentPage={pageIndex + 1}
        pageSize={pageSize}
        hasPreviousPage={hasPreviousPage}
        hasNextPage={hasNextPage}
        onPreviousPage={handlePreviousPage}
        onNextPage={handleNextPage}
        totalItems={countsData?.total ?? null}
        onPageSizeChange={handlePageSizeChange}
      />

      {/* Modal: Create / Edit Coupon */}
      <CouponFormModal
        isOpen={formModalOpen}
        onClose={() => setFormModalOpen(false)}
        onSubmit={handleFormSubmit}
        formData={formData}
        setFormData={setFormData}
        isEditMode={Boolean(editingCoupon)}
        actionLoading={actionLoading}
      />

      {/* Modal: View Coupon Details */}
      <CouponDetailsModal
        isOpen={Boolean(detailsCoupon)}
        coupon={detailsCoupon}
        onClose={() => setDetailsCoupon(null)}
      />

      {/* Modal: Confirm Delete */}
      <CouponDeleteModal
        isOpen={Boolean(deleteCoupon)}
        coupon={deleteCoupon}
        onClose={() => setDeleteCoupon(null)}
        onConfirm={handleDeleteConfirm}
        actionLoading={actionLoading}
      />
    </div>
  );
}
