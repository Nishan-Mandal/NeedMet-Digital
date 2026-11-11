import { useState, useEffect } from "react";
import useAuth from "../../../../hooks/useAuth";
import ActionHeader from "../../../components/ActionHeader";
import CashCodeTableSection from "../Sections/CashCodeTableSection";
import CashCodeCreateModal from "../Sections/CashCodeCreateModal";
import CashCodeRevokeModal from "../Sections/CashCodeRevokeModal";
import CashCodeAuditModal from "../Sections/CashCodeAuditModal";
import CashCodeEditModal from "../Sections/CashCodeEditModal";
import CashCodeDeleteModal from "../Sections/CashCodeDeleteModal";
import {
  useCashCodesQuery,
  useCashCodeCountsQuery,
  useCashCodeMutations,
} from "../../../hooks/queries/useCashCodesQuery";
import { CheckCircle2, AlertCircle, X } from "lucide-react";

export default function ManageCashCodes() {
  const { currentUser, userData } = useAuth();

  // Query & Pagination states
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [pageIndex, setPageIndex] = useState(0);
  const [cursorStack, setCursorStack] = useState([null]); // cursorStack[0] is always null (first page)

  // Debounce search input to avoid querying on every keystroke
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
    }, 350);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Reset pagination when search or status filter changes
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

  // Active cursor for the current page
  const currentCursor = cursorStack[pageIndex] || null;

  // TanStack Query for cursor-paginated Cash Codes
  const {
    data: queryResult,
    isLoading: isQueryLoading,
    isFetching,
    refetch,
    error: queryError,
  } = useCashCodesQuery({
    status: statusFilter,
    search: debouncedSearch,
    pageSize,
    cursor: currentCursor,
  });

  // Query for server-side counts
  const { data: countsData } = useCashCodeCountsQuery();

  // TanStack Mutations with automatic cache invalidation
  const { issueMutation, updateMutation, revokeMutation, deleteMutation } =
    useCashCodeMutations();

  const cashCodes = queryResult?.codes || [];
  const hasNextPage = Boolean(queryResult?.hasMore);
  const hasPreviousPage = pageIndex > 0;

  // Modals state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [revokeModalOpen, setRevokeModalOpen] = useState(false);
  const [auditModalCode, setAuditModalCode] = useState(null);
  const [selectedCode, setSelectedCode] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedCodeToEdit, setSelectedCodeToEdit] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedCodeToDelete, setSelectedCodeToDelete] = useState(null);

  // Form & Feedback states
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [revokeReason, setRevokeReason] = useState("");

  const [formData, setFormData] = useState({
    code: "",
    amount: 500,
    validityDays: 30,
  });

  const generateRandomCode = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let result = "NM-";
    for (let i = 0; i < 4; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    result += "-";
    for (let i = 0; i < 4; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

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
    setFormData({
      code: generateRandomCode(),
      amount: 500,
      validityDays: 30,
    });
    setCreateModalOpen(true);
  };

  const handleOpenRevoke = (codeItem) => {
    setSelectedCode(codeItem);
    setRevokeReason("");
    setRevokeModalOpen(true);
  };

  const handleOpenEdit = (codeItem) => {
    setSelectedCodeToEdit(codeItem);
    setEditModalOpen(true);
  };

  const handleEditSubmit = async (updateData) => {
    if (!selectedCodeToEdit) return;
    setErrorMsg("");

    try {
      await updateMutation.mutateAsync({
        id: selectedCodeToEdit.id,
        data: updateData,
      });
      setSuccessMsg(
        `Cash code ${updateData.code || selectedCodeToEdit.code} updated successfully.`
      );
      setEditModalOpen(false);
    } catch (err) {
      console.error("Edit cash code error:", err);
      setErrorMsg(err.message || "Failed to update cash code.");
    }
  };

  const handleOpenDelete = (codeItem) => {
    setSelectedCodeToDelete(codeItem);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedCodeToDelete) return;
    setErrorMsg("");

    try {
      await deleteMutation.mutateAsync(selectedCodeToDelete.id);
      setSuccessMsg(
        `Cash code ${selectedCodeToDelete.code} has been deleted permanently.`
      );
      setDeleteModalOpen(false);
    } catch (err) {
      console.error("Delete cash code error:", err);
      setErrorMsg(err.message || "Failed to delete cash code.");
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    const creatorName =
      userData?.fullName ||
      userData?.name ||
      currentUser?.displayName ||
      currentUser?.phoneNumber ||
      currentUser?.email ||
      "Admin User";
    const creatorUid = currentUser?.uid || "admin";

    try {
      await issueMutation.mutateAsync({
        code: formData.code,
        amount: formData.amount,
        validityDays: formData.validityDays,
        createdBy: creatorName,
        createdById: creatorUid,
      });
      setSuccessMsg(`Cash code ${formData.code} created and activated.`);
      setCreateModalOpen(false);
      setPageIndex(0);
      setCursorStack([null]);
    } catch (err) {
      console.error("Issue cash code error:", err);
      setErrorMsg(err.message || "Failed to issue cash code.");
    }
  };

  const handleRevokeSubmit = async (e) => {
    e.preventDefault();
    if (!revokeReason.trim()) {
      setErrorMsg("Please specify a reason for revocation.");
      return;
    }

    setErrorMsg("");

    try {
      await revokeMutation.mutateAsync({
        id: selectedCode.id,
        reason: revokeReason,
      });
      setSuccessMsg(
        `Cash code ${selectedCode.code} has been permanently revoked.`
      );
      setRevokeModalOpen(false);
    } catch (err) {
      console.error("Revoke error:", err);
      setErrorMsg(err.message || "Failed to revoke cash code.");
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setSuccessMsg(`Copied "${text}" to clipboard.`);
    setTimeout(() => setSuccessMsg(""), 2500);
  };

  // Filter tabs with server count aggregates
  const filterTabs = [
    {
      label: "All Codes",
      value: "all",
      count: countsData?.total ?? cashCodes.length,
    },
    {
      label: "Active",
      value: "active",
      count: countsData?.active ?? "-",
    },
    {
      label: "Redeemed",
      value: "redeemed",
      count: countsData?.redeemed ?? "-",
    },
    {
      label: "Revoked",
      value: "revoked",
      count: countsData?.revoked ?? "-",
    },
  ];

  const actionLoading =
    issueMutation.isPending ||
    updateMutation.isPending ||
    revokeMutation.isPending ||
    deleteMutation.isPending;

  return (
    <div className="space-y-6 w-full font-primary">
      {/* Unified Action & Filter Toolbar */}
      <ActionHeader
        filters={filterTabs}
        activeFilter={statusFilter}
        onFilterChange={handleStatusChange}
        searchPlaceholder="Search cash code prefix (e.g. NM-)..."
        searchValue={searchQuery}
        onSearchChange={handleSearchChange}
        onRefresh={() => refetch()}
        refreshing={isFetching}
        actionLabel="Issue Cash Code"
        onActionClick={handleOpenCreate}
      />

      {/* Alerts */}
      {(errorMsg || queryError) && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200/60 text-red-700 text-sm flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2">
            <AlertCircle size={16} />
            <span>{errorMsg || queryError?.message || "Failed to load cash codes."}</span>
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

      {/* Cash Codes Table Section with Server-Side Pagination */}
      <CashCodeTableSection
        loading={isQueryLoading}
        codes={cashCodes}
        searchQuery={debouncedSearch}
        onCopy={copyToClipboard}
        onOpenDetails={(code) => setAuditModalCode(code)}
        onOpenAudit={(code) => setAuditModalCode(code)}
        onOpenEdit={handleOpenEdit}
        onOpenDelete={handleOpenDelete}
        onOpenRevoke={handleOpenRevoke}
        currentPage={pageIndex + 1}
        pageSize={pageSize}
        hasPreviousPage={hasPreviousPage}
        hasNextPage={hasNextPage}
        onPreviousPage={handlePreviousPage}
        onNextPage={handleNextPage}
        totalItems={countsData?.total ?? null}
        onPageSizeChange={handlePageSizeChange}
      />

      {/* Modal: Create Cash Code */}
      <CashCodeCreateModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSubmit={handleCreateSubmit}
        formData={formData}
        setFormData={setFormData}
        actionLoading={actionLoading}
        onRegenerateCode={() =>
          setFormData({ ...formData, code: generateRandomCode() })
        }
      />

      {/* Modal: Edit Cash Code */}
      <CashCodeEditModal
        isOpen={editModalOpen}
        codeItem={selectedCodeToEdit}
        onClose={() => setEditModalOpen(false)}
        onSubmit={handleEditSubmit}
        actionLoading={actionLoading}
      />

      {/* Modal: Delete Cash Code */}
      <CashCodeDeleteModal
        isOpen={deleteModalOpen}
        codeItem={selectedCodeToDelete}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        actionLoading={actionLoading}
      />

      {/* Modal: Revoke Code */}
      <CashCodeRevokeModal
        isOpen={revokeModalOpen}
        codeItem={selectedCode}
        onClose={() => setRevokeModalOpen(false)}
        onSubmit={handleRevokeSubmit}
        reason={revokeReason}
        setReason={setRevokeReason}
        actionLoading={actionLoading}
      />

      {/* Modal: Code Details Viewer */}
      <CashCodeAuditModal
        codeItem={auditModalCode}
        onClose={() => setAuditModalCode(null)}
      />
    </div>
  );
}
