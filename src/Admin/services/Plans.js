import {
  fetchAdminPlans,
  fetchAdminPlansPaginated,
  fetchAdminPlansMetrics,
  saveCustomPlan,
  publishPlan,
  archivePlan,
  deletePlan,
} from "../../services/db";

const getPlans = async (status = "all") => {
  try {
    const allPlans = await fetchAdminPlans();
    let filtered = allPlans;
    if (status && status !== "all") {
      filtered = allPlans.filter((p) => p.status === status);
    }
    return { success: true, plans: filtered };
  } catch (err) {
    console.error("Error in getPlans from services:", err);
    throw err;
  }
};

const createPlan = async (planData, currentUser = null) => {
  try {
    const saved = await saveCustomPlan(planData, null, currentUser);
    return { success: true, plan: saved };
  } catch (err) {
    console.error("Error in createPlan:", err);
    throw err;
  }
};

const updatePlan = async (id, planData, currentUser = null) => {
  try {
    const updated = await saveCustomPlan(planData, id, currentUser);
    return { success: true, plan: updated };
  } catch (err) {
    console.error("Error in updatePlan:", err);
    throw err;
  }
};

const togglePlanStatus = async (id, status, currentUser = null) => {
  try {
    if (status === "archived") {
      await archivePlan(id, currentUser);
    } else {
      await publishPlan(id, currentUser);
    }
    return { success: true, status };
  } catch (err) {
    console.error("Error in togglePlanStatus:", err);
    throw err;
  }
};

export {
  getPlans,
  fetchAdminPlansPaginated,
  fetchAdminPlansMetrics,
  createPlan,
  updatePlan,
  togglePlanStatus,
  archivePlan,
  deletePlan,
};
export default {
  getPlans,
  fetchAdminPlansPaginated,
  fetchAdminPlansMetrics,
  createPlan,
  updatePlan,
  togglePlanStatus,
  archivePlan,
  deletePlan,
};

